import { PredicateFormulaEditorFactory } from "gabby-query-protocol-lib";
import type {
  TPredicateSubjectDictionaryJson,
  TSerializedPredicateTree,
} from "gabby-query-protocol-lib";
import { untestable } from "./matcher";
import { jsConv as jsCond } from "./matcher";
import subjectDictionaryJson from "../../examples/SQL/example-json/predicate-subject-dictionary.json";
import predicateTreeJson from "../../examples/SQL/example-json/predicate-tree.json";
import subjectDictionAllOperatorsJson from "./all-operators-subject-dictionary.json";
import predicateTreeAllOperatorsJson from "./all-operators-predicate-tree.json";

import subjectDictionSpecialCaseJson from "./test-special-case-subject-dictionary.json";
import predicateTreeSpecialCaseJson from "./test-special-case-predicateTree.json";

const predicateFormulaEditorSpecialCase = PredicateFormulaEditorFactory.fromJson({
  predicateTreeJson: predicateTreeSpecialCaseJson as TSerializedPredicateTree,
  subjectDictionaryJson: subjectDictionSpecialCaseJson as TPredicateSubjectDictionaryJson,
});

const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson({
  predicateTreeJson: predicateTreeJson as TSerializedPredicateTree,
  subjectDictionaryJson: subjectDictionaryJson as TPredicateSubjectDictionaryJson,
});

const allOpPredicateFormulaEditor = PredicateFormulaEditorFactory.fromJson({
  predicateTreeJson: predicateTreeAllOperatorsJson as TSerializedPredicateTree,
  subjectDictionaryJson:
    subjectDictionAllOperatorsJson as TPredicateSubjectDictionaryJson,
});

describe("javascript-matcher-function", () => {
  it.skip("should be awesome", () => {
    const matcherFn = jsCond.matcherAsFastUnsafeFunction(predicateFormulaEditor);
    const src = matcherFn.toString();
    expect(matcherFn.toString()).toBe(expectedSources.blueSkies);
  });
  it("Should support all operators ($or)", () => {
    const matcherFn = jsCond.matcherAsFastUnsafeFunction(allOpPredicateFormulaEditor);
    const src = matcherFn.toString();
    expect(matcherFn.toString()).toBe(expectedSources.allOperatorsOR);
  });
  it("Should support all operators ($nor)", () => {
    allOpPredicateFormulaEditor.predicatesReplace(
      allOpPredicateFormulaEditor.rootNodeId,
      { operator: "$nor" }
    );
    const matcherFn = jsCond.matcherAsFastUnsafeFunction(allOpPredicateFormulaEditor);

    const src = matcherFn.toString();
    expect(matcherFn.toString()).toBe(expectedSources.allOperatorsNOR);
  });
  it("Should support all operators ($and)", () => {
    allOpPredicateFormulaEditor.predicatesReplace(
      allOpPredicateFormulaEditor.rootNodeId,
      { operator: "$and" }
    );
    const matcherFn = jsCond.matcherAsFastUnsafeFunction(allOpPredicateFormulaEditor);
    const src = matcherFn.toString();
    expect(matcherFn.toString()).toBe(expectedSources.allOperatorsAND);
  });
  it("Should support all operators ($nand)", () => {
    allOpPredicateFormulaEditor.predicatesReplace(
      allOpPredicateFormulaEditor.rootNodeId,
      { operator: "$nand" }
    );
    const matcherFn = jsCond.matcherAsFastUnsafeFunction(allOpPredicateFormulaEditor);
    const src = matcherFn.toString();

    expect(matcherFn.toString()).toBe(expectedSources.allOperatorsNAND);
  });
  it("Should handle nany with integer", () => {
    const matcherFn = jsCond.matcherAsFastUnsafeFunction(
      predicateFormulaEditorSpecialCase
    );
    const src = matcherFn.toString();
    expect(matcherFn.toString()).toBe(expectedSources.specialCase);
  });
});
describe("Untestable", () => {
  it("tabs() should return string with x number of tabs", () => {
    expect(untestable.tabs(2)).toBe("\t\t");
    expect(untestable.tabs(0)).toBe(" ");
  });
});

const expectedSources = {
  // auto formatting prevents me from use back-tick quotes.  Use console.log to see the source.
  blueSkies:
    "function anonymous(record\n) {\n\n      const {annualIncome, favoriteFruit, firstName, lastName, numberOfChildren, postalCode, region, startDate} =record ;\n      return\n(\n\t(\n\t\tlastName === 'Flintstone'\n\t\t&& (\n\t\t\tfirstName === 'Fred'\n\t\t\t|| firstName === 'Wilma'\n\t\t)\n\t)\n\t|| (\n\t\t(\n\t\t\tfirstName === 'Barney'\n\t\t\t|| firstName === 'Betty'\n\t\t)\n\t\t&& lastName === 'Rubble'\n\t)\n\t|| (\n\t\tpostalCode.includes('04')\n\t\t&& ['US-WEST', 'US-NORTH'].includes(region)\n\t\t&& startDate >= '2020-06-29T23:03:23-07:00'\n\t\t&& favoriteFruit === 'GRAPE001'\n\t\t&& annualIncome > 5000.01\n\t\t&& numberOfChildren > 2\n\t)\n)\n\n}",
  allOperatorsOR:
    "function anonymous(record\n) {\n\n      const {ANY_OF, EMPTY, EQUAL, GREATER_THAN, GREATER_THAN_EQUAL, IS_NULL, LESS_THAN, LESS_THAN_EQUAL, LIKE, NANY_OF, NOT_EQUAL, ONE_OF} =record ;\n      return  \t['US-SOUTH', 'US-WEST'].includes(ANY_OF)\n\t|| EMPTY === ''\n\t|| EQUAL === 'Equals'\n\t|| GREATER_THAN > 'Greater Than'\n\t|| GREATER_THAN_EQUAL >= 'Greater Than Equal'\n\t|| IS_NULL === null\n\t|| LIKE.includes('Like')\n\t|| LESS_THAN < 'Less Than'\n\t|| LESS_THAN_EQUAL <= 'Less Than or Equal'\n\t|| ONE_OF === 'APPLE001'\n\t|| !['US-SOUTH', 'US-WEST'].includes(NANY_OF)\n\t|| NOT_EQUAL !== 'Not Equal'; \n}",
  allOperatorsNOR:
    "function anonymous(record\n) {\n\n      const {ANY_OF, EMPTY, EQUAL, GREATER_THAN, GREATER_THAN_EQUAL, IS_NULL, LESS_THAN, LESS_THAN_EQUAL, LIKE, NANY_OF, NOT_EQUAL, ONE_OF} =record ;\n      return  !\t['US-SOUTH', 'US-WEST'].includes(ANY_OF)\n\t|| EMPTY === ''\n\t|| EQUAL === 'Equals'\n\t|| GREATER_THAN > 'Greater Than'\n\t|| GREATER_THAN_EQUAL >= 'Greater Than Equal'\n\t|| IS_NULL === null\n\t|| LIKE.includes('Like')\n\t|| LESS_THAN < 'Less Than'\n\t|| LESS_THAN_EQUAL <= 'Less Than or Equal'\n\t|| ONE_OF === 'APPLE001'\n\t|| !['US-SOUTH', 'US-WEST'].includes(NANY_OF)\n\t|| NOT_EQUAL !== 'Not Equal'; \n}",
  allOperatorsAND:
    "function anonymous(record\n) {\n\n      const {ANY_OF, EMPTY, EQUAL, GREATER_THAN, GREATER_THAN_EQUAL, IS_NULL, LESS_THAN, LESS_THAN_EQUAL, LIKE, NANY_OF, NOT_EQUAL, ONE_OF} =record ;\n      return  \t['US-SOUTH', 'US-WEST'].includes(ANY_OF)\n\t&& EMPTY === ''\n\t&& EQUAL === 'Equals'\n\t&& GREATER_THAN > 'Greater Than'\n\t&& GREATER_THAN_EQUAL >= 'Greater Than Equal'\n\t&& IS_NULL === null\n\t&& LIKE.includes('Like')\n\t&& LESS_THAN < 'Less Than'\n\t&& LESS_THAN_EQUAL <= 'Less Than or Equal'\n\t&& ONE_OF === 'APPLE001'\n\t&& !['US-SOUTH', 'US-WEST'].includes(NANY_OF)\n\t&& NOT_EQUAL !== 'Not Equal'; \n}",
  allOperatorsNAND:
    "function anonymous(record\n) {\n\n      const {ANY_OF, EMPTY, EQUAL, GREATER_THAN, GREATER_THAN_EQUAL, IS_NULL, LESS_THAN, LESS_THAN_EQUAL, LIKE, NANY_OF, NOT_EQUAL, ONE_OF} =record ;\n      return  !\t['US-SOUTH', 'US-WEST'].includes(ANY_OF)\n\t&& EMPTY === ''\n\t&& EQUAL === 'Equals'\n\t&& GREATER_THAN > 'Greater Than'\n\t&& GREATER_THAN_EQUAL >= 'Greater Than Equal'\n\t&& IS_NULL === null\n\t&& LIKE.includes('Like')\n\t&& LESS_THAN < 'Less Than'\n\t&& LESS_THAN_EQUAL <= 'Less Than or Equal'\n\t&& ONE_OF === 'APPLE001'\n\t&& !['US-SOUTH', 'US-WEST'].includes(NANY_OF)\n\t&& NOT_EQUAL !== 'Not Equal'; \n}",
  specialCase:
    "function anonymous(record\n) {\n\n      const {ANY_OF_INTEGER, EQUAL_DECIMAL, NANY_OF_INTEGER} =record ;\n      return  \t[2, 4].includes(ANY_OF_INTEGER)\n\t|| ![1, 3].includes(NANY_OF_INTEGER)\n\t|| EQUAL_DECIMAL === 5.001; \n}",
};
