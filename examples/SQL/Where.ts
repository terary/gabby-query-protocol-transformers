import { PredicateFormulaEditorFactory } from "gabby-query-protocol-lib";
import type {
  TPredicateSubjectDictionaryJson,
  TSerializedPredicateTree,
} from "gabby-query-protocol-lib";

import { SQL } from "../../src/sql";
const { Where } = SQL;

import subjectDictionaryJson from "./example-json/predicate-subject-dictionary.json";
import predicateTreeJson from "./example-json/predicate-tree.json";

const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson({
  predicateTreeJson: predicateTreeJson as TSerializedPredicateTree,
  subjectDictionaryJson: subjectDictionaryJson as TPredicateSubjectDictionaryJson,
});
console.log("********************************************************");

console.log("Where.getWhereAsSqlStringPretty");
console.log(Where.getWhereAsSqlStringPretty(predicateFormulaEditor));

console.log("\n\n");
console.log(Where.getWhereAsSqlString(predicateFormulaEditor));
console.log("********************************************************");
