import { PredicateFormulaEditorFactory } from "gabby-query-protocol-lib";
import type {
  TPredicateSubjectDictionaryJson,
  TSerializedPredicateTree,
  TPredicateOperator,
} from "gabby-query-protocol-lib";

import { Where } from "./where-functions";

import subjectDictionaryJson from "./test-predicate-subject-dictionary.json";
import predicateTreeJson from "./test-predicate-tree.json";

const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson({
  predicateTreeJson: predicateTreeJson as TSerializedPredicateTree,
  subjectDictionaryJson: subjectDictionaryJson as TPredicateSubjectDictionaryJson,
});
const expectedPrettyOutput = `(
	(
		lastName = 'Flintstone'
		AND (
			firstName = 'Fred'
			OR firstName = 'Wilma'
		)
	)
	OR (
		(
			firstName = 'Barney'
			OR firstName = 'Betty'
		)
		AND lastName = 'Rubble'
	)
	OR (
		postalCode LIKE '%04%'
		AND region  IN ('US-WEST', 'US-NORTH')
		AND startDate >= '2020-06-29T23:03:23-07:00'
		AND favoriteFruit = 'GRAPE001'
		AND annualIncome > 5000.01
		AND numberOfChildren > 2
	)
)`;

const expectedOutput = `( ( lastName = 'Flintstone' AND ( firstName = 'Fred' OR firstName = 'Wilma' ) ) OR ( ( firstName = 'Barney' OR firstName = 'Betty' ) AND lastName = 'Rubble' ) OR ( postalCode LIKE '%04%' AND region  IN ('US-WEST', 'US-NORTH') AND startDate >= '2020-06-29T23:03:23-07:00' AND favoriteFruit = 'GRAPE001' AND annualIncome > 5000.01 AND numberOfChildren > 2 ) )`;

describe("where-helper-functions", () => {
  describe(".getWhereAsSqlStringPretty", () => {
    it("Should insert well placed tabs and new lines", () => {
      expect(Where.getWhereAsSqlStringPretty(predicateFormulaEditor)).toEqual(
        expectedPrettyOutput
      );
    });
  });
  describe(".getWhereAsSqlString", () => {
    it("Should insert well placed tabs and new lines", () => {
      expect(Where.getWhereAsSqlString(predicateFormulaEditor)).toEqual(expectedOutput);
    });
  });
  describe("all operators work as expected", () => {
    it("Should work for $nor", () => {
      const allOpFormulaEditor = PredicateFormulaEditorFactory.fromEmpty(
        subjectDictionaryJson as TPredicateSubjectDictionaryJson,
        { operator: "$eq", subjectId: "firstName", value: "Fred" }
      );
      allOpFormulaEditor.predicatesAppend(allOpFormulaEditor.rootNodeId, {
        operator: "$gt",
        subjectId: "lastName",
        value: "Flintstone",
      });
      allOpFormulaEditor.predicatesReplace(allOpFormulaEditor.rootNodeId, {
        operator: "$nor",
      });
      ["$gt", "$gte", "$lt", "$lte", "$ne"].forEach((operator) => {
        allOpFormulaEditor.predicatesAppend(allOpFormulaEditor.rootNodeId, {
          operator: operator as TPredicateOperator,
          subjectId: "annualIncome",
          value: 5.01,
        });
      });
      const expectedSqlString =
        "NOT( firstName = 'Fred' OR lastName > 'Flintstone' OR annualIncome > 5.01 OR annualIncome >= 5.01 OR annualIncome < 5.01 OR annualIncome <= 5.01 OR annualIncome != 5.01 )";

      expect(Where.getWhereAsSqlString(allOpFormulaEditor)).toEqual(expectedSqlString);
    });
    it("Should work for $nand", () => {
      const allOpFormulaEditor = PredicateFormulaEditorFactory.fromEmpty(
        subjectDictionaryJson as TPredicateSubjectDictionaryJson,
        { operator: "$eq", subjectId: "firstName", value: "Fred" }
      );
      allOpFormulaEditor.predicatesAppend(allOpFormulaEditor.rootNodeId, {
        operator: "$gt",
        subjectId: "lastName",
        value: "Flintstone",
      });
      allOpFormulaEditor.predicatesReplace(allOpFormulaEditor.rootNodeId, {
        operator: "$nand",
      });
      ["$gt", "$gte", "$lt", "$lte", "$ne"].forEach((operator) => {
        allOpFormulaEditor.predicatesAppend(allOpFormulaEditor.rootNodeId, {
          operator: operator as TPredicateOperator,
          subjectId: "annualIncome",
          value: 5.01,
        });
      });
      const expectedSqlString =
        "NOT( firstName = 'Fred' AND lastName > 'Flintstone' AND annualIncome > 5.01 AND annualIncome >= 5.01 AND annualIncome < 5.01 AND annualIncome <= 5.01 AND annualIncome != 5.01 )";
      expect(Where.getWhereAsSqlString(allOpFormulaEditor)).toEqual(expectedSqlString);
    });
    it("Should work for $or", () => {
      const allOpFormulaEditor = PredicateFormulaEditorFactory.fromEmpty(
        subjectDictionaryJson as TPredicateSubjectDictionaryJson,
        { operator: "$eq", subjectId: "firstName", value: "Fred" }
      );
      allOpFormulaEditor.predicatesAppend(allOpFormulaEditor.rootNodeId, {
        operator: "$gt",
        subjectId: "lastName",
        value: "Flintstone",
      });
      allOpFormulaEditor.predicatesReplace(allOpFormulaEditor.rootNodeId, {
        //@ts-ignore
        operator: "INVALID_JUNCTION_OPERATOR",
      });

      const willThrow = () => {
        Where.getWhereAsSqlString(allOpFormulaEditor);
      };

      expect(willThrow).toThrow("'INVALID_JUNCTION_OPERATOR' unknown Junction operator");
    });
    it("Should work $anyOf with integer", () => {
      const allOpFormulaEditor = PredicateFormulaEditorFactory.fromEmpty(
        subjectDictionaryJson as TPredicateSubjectDictionaryJson,
        { operator: "$anyOf", subjectId: "regionCode", value: [3] }
      );
      // const s = Where.getWhereAsSqlStringPretty(allOpFormulaEditor);
      const expectedSQLStatement = "regionCode  IN (3)";
      expect(Where.getWhereAsSqlStringPretty(allOpFormulaEditor)).toEqual(
        expectedSQLStatement
      );
    });
    it("Should work $nanyOf with integer", () => {
      const allOpFormulaEditor = PredicateFormulaEditorFactory.fromEmpty(
        subjectDictionaryJson as TPredicateSubjectDictionaryJson,
        { operator: "$nanyOf", subjectId: "region", value: ["US-SOUTH", "US-WEST"] }
      );
      // const s = Where.getWhereAsSqlStringPretty(allOpFormulaEditor);
      const expectedSQLStatement = "region  NOT IN ('US-SOUTH', 'US-WEST')";
      expect(Where.getWhereAsSqlStringPretty(allOpFormulaEditor)).toEqual(
        expectedSQLStatement
      );
    });
    it("Should work $isNull", () => {
      const allOpFormulaEditor = PredicateFormulaEditorFactory.fromEmpty(
        subjectDictionaryJson as TPredicateSubjectDictionaryJson,
        //@ts-ignore - doesn't like null for value
        { operator: "$isNull", subjectId: "nullableField", value: null }
      );
      // const s = Where.getWhereAsSqlStringPretty(allOpFormulaEditor);
      const expectedSQLStatement = "nullableField IS NULL";
      expect(Where.getWhereAsSqlStringPretty(allOpFormulaEditor)).toEqual(
        expectedSQLStatement
      );
    });
    it("Should work $empty", () => {
      const allOpFormulaEditor = PredicateFormulaEditorFactory.fromEmpty(
        subjectDictionaryJson as TPredicateSubjectDictionaryJson,
        //@ts-ignore - doesn't like null for value
        {
          operator: "$empty",
          subjectId: "emptyField",
          value: "some value doest get read",
        }
      );
      // const s = Where.getWhereAsSqlStringPretty(allOpFormulaEditor);
      const expectedSQLStatement = "emptyField = ''";
      expect(Where.getWhereAsSqlString(allOpFormulaEditor)).toEqual(expectedSQLStatement);
    });
  });
  describe("Prepared statements", () => {
    it.skip("Should have an option to return prepared statements", () => {
      // this may not be necessary
    });
  });
}); // describe('where-helper-functions'
