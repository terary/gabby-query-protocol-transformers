import { PredicateFormulaEditorFactory } from "gabby-query-protocol-lib";
import { ProjectionEditorFactory } from "gabby-query-protocol-projection";

import type {
  TPredicateSubjectDictionaryJson,
  TSerializedPredicateTree,
} from "gabby-query-protocol-lib";

import type {
  TProjectableSubjectsDictionaryJson,
  TProjectionItemProperties,
} from "gabby-query-protocol-projection";

import { gabbyToMongo } from "../../src/mongodb";

import subjectDictionaryJson from "./schemas/predicateSubjectDictionary.json";
import predicateTreeJson from "./schemas/predicateTree.json";
import projectableSubjectsJson from "./schemas/projectable-subjects.json";
import projectionJson from "./schemas/projection.json";

const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson({
  predicateTreeJson: predicateTreeJson as TSerializedPredicateTree,
  subjectDictionaryJson: subjectDictionaryJson as TPredicateSubjectDictionaryJson,
});

let exampleProjectionEditor;
try {
  exampleProjectionEditor = ProjectionEditorFactory.fromJson({
    projectionItemsJson: projectionJson.projection as TProjectionItemProperties[],
    projectableSubjectDictionaryJson:
      projectableSubjectsJson as TProjectableSubjectsDictionaryJson,
  });
} catch (e) {
  console.log("Has Error");
  console.error(e);
  throw new Error("Unable to convert projection JSON");
}

const queryExpression = gabbyToMongo.queryObject(predicateFormulaEditor);
const projection = gabbyToMongo.projectionObject(exampleProjectionEditor);
const sortExpression = gabbyToMongo.sortObject(exampleProjectionEditor);

console.log("************************** Predicate Tree");
console.dir(queryExpression);
console.log(JSON.stringify(queryExpression, null, 2));
console.log("************************** Projection");
console.dir(projection);
console.log(JSON.stringify(projection, null, 2));
console.log("************************** Sort");
console.dir(sortExpression);
console.log(JSON.stringify(sortExpression, null, 2));
