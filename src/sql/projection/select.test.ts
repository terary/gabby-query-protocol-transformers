import {
  IProjectionEditor,
  ProjectionEditorFactory,
} from "gabby-query-protocol-projection";
import type {
  TProjectableSubjectsDictionaryJson,
  TProjectionPropertiesJson,
} from "gabby-query-protocol-projection";
import testSubjectDictionaryJson from "./test-projection-subject-dictionary-all-types.json";
import testProjection from "./test-projection-select.json";
import { Select } from "./select-functions";
const projectionEditor = ProjectionEditorFactory.fromJson({
  projectableSubjectDictionaryJson:
    testSubjectDictionaryJson as TProjectableSubjectsDictionaryJson,
  projectionItemsJson: testProjection.selectionTest as TProjectionPropertiesJson[],
});

describe("ProjectionSQL", () => {
  describe(".getSelectableColumns", () => {
    it("Should Return only projectionItems that belong is SELECT statement", () => {
      const expectedColumnTitles = [
        // "Not Selectable",
        "First Name",
        "Last Name",
        "Annual Revenue",
        "Favorite Number",
        "Hire Date",
      ];
      const columns = Select.getSelectColumns(projectionEditor);
      const columnTitles = columns.map((columnDefinition) => columnDefinition.label);
      expect(columnTitles).toStrictEqual(expectedColumnTitles);
    });
    it("Should guarantee order, 0 to n", () => {
      const expectedColumnTitles = ["First", "Middle", "Last"];
      const disOrderedProjectionEditor = makeProjectionEditor(
        testProjection.unorderedTest1
      );
      const columns = Select.getSelectColumns(disOrderedProjectionEditor);
      const columnTitles = columns.map((columnDefinition) => columnDefinition.label);
      expect(columnTitles).toStrictEqual(expectedColumnTitles);
    });
    it.skip("When two columns have the same columnOrder, order is not guaranteed", () => {});
  }); // describe(".getSelectableColumns
  describe(".getSelectColumnsSqlEncode", () => {
    it("Should return array of strings formatted for SQL select statement", () => {
      const expectedColumnTitles = [
        "firstname AS `First Name`",
        "lastname AS `Last Name`",
        "annualRevenue AS `Annual Revenue`",
        "favoriteNumber AS `Favorite Number`",
        "hireDate AS `Hire Date`",
      ];
      const columns = Select.getSelectColumnsSqlEncode(projectionEditor);
      expect(columns).toStrictEqual(expectedColumnTitles);
    });
    it("Should accept option left/right delimiter for special case field names ", () => {
      const expectedColumnTitles = [
        "firstname AS [First Name]",
        "lastname AS [Last Name]",
        "annualRevenue AS [Annual Revenue]",
        "favoriteNumber AS [Favorite Number]",
        "hireDate AS [Hire Date]",
      ];
      const columns = Select.getSelectColumnsSqlEncode(projectionEditor, "[", "]");
      expect(columns).toStrictEqual(expectedColumnTitles);
    });
  });
  describe(".getSelectSQLString", () => {
    it('Should return string appropriate to for SELECT statement, without "SELECT" ', () => {
      let expectedSelectSQL = "firstname AS `First Name`, ";
      expectedSelectSQL += "lastname AS `Last Name`, ";
      (expectedSelectSQL += "annualRevenue AS `Annual Revenue`, "),
        (expectedSelectSQL += "favoriteNumber AS `Favorite Number`, "),
        (expectedSelectSQL += "hireDate AS `Hire Date`");
      const selectSQL = Select.getSelectAsSqlString(projectionEditor);
      expect(selectSQL).toStrictEqual(expectedSelectSQL);
    });
    it('Should return string appropriate to for SELECT statement, without "SELECT", field name delimiter ', () => {
      let expectedSelectSQL = "firstname AS [First Name], ";
      expectedSelectSQL += "lastname AS [Last Name], ";
      (expectedSelectSQL += "annualRevenue AS [Annual Revenue], "),
        (expectedSelectSQL += "favoriteNumber AS [Favorite Number], "),
        (expectedSelectSQL += "hireDate AS [Hire Date]");
      const selectSQL = Select.getSelectAsSqlString(projectionEditor, "[", "]");
      expect(selectSQL).toStrictEqual(expectedSelectSQL);
    });
  });
  describe(".getSelectAsSqlStringPretty", () => {
    it('Should return string appropriate to for SELECT statement, without "SELECT" formatted with tabs and newlines ', () => {
      let expectedSelectSQL =
        "\tfirstname AS `First Name`,\n\tlastname AS `Last Name`,\n\tannualRevenue AS `Annual Revenue`,\n\tfavoriteNumber AS `Favorite Number`,\n\thireDate AS `Hire Date`";
      const selectSQL = Select.getSelectAsSqlStringPretty(projectionEditor);
      expect(selectSQL).toStrictEqual(expectedSelectSQL);
    });
  });
});

const makeProjectionEditor = (
  projection: TProjectionPropertiesJson[]
): IProjectionEditor => {
  return ProjectionEditorFactory.fromJson({
    projectableSubjectDictionaryJson:
      testSubjectDictionaryJson as TProjectableSubjectsDictionaryJson,
    projectionItemsJson: projection,
  });
};
