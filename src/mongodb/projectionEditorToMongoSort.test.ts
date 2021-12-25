describe("Sort", () => {});
import { ProjectionEditorFactory } from "gabby-query-protocol-projection";
import type {
  TProjectableSubjectsDictionaryJson,
  TProjectionItemProperties,
} from "gabby-query-protocol-projection";

import { projectionEditorToMongoSort } from "./projectionEditorToMongoSort";
import projectableSubjectsJson from "./test-schemas/projectable-subjects.json";
import projectionJson from "./test-schemas/projection.json";

describe("projectionEditorToMongoProjection", () => {
  it("Jest matchers: Projections need to be stringify", () => {
    expect({ one: 1, two: 1 }).toStrictEqual({ two: 1, one: 1 });

    expect(JSON.stringify({ one: 1, two: 1 })).not.toStrictEqual(
      JSON.stringify({ two: 1, one: 1 })
    );
  });
  describe("Default behavior", () => {
    it("Should produce expected projection", () => {
      let exampleProjectionEditor;
      try {
        exampleProjectionEditor = ProjectionEditorFactory.fromJson({
          projectionItemsJson: projectionJson.projection as TProjectionItemProperties[],
          projectableSubjectDictionaryJson:
            projectableSubjectsJson as TProjectableSubjectsDictionaryJson,
        });
      } catch (e) {
        throw new Error("Failed to create projection editor");
      }
      const actualSortStatement = projectionEditorToMongoSort(exampleProjectionEditor);
      const expectedSortStatement = {
        clientId: 1,
        taskTag: -1,
        taskDescription: 1,
        activityDescription: -1,
        minutes: 1,
        completionDate: -1,
        createdAt: 1,
        updatedAt: -1,
        _id: 1,
      };

      const expectedSortStatementWrongOrder = {
        _id: 1, // order does matter
        clientId: 1,
        taskTag: -1,
        taskDescription: 1,
        activityDescription: -1,
        minutes: 1,
        completionDate: -1,
        createdAt: 1,
        updatedAt: -1,
      };

      expect(actualSortStatement).toStrictEqual(expectedSortStatement);

      expect(JSON.stringify(actualSortStatement)).toStrictEqual(
        JSON.stringify(expectedSortStatement)
      );

      expect(JSON.stringify(actualSortStatement)).not.toStrictEqual(
        expectedSortStatementWrongOrder
      );
    });
  });
});
