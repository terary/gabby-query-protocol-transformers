import { ProjectionEditorFactory } from "gabby-query-protocol-projection";
import type {
  TProjectableSubjectsDictionaryJson,
  TProjectionPropertiesJson,
} from "gabby-query-protocol-projection";
import { SQL } from "../../src/sql";
const { OrderBy } = SQL;

import projectableDictionaryJson from "./example-json/projectable-dictionary.json";
import projectedItems from "./example-json/projected-items.json";

const projectionEditor = ProjectionEditorFactory.fromJson({
  projectableSubjectDictionaryJson:
    projectableDictionaryJson as TProjectableSubjectsDictionaryJson,
  projectionItemsJson: projectedItems.simpleProjection as TProjectionPropertiesJson[],
});

console.log("**************** Order By ******************************");
console.log(".getOrderByColumns");
console.log(JSON.stringify(OrderBy.getOrderByColumns(projectionEditor)));

console.log("\n\n");
console.log(".getOrderByColumnsSqlEncode");
console.log(OrderBy.getOrderByColumnsSqlEncode(projectionEditor));

console.log("\n\n");
console.log(".getOrderByAsSqlStringPretty");
const twoTabStops = 2;
console.log(OrderBy.getOrderByAsSqlStringPretty(projectionEditor, twoTabStops));

console.log("\n\n");
console.log(".getOrderByAsSqlString");
console.log(OrderBy.getOrderByAsSqlString(projectionEditor));
console.log("********************************************************");
