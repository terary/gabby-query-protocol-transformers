import { TPredicateOperator, TPredicateProperties } from "gabby-query-protocol-lib";
import { TSupportedDatatype } from "gabby-query-protocol-projection";
type SqlOpMapType = {
  [op in TPredicateOperator]: string;
};

type SimpleOpTypes = Exclude<TPredicateOperator, "$like" | "$anyOf" | "$nanyOf">;

type jsSimpleOpMapType = {
  [op in SimpleOpTypes]: string;
};
const simplePredicateOperatorToJs: jsSimpleOpMapType = {
  // $anyOf: "", // function IN(values,...)
  $eq: "===",
  $empty: "===", // this is for empty string which should be === ''
  $gt: ">",
  $gte: ">=",
  $isNull: "===",
  // $like: "LIKE", //like will be regular expression or?
  $lt: "<",
  $lte: "<=",
  $oneOf: "===",
  // $nanyOf: "", // function NOT IN(values,...)
  $ne: "!==",
};

// const predicateOperatorToSQL: SqlOpMapType = {
//   $anyOf: "", // function IN(values,...)
//   $eq: "===",
//   $empty: "===",
//   $gt: ">",
//   $gte: ">=",
//   $isNull: "===",
//   $like: "LIKE",
//   $lt: "<",
//   $lte: "<=",
//   $oneOf: "===",
//   $nanyOf: "", // function NOT IN(values,...)
//   $ne: "!==",
// };

const simpleTermExpression = (
  subjectId: string,
  operator: SimpleOpTypes,
  value: string | number
) => {
  return `${subjectId} ${simplePredicateOperatorToJs[operator]} ${value}`;
};

export const simplePredicateToJsExpression = (
  // subjectId: string,
  // operator: SimpleOpTypes,
  // value: string | number,
  predicate: TPredicateProperties,
  datatype: TSupportedDatatype
) => {
  if (["$like", "$anyOf", "$nanyOf"].includes(predicate.operator)) {
    throw new Error(
      '"$like", "$anyOf", "$nanyOf" are not supported by simplePredicateToJsExpression()'
    );
  }
  const quoteEnclosedValue =
    datatype === "datetime" || datatype === "string"
      ? `'${(predicate.value as string).replace(/'/g, "")}'`
      : predicate.value;

  return simpleTermExpression(
    predicate.subjectId,
    predicate.operator as SimpleOpTypes,
    quoteEnclosedValue
  );
};

export const functionBodyWrapper = (expression: string, ...parameters: string[]) => {
  return `
    const {${parameters.join(", ")}} = record;
    return ${expression}
    `;
};
