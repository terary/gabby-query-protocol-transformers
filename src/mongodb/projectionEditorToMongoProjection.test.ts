import { ProjectionEditorFactory } from "gabby-query-protocol-projection";
import type {
  TProjectableSubjectsDictionaryJson,
  TProjectionItemProperties,
} from "gabby-query-protocol-projection";

import { projectionEditorToMongoProjection } from "./projectionEditorToMongoProjection";
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
      const actualProjection = projectionEditorToMongoProjection(exampleProjectionEditor);
      const expectedProjection = {
        _id: 1,
        clientId: 1,
        taskTag: 1,
        taskDescription: 1,
        activityDescription: 1,
        minutes: 1,
        completionDate: 1,
        createdAt: 1,
        updatedAt: 1,
      };

      const expectedBrokenProjection = {
        _id: 1,
        clientId: 1,
        taskTag: 1,
        taskDescription: 1,
        activityDescription: 1,
        minutes: 1,
        completionDate: 1,
        updatedAt: 1, // to make sure test fails, as expected
        createdAt: 1,
      };

      expect(JSON.stringify(expectedProjection)).toStrictEqual(
        JSON.stringify(actualProjection)
      );

      JSON.stringify(expectedBrokenProjection);
      expect(JSON.stringify(actualProjection)).not.toStrictEqual(actualProjection);
    });
    it("Should reflect changes when using updateProjectionItem ", () => {
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

      exampleProjectionEditor.updateProjectionItem("key0", { columnOrder: 100 });

      const expectedProjection = {
        clientId: 1,
        taskTag: 1,
        taskDescription: 1,
        activityDescription: 1,
        minutes: 1,
        completionDate: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 1,
      };
      const actualProjection = projectionEditorToMongoProjection(exampleProjectionEditor);

      expect(JSON.stringify(actualProjection)).toStrictEqual(
        JSON.stringify(expectedProjection)
      );
    });
  });
});
