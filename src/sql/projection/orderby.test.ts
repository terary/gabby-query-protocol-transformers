import {
  IProjectionEditor,
  ProjectionEditorFactory,
} from "gabby-query-protocol-projection";

import type {
  TProjectableSubjectsDictionaryJson,
  TProjectionPropertiesJson,
} from "gabby-query-protocol-projection";
import testSubjectDictionaryJson from "./test-projection-subject-dictionary-all-types.json";
import testProjection from "./test-projection-order-by.json";
import { OrderBy } from "./orderby-functions";

describe("OrderBy helper functions", () => {
  describe(".getOrderByColumns", () => {
    it("Should return only columns with orderBy not == 0", () => {
      const expectedColumnTitles = [
        // "Not Selectable",
        "Last Name",
        "Favorite Number",
        "Hire Date",
        "First Name",
      ];
      const projectionEditor = makeProjectionEditor(testProjection.selectionTest);
      const orderByColumns = OrderBy.getOrderByColumns(projectionEditor);
      const columnTitles = orderByColumns.map(
        (columnDefinition) => columnDefinition.label
      );
      expect(columnTitles).toStrictEqual(expectedColumnTitles);
    });
    it("Should guarantee order by magnitude of sortOrder, 1 to n", () => {
      const expectedColumnTitles = [
        // "Not Selectable",
        "first",
        "second",
        "third",
        "fourth",
        "fifth",
      ];
      const projectionEditor = makeProjectionEditor(testProjection.orderTest1);
      const orderByColumns = OrderBy.getOrderByColumns(projectionEditor);
      const columnTitles = orderByColumns.map(
        (columnDefinition) => columnDefinition.label
      );
      expect(columnTitles).toStrictEqual(expectedColumnTitles);
    });
  }); //  describe("getOrderByColumns",

  describe(".getOrderByColumnsSqlEncode", () => {
    it("Should guarantee order by magnitude of sortOrder, 1 to n", () => {
      const expectedColumnTitles = [
        "firstname DESC",
        "lastname ASC",
        "annualRevenue DESC",
        "favoriteNumber ASC",
        "hireDate DESC",
      ];
      const projectionEditor = makeProjectionEditor(testProjection.orderTest1);
      const orderByColumnsAsSql = OrderBy.getOrderByColumnsSqlEncode(projectionEditor);
      expect(expectedColumnTitles).toStrictEqual(orderByColumnsAsSql);
    });
  });
  describe(".getOrderByAsSqlString", () => {
    it('Should return string appropriate for use in OrderBy statement, without "ORDER BY"', () => {
      let expectedOrderByClause =
        "firstname DESC, lastname ASC, annualRevenue DESC, favoriteNumber ASC, hireDate DESC";
      const projectionEditor = makeProjectionEditor(testProjection.orderTest1);

      const orderByColumnsAsSql = OrderBy.getOrderByAsSqlString(projectionEditor);
      expect(orderByColumnsAsSql).toStrictEqual(expectedOrderByClause);
    });
  });
  describe(".getOrderByAsSqlStringPretty", () => {
    it('Should return string appropriate for use in OrderBy statement, without "ORDER BY", formatted default pretty', () => {
      let expectedOrderByClause =
        "\tfirstname DESC,\n\tlastname ASC,\n\tannualRevenue DESC,\n\tfavoriteNumber ASC,\n\thireDate DESC";
      const projectionEditor = makeProjectionEditor(testProjection.orderTest1);

      const orderByColumnsAsSql = OrderBy.getOrderByAsSqlStringPretty(projectionEditor);
      expect(orderByColumnsAsSql).toStrictEqual(expectedOrderByClause);
    });
    it('Should return string appropriate for use in OrderBy statement, without "ORDER BY", formatted 2 tabs', () => {
      let expectedOrderByClause =
        "\t\tfirstname DESC,\n\t\tlastname ASC,\n\t\tannualRevenue DESC,\n\t\tfavoriteNumber ASC,\n\t\thireDate DESC";
      const projectionEditor = makeProjectionEditor(testProjection.orderTest1);

      const orderByColumnsAsSql = OrderBy.getOrderByAsSqlStringPretty(
        projectionEditor,
        2
      );
      expect(orderByColumnsAsSql).toStrictEqual(expectedOrderByClause);
    });
  });
}); //describe("OrderBy helper functions

const makeProjectionEditor = (
  projection: TProjectionPropertiesJson[]
): IProjectionEditor => {
  return ProjectionEditorFactory.fromJson({
    projectableSubjectDictionaryJson:
      testSubjectDictionaryJson as TProjectableSubjectsDictionaryJson,
    projectionItemsJson: projection,
  });
};
