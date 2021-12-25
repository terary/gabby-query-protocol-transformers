import {
  TPredicateJunctionOperator,
  TPredicateOperator,
  TPredicateProperties,
  TPredicatePropertiesArrayValue,
  TPredicateSubjectWithId,
  PredicateFormulaEditor,
  IVisitor,
} from "gabby-query-protocol-lib";

const PRETTY = true;
// const tabs = (tabCount: number, usePrettyPrint: boolean) => {
//   return tabCount > 0 ? "\t".repeat(tabCount) : " ";
// };

const tabs = (tabCount: number) => {
  return tabCount > 0 ? "\t".repeat(tabCount) : " ";
};

const nl = () => {
  return "\n";
  // return usePrettyPrint ? "\n" : " ";
};

type PredicateLeafItemType = TPredicateProperties | TPredicatePropertiesArrayValue;

type SqlOpMapType = {
  [op in TPredicateOperator]: string;
};

// with type safety??
const predicateOperatorToSQL: SqlOpMapType = {
  $anyOf: "", // function IN(values,...)
  $eq: "===",
  $empty: "===",
  $gt: ">",
  $gte: ">=",
  $isNull: "===",
  $like: "LIKE",
  $lt: "<",
  $lte: "<=",
  $oneOf: "===",
  $nanyOf: "", // function NOT IN(values,...)
  $ne: "!==",
};

const junctionOperatorToJavascript = (
  junctionOperator: TPredicateJunctionOperator
): [string, string] => {
  if (junctionOperator === "$nor") {
    return ["||", "!"];
  }

  if (junctionOperator === "$nand") {
    return ["&&", "!"];
  }

  if (junctionOperator === "$and") {
    return ["&&", ""];
  }

  return ["||", ""];
};
const predicateItemToJavascript = (
  predicate: PredicateLeafItemType,
  subject: TPredicateSubjectWithId
): string => {
  const valueAsSql = valueToJavascript(predicate, subject);

  if (predicate.operator === "$anyOf") {
    return `[${valueAsSql}].includes(${predicate.subjectId})`;
  }

  if (predicate.operator === "$nanyOf") {
    return `![${valueAsSql}].includes(${predicate.subjectId})`;
  }

  if (predicate.operator === "$like") {
    return `${predicate.subjectId}.includes(${valueAsSql})`;
  }

  return `${predicate.subjectId} ${
    predicateOperatorToSQL[predicate.operator]
  } ${valueAsSql}`;
};

const valueToJavascript = (
  predicate: PredicateLeafItemType,
  subject: TPredicateSubjectWithId
): string => {
  const { operator } = predicate;
  const { value } = predicate;

  let sqlValue = "";

  if (subject.datatype === "string" || subject.datatype === "datetime") {
    if (operator === "$anyOf" || operator === "$nanyOf") {
      sqlValue = (value as (string | number)[]).map((v) => `'${v}'`).join(", ");
    } else {
      sqlValue = `'${value}'`;
    }
  } else {
    if (operator === "$anyOf" || operator === "$nanyOf") {
      sqlValue = (value as (string | number)[]).map((v) => `${v}`).join(", ");
    } else {
      sqlValue = `${value}`;
    }
  }

  switch (operator) {
    case "$isNull":
      sqlValue = "null";
      break;
    case "$empty":
      sqlValue = "''";
      break;
  }

  return sqlValue;
};
const _matcherMux = (
  predicateId: string,
  predicateEditor: PredicateFormulaEditor,
  tabCount = 0
  //  usePrettyPrint = PRETTY
) => {
  if (predicateEditor.predicatesIsBranch(predicateId)) {
    const predicate = predicateEditor.predicatesGetJunctionById(predicateId);

    const [sqlJunctionOp, negation] = junctionOperatorToJavascript(
      predicate.operator as TPredicateJunctionOperator
    );

    /* istanbul ignore next */
    const openTerm =
      predicateId === predicateEditor.rootNodeId ? `${negation}` : `${negation}(${nl()}`;
    /* istanbul ignore next */
    const closeTerm =
      predicateId === predicateEditor.rootNodeId ? `; ` : `${nl()}${tabs(tabCount)})`;

    const junctionStatements: string[] = predicateEditor
      .predicatesGetChildrenIds(predicateId)
      .map((childId) => {
        return _matcherMux(childId, predicateEditor, tabCount + 1);
      });

    const compoundSQL =
      openTerm +
      tabs(tabCount + 1) +
      junctionStatements.join(`${nl()}${tabs(tabCount + 1)}${sqlJunctionOp} `) +
      closeTerm;

    return compoundSQL;
  } else {
    const predicate = predicateEditor.predicatesGetPropertiesById(predicateId);
    const subject = predicateEditor.subjectsGetById(predicate.subjectId);
    return predicateItemToJavascript(predicate as PredicateLeafItemType, subject);
  }
};

// IVisitorPredicateTree
const getUsedSubjectIds = (formulaEditor: PredicateFormulaEditor) => {
  const subjectIdCollection: { [subjectId: string]: string } = {};

  const iv: IVisitor<PredicateLeafItemType> = {
    visit: (parentId: string, nodeId: string, payload: PredicateLeafItemType) => {
      subjectIdCollection[payload.subjectId] = payload.subjectId;
    },
    nodeType: "leaf",
  };
  formulaEditor.predicatesAcceptVisitor(iv);

  return Object.keys(subjectIdCollection);
};

const getFunctionParameters = (predicateEditor: PredicateFormulaEditor) => {
  return getUsedSubjectIds(predicateEditor).sort();
};

const getFunctionBody = (predicateEditor: PredicateFormulaEditor) => {
  const parameters = getFunctionParameters(predicateEditor);
  const predicateExpression = _matcherMux(predicateEditor.rootNodeId, predicateEditor);

  // goofy alignment here to accommodate function pretty print
  return `
      const {${parameters.join(", ")}} =record ;
      return  ${predicateExpression}`;
};

export const jsConv = {
  matcherAsFastUnsafeFunction: (predicateEditor: PredicateFormulaEditor): Function => {
    const fnBody = getFunctionBody(predicateEditor);
    const fn = Function("record", fnBody);
    return fn;
  },
  matcherAsSlowSafeFunction: () => {},
};

export const untestable = {
  tabs,
};
