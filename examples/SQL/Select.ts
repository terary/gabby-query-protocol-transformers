import { ProjectionEditorFactory } from "gabby-query-protocol-projection";
import type {
  TProjectableSubjectsDictionaryJson,
  TProjectionPropertiesJson,
} from "gabby-query-protocol-projection";

import { SQL } from "../../src/sql";
const { Select } = SQL;
const DEFAULT_DELIMITER = undefined;

import projectableDictionaryJson from "./example-json/projectable-dictionary.json";
import projectedItems from "./example-json/projected-items.json";
const projectionEditor = ProjectionEditorFactory.fromJson({
  projectableSubjectDictionaryJson:
    projectableDictionaryJson as TProjectableSubjectsDictionaryJson,
  projectionItemsJson: projectedItems.simpleProjection as TProjectionPropertiesJson[],
});

console.log("********************************************************");

console.log("\n\n");
console.log(".getSelectColumns()");
console.log(JSON.stringify(Select.getSelectColumns(projectionEditor)));

console.log("\n\n");
console.log(".getSelectColumnsSqlEncode()");
console.log(JSON.stringify(Select.getSelectColumnsSqlEncode(projectionEditor)));

console.log("\n\n");
console.log(".getSelectAsSqlString()");
console.log(Select.getSelectAsSqlString(projectionEditor));

console.log("\n\n");
console.log(".getSelectAsSqlStringPretty()");
console.log(
  Select.getSelectAsSqlStringPretty(
    projectionEditor,
    DEFAULT_DELIMITER,
    DEFAULT_DELIMITER,
    2
  )
);

console.log("*********************");
