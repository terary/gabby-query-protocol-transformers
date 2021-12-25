import {
  PredicateFormulaEditor,
  TPredicatePropertiesArrayValue,
} from "gabby-query-protocol-lib";
import {
  simplePredicateToMongo,
  arrayValuePredicateToMongo,
  junctionOperatorToMongo,
} from "./transformers";

const simpleOperators = ["$eq", "$gt", "$gte", "$lt", "$lte", "$ne"];

const _expressionBranch = (
  predicateId: string,
  predicateFormula: PredicateFormulaEditor
): object => {
  const { operator, childrenIds } =
    predicateFormula.predicatesGetJunctionById(predicateId);
  // const childrenIds = predicateFormula.predicatesGetChildrenIds(predicateId);

  const childrenExpressions = childrenIds.map((childId) => {
    return _expressionMux(childId, predicateFormula);
  });
  return junctionOperatorToMongo(operator, ...childrenExpressions);
};
const _expressionLeaf = (
  predicateId: string,
  predicateFormula: PredicateFormulaEditor
): object => {
  const predicate = predicateFormula.predicatesGetPropertiesById(predicateId);
  const { operator, subjectId } = predicate;

  const subject = predicateFormula.subjectsGetById(subjectId);
  const { datatype } = subject;

  if (["$anyOf", "$nanyOf"].includes(operator)) {
    // *tmc*  what is going on here? How to get predicateArrayValue?
    return arrayValuePredicateToMongo(
      predicate as unknown as TPredicatePropertiesArrayValue,
      datatype
    );
  }
  return simplePredicateToMongo(predicate, datatype);
};

const _expressionMux = (
  predicateId: string,
  predicateFormula: PredicateFormulaEditor
): object => {
  // const predicate = predicateFormula.predicatesGetById(predicateId);
  if (predicateFormula.predicatesIsBranch(predicateId)) {
    return _expressionBranch(predicateId, predicateFormula);
  } else {
    return _expressionLeaf(predicateId, predicateFormula);
  }
};

const predicateTreeToMongoExpression = (
  predicateFormula: PredicateFormulaEditor
): object => {
  return _expressionMux(predicateFormula.rootNodeId, predicateFormula);
};

export { predicateTreeToMongoExpression };
