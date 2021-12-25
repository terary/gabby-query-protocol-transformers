import exp from "constants";
import {
  TPredicateProperties,
  TSupportedDatatype,
  TPredicatePropertiesArrayValue,
  TPredicateJunctionOperator,
} from "gabby-query-protocol-lib";

const encodeScalarValue = (value: number | string, datatype: TSupportedDatatype) => {
  if (datatype === "datetime") {
    return new Date(value);
  }
  return value;
};

const arrayValuePredicateToMongo = (
  predicate: TPredicatePropertiesArrayValue,
  datatype: TSupportedDatatype
): object => {
  const { subjectId, operator, value } = predicate;

  if (operator === "$anyOf") {
    return { [subjectId]: { $in: value } };
  }

  return { [subjectId]: { $not: { $in: value } } };
};

const simplePredicateToMongo = (
  predicate: TPredicateProperties,
  datatype: TSupportedDatatype
): object => {
  const { subjectId, operator } = predicate;
  const value = encodeScalarValue(predicate.value, datatype);

  if (["$anyOf", "$nanyOf"].includes(operator)) {
    throw new Error("$anyOf, $nanyOf, not supported by simplePredicateToMongo");
  }

  if (operator === "$empty") {
    return {
      [subjectId]: { $eq: "" },
    };
  }
  if (operator === "$isNull") {
    return {
      [subjectId]: { $in: [null, false] },
    };
  }
  if (operator === "$like") {
    return {
      [subjectId]: { $regex: RegExp(String(value), "i") },
    };
  }
  if (operator === "$oneOf") {
    return {
      [subjectId]: { $eq: value },
    };
  }

  return {
    [subjectId]: { [operator]: value },
  };
};
const mongoNot = (expression: object) => {
  return { $not: expression };
};

const junctionOperatorToMongo = (
  operator: TPredicateJunctionOperator,
  ...mongoPredicates: object[]
) => {
  return { [operator]: [...mongoPredicates] };
};

const junctionAndToMongo = (...mongoPredicates: object[]) => {
  return junctionOperatorToMongo("$and", ...mongoPredicates);
};
const junctionNandToMongo = (...mongoPredicates: object[]) => {
  return mongoNot(junctionAndToMongo(...mongoPredicates));
};

const junctionOrToMongo = (...mongoPredicates: object[]) => {
  return junctionOperatorToMongo("$or", ...mongoPredicates);
};
const junctionNorToMongo = (...mongoPredicates: object[]) => {
  return mongoNot(junctionOrToMongo(...mongoPredicates));
};

export {
  simplePredicateToMongo,
  arrayValuePredicateToMongo,
  junctionAndToMongo,
  junctionNandToMongo,
  junctionOrToMongo,
  junctionNorToMongo,
  junctionOperatorToMongo,
};
