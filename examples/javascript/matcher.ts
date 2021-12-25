import { PredicateFormulaEditorFactory } from "gabby-query-protocol-lib";
import type {
  TPredicateSubjectDictionaryJson,
  TSerializedPredicateTree,
} from "gabby-query-protocol-lib";

import { jsConv } from "../../src/javascript/matcher";

import subjectDictionaryAllOperatorsJson from "../../src/javascript/all-operators-subject-dictionary.json";
import predicateTreeAllOperatorsJson from "../../src/javascript/all-operators-predicate-tree.json";

const predicateFormulaEditorAllOps = PredicateFormulaEditorFactory.fromJson({
  predicateTreeJson: predicateTreeAllOperatorsJson as TSerializedPredicateTree,
  subjectDictionaryJson:
    subjectDictionaryAllOperatorsJson as TPredicateSubjectDictionaryJson,
});

console.log("********************************************************");

console.log(".matcherAsFastUnsafeFunction() source ($or)");
const fn = jsConv.matcherAsFastUnsafeFunction(predicateFormulaEditorAllOps) as Function;
console.log(fn.toString());

predicateFormulaEditorAllOps.predicatesReplace(predicateFormulaEditorAllOps.rootNodeId, {
  operator: "$nand",
});
const fnNand = jsConv.matcherAsFastUnsafeFunction(
  predicateFormulaEditorAllOps
) as Function;
console.log(".matcherAsFastUnsafeFunction() source ($nand)");
console.log(fnNand.toString());

console.log("********************************************************");

import subjectDictionaryJsonBlueSkies from "../../examples/SQL/example-json/predicate-subject-dictionary.json";
import predicateTreeJsonBlueSkies from "../../examples/SQL/example-json/predicate-tree.json";

// import allOpSubjectDictionaryJson from "../../src/javascript/all-operators-subject-dictionary.json";
// import predicateTreeAllOperatorsJson from "../../src/javascript/all-operators-predicate-tree.json";

const predicateFormulaEditor = PredicateFormulaEditorFactory.fromEmpty(
  subjectDictionaryJsonBlueSkies as TPredicateSubjectDictionaryJson,
  { operator: "$like", subjectId: "lastName", value: "rubble" }
);

const incomeNodeId = predicateFormulaEditor.predicatesAppend(
  predicateFormulaEditor.rootNodeId,
  { operator: "$gte", subjectId: "annualIncome", value: 35000.01 }
);

const postalCode = predicateFormulaEditor.predicatesAppend(incomeNodeId, {
  operator: "$like",
  subjectId: "postalCode",
  value: "04",
});

predicateFormulaEditor.predicatesReplace(predicateFormulaEditor.rootNodeId, {
  operator: "$or",
});
const matcher = jsConv.matcherAsFastUnsafeFunction(predicateFormulaEditor);
console.log(matcher.toString());

const records = [
  { annualIncome: 34999.99, postalCode: "04", lastName: "flintstone" },
  { annualIncome: 35000.01, postalCode: "04", lastName: "flintstone" },
  { annualIncome: 35000.01, postalCode: "03", lastName: "flintstone" },
  { annualIncome: 35000.01, postalCode: "03", lastName: "rubble" },
];

//@ts-ignore
function hardMatcher(record) {
  const { annualIncome, lastName, postalCode } = record;
  return (
    lastName.includes("rubble") || (annualIncome >= 35000.01 && postalCode.includes("04"))
  );
}
const isMatched = hardMatcher({
  annualIncome: 35000.01,
  postalCode: "04",
  lastName: "rubble",
});
console.log(isMatched);
records.forEach((record) => {
  console.log(
    JSON.stringify(record),
    matcher(record) ? " *MATCHED* " : " -NOT MATCHED- "
  );
});
