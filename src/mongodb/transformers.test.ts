import {
  TPredicateProperties,
  TPredicatePropertiesArrayValue,
} from "gabby-query-protocol-lib";
import {
  simplePredicateToMongo,
  arrayValuePredicateToMongo,
  junctionAndToMongo,
  junctionNandToMongo,
  junctionOrToMongo,
  junctionNorToMongo,
} from "./transformers";
import type { TPredicateOperator } from "gabby-query-protocol-lib";
describe("simplePredicateToMongo", () => {
  describe("Unsupported  operators", () => {
    it("Should throw error for $anyOf", () => {
      const predicate: TPredicateProperties = {
        subjectId: "name",
        operator: "$anyOf",
        value: "John",
      };
      const datatype = "string";
      const willThrow = () => {
        simplePredicateToMongo(predicate, datatype);
      };
      expect(willThrow).toThrow(
        "$anyOf, $nanyOf, not supported by simplePredicateToMongo"
      );
    });
    it("Should throw error for $nanyOf", () => {
      const predicate: TPredicateProperties = {
        subjectId: "name",
        operator: "$nanyOf",
        value: "John",
      };
      const datatype = "string";
      const willThrow = () => {
        simplePredicateToMongo(predicate, datatype);
      };
      expect(willThrow).toThrow(
        "$anyOf, $nanyOf, not supported by simplePredicateToMongo"
      );
    });
  }); //describe Unsupported  operators
  describe("Datatype encoding", () => {
    it("Should quote enclose for 'string' ", () => {
      const predicate: TPredicateProperties = {
        subjectId: "name",
        operator: "$gt",
        value: "3",
      };
      const datatype = "string";
      const mongoPredicate = simplePredicateToMongo(predicate, datatype);
      expect(mongoPredicate).toStrictEqual({ name: { $gt: "3" } });
    });
    describe("Integer", () => {
      it("Should *not* quote enclose for 'integer' ", () => {
        const predicate: TPredicateProperties = {
          subjectId: "name",
          operator: "$gt",
          value: 3,
        };
        const datatype = "integer";
        const mongoPredicate = simplePredicateToMongo(predicate, datatype);
        expect(mongoPredicate).toStrictEqual({ name: { $gt: 3 } });
      });
      it("Should return value undecorated, if quoted - returns quote, if not quoted return unquoted", () => {
        const predicate: TPredicateProperties = {
          subjectId: "name",
          operator: "$gt",
          value: "3",
        };
        const datatype = "integer";
        const mongoPredicate = simplePredicateToMongo(predicate, datatype);
        expect(mongoPredicate).toStrictEqual({ name: { $gt: "3" } });
      });
    }); //describe integer
    describe("Decimal", () => {
      it("Should *not* quote enclose for 'integer' ", () => {
        const predicate: TPredicateProperties = {
          subjectId: "name",
          operator: "$gt",
          value: 3.1,
        };
        const datatype = "decimal";
        const mongoPredicate = simplePredicateToMongo(predicate, datatype);
        expect(mongoPredicate).toStrictEqual({ name: { $gt: 3.1 } });
      });
      it("Should return value undecorated, if quoted - returns quote, if not quoted return unquoted", () => {
        const predicate: TPredicateProperties = {
          subjectId: "name",
          operator: "$gt",
          value: "3.1",
        };
        const datatype = "decimal";
        const mongoPredicate = simplePredicateToMongo(predicate, datatype);
        expect(mongoPredicate).toStrictEqual({ name: { $gt: "3.1" } });
      });
      it("Javascript odd behavior of converting decimal to integer ", () => {
        const predicate: TPredicateProperties = {
          subjectId: "name",
          operator: "$gt",
          value: 3.0,
        };
        const datatype = "decimal";
        const mongoPredicate = simplePredicateToMongo(predicate, datatype);
        expect(mongoPredicate).toStrictEqual({ name: { $gt: 3 } });
        expect(JSON.stringify(mongoPredicate)).toStrictEqual(
          JSON.stringify({ name: { $gt: 3 } })
        );
      });
    }); //decimal
    describe("Date", () => {
      it("Should format with ISODate([value])", () => {
        const predicate: TPredicateProperties = {
          subjectId: "name",
          operator: "$gt",
          value: "2021-12-21T03:32:59.000Z",
        };
        const datatype = "datetime";
        const mongoPredicate = simplePredicateToMongo(predicate, datatype);
        expect(mongoPredicate).toStrictEqual({
          name: { $gt: new Date("2021-12-21T03:32:59.000Z") },
        });
      });
    }); //describe(Date)
  }); // value encoding
  describe("Simple operators: [$eq, $gt, $gte, $lt, $lte, $ne]", () => {
    // const testOperator = "$eq";
    ["$eq", "$gt", "$gte", "$lt", "$lte", "$ne"].forEach((testOperator) => {
      it(`Should produce mongo express for ${testOperator}`, () => {
        const predicate: TPredicateProperties = {
          subjectId: "name",
          operator: testOperator as TPredicateOperator,
          value: "some value",
        };
        const datatype = "decimal";
        const mongoPredicate = simplePredicateToMongo(predicate, datatype);
        expect(mongoPredicate).toStrictEqual({
          name: { [testOperator]: "some value" },
        });
      });
    });
  }); // describe("Simple operators
  describe("Special operators", () => {
    it("$empty - will result in empty string value regardless of value", () => {
      const predicate: TPredicateProperties = {
        subjectId: "name",
        operator: "$empty" as TPredicateOperator,
        value: "some value",
      };
      const datatype = "string";
      const mongoPredicate = simplePredicateToMongo(predicate, datatype);
      expect(mongoPredicate).toStrictEqual({
        name: { $eq: "" },
      });
    });
    it("$isNull - will result in empty string value regardless of value", () => {
      const predicate: TPredicateProperties = {
        subjectId: "name",
        operator: "$isNull" as TPredicateOperator,
        value: "some value",
      };
      const datatype = "string";
      const mongoPredicate = simplePredicateToMongo(predicate, datatype);
      expect(mongoPredicate).toStrictEqual({
        name: { $in: [null, false] },
      });
    });
    it("$oneOf converts to $eq", () => {
      const predicate: TPredicateProperties = {
        subjectId: "name",
        operator: "$oneOf" as TPredicateOperator,
        value: "some value",
      };
      const datatype = "string";
      const mongoPredicate = simplePredicateToMongo(predicate, datatype);
      expect(mongoPredicate).toStrictEqual({
        name: { $eq: "some value" },
      });
    });
    it("$like should return regular expression (**CAREFUL**)", () => {
      const predicate: TPredicateProperties = {
        subjectId: "name",
        operator: "$like" as TPredicateOperator,
        value: "some value",
      };
      const datatype = "string";
      const mongoPredicate = simplePredicateToMongo(predicate, datatype);
      expect(mongoPredicate).toStrictEqual({
        name: { $regex: /some value/i },
      });
    });
  }); // describe("Special operators",
  // });
}); // simplePredicateToMongo
describe("arrayValuePredicateToMongo ($anyOf, $nanyOf)", () => {
  it("$anyOf Should return $in statement", () => {
    const predicate: TPredicatePropertiesArrayValue = {
      subjectId: "name",
      operator: "$anyOf" as TPredicateOperator,
      value: ["one", "two", "three"],
    };
    const datatype = "string";
    const mongoPredicate = arrayValuePredicateToMongo(predicate, datatype);
    expect(mongoPredicate).toStrictEqual({
      name: { $in: ["one", "two", "three"] },
    });
  });
  it("$nanyOf Should return $in statement", () => {
    const predicate: TPredicatePropertiesArrayValue = {
      subjectId: "name",
      operator: "$nanyOf" as TPredicateOperator,
      value: ["one", "two", "three"],
    };
    const datatype = "string";
    const mongoPredicate = arrayValuePredicateToMongo(predicate, datatype);
    expect(mongoPredicate).toStrictEqual({
      name: { $not: { $in: ["one", "two", "three"] } },
    });
  });
}); // describe("arrayValuePredicateToMongo
describe("junction operators", () => {
  it("Should return an $and expression", () => {
    const term1 = { firstname: { $eq: "barney" } };
    const term2 = { lastname: { $eq: "rubble" } };
    const expectedExpression = {
      $and: [{ firstname: { $eq: "barney" } }, { lastname: { $eq: "rubble" } }],
    };
    const actualExpression = junctionAndToMongo(term1, term2);
    expect(actualExpression).toStrictEqual(expectedExpression);
  });
  it("Should return an $nand expression", () => {
    const term1 = { firstname: { $eq: "barney" } };
    const term2 = { lastname: { $eq: "rubble" } };
    const expectedExpression = {
      $not: {
        $and: [{ firstname: { $eq: "barney" } }, { lastname: { $eq: "rubble" } }],
      },
    };
    const actualExpression = junctionNandToMongo(term1, term2);
    expect(actualExpression).toStrictEqual(expectedExpression);
  });
  it("Should return an $or expression", () => {
    const term1 = { firstname: { $eq: "barney" } };
    const term2 = { lastname: { $eq: "rubble" } };
    const expectedExpression = {
      $or: [{ firstname: { $eq: "barney" } }, { lastname: { $eq: "rubble" } }],
    };
    const actualExpression = junctionOrToMongo(term1, term2);
    expect(actualExpression).toStrictEqual(expectedExpression);
  });
  it("Should return an $nor expression", () => {
    const term1 = { firstname: { $eq: "barney" } };
    const term2 = { lastname: { $eq: "rubble" } };
    const expectedExpression = {
      $not: {
        $or: [{ firstname: { $eq: "barney" } }, { lastname: { $eq: "rubble" } }],
      },
    };
    const actualExpression = junctionNorToMongo(term1, term2);
    expect(actualExpression).toStrictEqual(expectedExpression);
  });
});
