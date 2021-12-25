// export { predicateTreeToMongoExpression } from "./predicateTreeToMongoExpression";
// export { projectionEditorToMongoProjection } from "./projection";

import { predicateTreeToMongoExpression } from "./predicateTreeToMongoExpression";
import { projectionEditorToMongoProjection } from "./projectionEditorToMongoProjection";
import { projectionEditorToMongoSort } from "./projectionEditorToMongoSort";

export const gabbyToMongo = {
  sortObject: projectionEditorToMongoSort,
  queryObject: predicateTreeToMongoExpression,
  projectionObject: projectionEditorToMongoProjection,
};
