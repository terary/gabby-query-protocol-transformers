import { TPredicateProperties } from "gabby-query-protocol-lib";
import { simplePredicateToJsExpression, functionBodyWrapper } from "./matching-functions";

describe("matcher-functions", () => {
  describe("Simple operators", () => {
    describe("$eq", () => {
      it("Should return snippet appropriate for logic comparison (string) ", () => {
        const predicate = {
          operator: "$eq",
          value: "3",
          subjectId: "parameter",
        } as TPredicateProperties;
        const expression = simplePredicateToJsExpression(predicate, "string") || "";
        const matcher = expressionToFunction(expression, predicate.subjectId);
        expect(matcher({ parameter: "3" })).toBe(true);
        expect(matcher({ parameter: 3 })).toBe(false);
        expect(matcher({ parameter: "2" })).toBe(false);
      });
      it("Should return snippet appropriate for logic comparison (integer) ", () => {
        const predicate = {
          operator: "$eq",
          value: 3,
          subjectId: "parameter",
        } as TPredicateProperties;
        const expression = simplePredicateToJsExpression(predicate, "integer") || "";
        const matcher = expressionToFunction(expression, "parameter");
        const v = matcher({ parameter: 3 });
        expect(matcher({ parameter: "3" })).toBe(false);
        expect(matcher({ parameter: 3 })).toBe(true);
        expect(matcher({ parameter: 2 })).toBe(false);
      });
    }); // $eq
    describe("Non simple operator", () => {
      it("Should throw error if used with $like", () => {
        const predicate = {
          operator: "$like",
          value: 3,
          subjectId: "parameter",
        } as TPredicateProperties;

        const willThrow = () => {
          simplePredicateToJsExpression(predicate, "integer");
        };
        expect(willThrow).toThrow(Error);
        expect(willThrow).toThrow(
          '"$like", "$anyOf", "$nanyOf" are not supported by simplePredicateToJsExpression()'
        );
      });
      it("Should throw error if used with $anyOf", () => {
        const predicate = {
          operator: "$anyOf",
          value: 3,
          subjectId: "parameter",
        } as TPredicateProperties;

        const willThrow = () => {
          simplePredicateToJsExpression(predicate, "integer");
        };
        expect(willThrow).toThrow(Error);
        expect(willThrow).toThrow(
          '"$like", "$anyOf", "$nanyOf" are not supported by simplePredicateToJsExpression()'
        );
      });
      it("Should throw error if used with $nanyOf", () => {
        const predicate = {
          operator: "$nanyOf",
          value: 3,
          subjectId: "parameter",
        } as TPredicateProperties;

        const willThrow = () => {
          simplePredicateToJsExpression(predicate, "integer");
        };
        expect(willThrow).toThrow(Error);
        expect(willThrow).toThrow(
          '"$like", "$anyOf", "$nanyOf" are not supported by simplePredicateToJsExpression()'
        );
      });
    }); // describe('$like',
  }); //describe('Simple operators'
}); // describe('matcher-functions

const expressionToFunction = (logicTest: string, ...parameters: string[]) => {
  const fnBody = functionBodyWrapper(logicTest, ...parameters);

  return new Function("record", fnBody);
};
