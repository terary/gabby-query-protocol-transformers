import {
  TPredicateJunctionOperator,
  TPredicateOperator,
  TPredicateProperties,
  TPredicatePropertiesArrayValue,
  TPredicateSubjectWithId,
  PredicateFormulaEditor,
} from "gabby-query-protocol-lib";

const PRETTY = true;
const tabs = (tabCount: number, usePrettyPrint: boolean) => {
  if (!usePrettyPrint) {
    return " ";
  }
  return tabCount > 0 ? "\t".repeat(tabCount) : "";
};

const nl = (usePrettyPrint: boolean) => {
  if (!usePrettyPrint) {
    return "";
  }

  /* istanbul ignore next */
  return usePrettyPrint ? "\n" : " ";
};

type PredicateLeafItemType = TPredicateProperties | TPredicatePropertiesArrayValue;

type SqlOpMapType = {
  // not exported
  [op in TPredicateOperator]: string;
};

const predicateOperatorToSQL: SqlOpMapType = {
  $anyOf: "", // function IN(values,...)
  $eq: "=",
  $empty: "=",
  $gt: ">",
  $gte: ">=",
  $isNull: "IS",
  $like: "LIKE",
  $lt: "<",
  $lte: "<=",
  $oneOf: "=",
  $nanyOf: "", // function NOT IN(values,...)
  $ne: "!=",
};

const predicateItemToSQL = (
  predicate: PredicateLeafItemType,
  subject: TPredicateSubjectWithId
): string => {
  const valueAsSql = valueToSql(predicate, subject);

  return `${predicate.subjectId} ${
    predicateOperatorToSQL[predicate.operator]
  } ${valueAsSql}`;
};

const junctionOperatorToSql = (
  junctionOperator: TPredicateJunctionOperator
): [string, string] => {
  if (junctionOperator === "$nor") {
    return ["OR", "NOT"];
  }

  if (junctionOperator === "$nand") {
    return ["AND", "NOT"];
  }

  if (junctionOperator === "$and") {
    return ["AND", ""];
  }

  if (junctionOperator === "$or") {
    return ["OR", ""];
  }

  throw Error(`'${junctionOperator}' unknown Junction operator.`);
};

const valueToSql = (
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
      sqlValue = "NULL";
      break;
    case "$like":
      sqlValue = `'%${value}%'`;
      break;
    case "$empty":
      sqlValue = "''";
      break;
    case "$anyOf":
      sqlValue = `IN (${sqlValue})`;
      break;
    case "$nanyOf":
      sqlValue = `NOT IN (${sqlValue})`;
      break;
  }

  return sqlValue;
};

const _WhereMux = (
  predicateId: string,
  predicateEditor: PredicateFormulaEditor,
  tabCount = 0,
  usePrettyPrint = PRETTY
) => {
  if (predicateEditor.predicatesIsBranch(predicateId)) {
    const predicate = predicateEditor.predicatesGetJunctionById(predicateId);

    const [sqlJunctionOp, negation] = junctionOperatorToSql(
      predicate.operator as TPredicateJunctionOperator
    );

    const openTerm = `${negation}(${nl(usePrettyPrint)}`;
    const closeTerm = `${nl(usePrettyPrint)}${tabs(tabCount, usePrettyPrint)})`;

    const junctionStatements: string[] = predicateEditor
      .predicatesGetChildrenIds(predicateId)
      .map((childId) => {
        return _WhereMux(childId, predicateEditor, tabCount + 1, usePrettyPrint);
      });

    const compoundSQL =
      openTerm +
      tabs(tabCount + 1, usePrettyPrint) +
      junctionStatements.join(
        `${nl(usePrettyPrint)}${tabs(tabCount + 1, usePrettyPrint)}${sqlJunctionOp} `
      ) +
      closeTerm;

    return compoundSQL;
  } else {
    const predicate = predicateEditor.predicatesGetPropertiesById(predicateId);
    const subject = predicateEditor.subjectsGetById(predicate.subjectId);
    return predicateItemToSQL(predicate as PredicateLeafItemType, subject);
  }
};

export const Where = {
  getWhereAsSqlStringPretty: (predicateEditor: PredicateFormulaEditor): string => {
    return _WhereMux(predicateEditor.rootNodeId, predicateEditor);
  },
  getWhereAsSqlString: (predicateEditor: PredicateFormulaEditor): string => {
    return _WhereMux(predicateEditor.rootNodeId, predicateEditor, 0, !PRETTY);
  },
};
