import { IProjectionEditor } from "gabby-query-protocol-projection";
import { stringify } from "querystring";
const projectionEditorToMongoProjection = (
  projectionEditor: IProjectionEditor
): object => {
  return Object.entries(projectionEditor.getProjectionOrderByColumPosition())
    .map(([key, projectedItem]) => {
      return {
        subjectId: projectedItem.subjectId,
        columnOrder: projectedItem.columnOrder,
      };
    })
    .filter((projectedItem) => projectedItem.columnOrder >= 0)
    .sort((a, b) => a.columnOrder - b.columnOrder)
    .map((projectedItem) => {
      return projectedItem.subjectId;
    })
    .reduce((acc, curr) => {
      acc[curr] = 1;
      return acc;
    }, {} as { [key: string]: number });
};

export { projectionEditorToMongoProjection };
