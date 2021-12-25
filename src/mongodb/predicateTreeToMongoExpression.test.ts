import { ProjectionEditorFactory } from "gabby-query-protocol-projection";
import { PredicateFormulaEditorFactory } from "gabby-query-protocol-lib";
import type {
  TPredicateSubjectDictionaryJson,
  TSerializedPredicateTree,
} from "gabby-query-protocol-lib";
import type {
  TProjectableSubjectsDictionaryJson,
  TProjectionItemProperties,
} from "gabby-query-protocol-projection";

import { predicateTreeToMongoExpression } from "./predicateTreeToMongoExpression";

import subjectDictionaryJson from "./test-schemas/predicateSubjectDictionary.json";
import predicateTreeJson from "./test-schemas/predicateTree.json";

// const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson({
//   predicateTreeJson: predicateTreeJson as TSerializedPredicateTree,
//   subjectDictionaryJson: subjectDictionaryJson as TPredicateSubjectDictionaryJson,
// });

describe("predicateTreeToMongoExpression", () => {
  it("Should be awesome", () => {
    let predicateFormulaEditor;
    try {
      predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson({
        predicateTreeJson: predicateTreeJson as TSerializedPredicateTree,
        subjectDictionaryJson: subjectDictionaryJson as TPredicateSubjectDictionaryJson,
      });
    } catch (e: unknown) {
      if (typeof e === "string") {
        e.toUpperCase(); // works, `e` narrowed to string
      } else if (e instanceof Error) {
        e.message; // works, `e` narrowed to Error
      }
      if ((e as any).debugMessages) {
        console.log((e as any).debugMessages);
      }
      throw new Error("predicateFormulaEditor is undefined");
    }

    // if (!predicateFormulaEditor) {
    // }

    const actualExpression = predicateTreeToMongoExpression(predicateFormulaEditor);
    // console.log("*******************************************************");
    // console.log(JSON.stringify(actualExpression, null, 2));
    // console.log("*******************************************************");
    const expectedExpression = {
      $and: [
        {
          $and: [
            {
              clientId: {
                $regex: RegExp(/forms/, "i"),
              },
            },
            {
              clientId: {
                $ne: "forms",
              },
            },
          ],
        },
        {
          completionDate: {
            $gte: new Date("2021-12-22T00:00:00.000Z"),
          },
        },
        {
          completionDate: {
            $lte: new Date("2021-12-24T00:00:00.000Z"),
          },
        },
        {
          TEST_SUBJECT_MANY_OPERATORS: {
            $in: ["One", "Three"],
          },
        },
        {
          TEST_SUBJECT_MANY_OPERATORS: {
            $eq: "",
          },
        },
        {
          TEST_SUBJECT_MANY_OPERATORS: {
            $in: [null, false],
          },
        },
        {
          TEST_SUBJECT_MANY_OPERATORS: {
            $eq: "Two",
          },
        },
      ],
    };

    expect(actualExpression).toEqual(expectedExpression);
  });
});
