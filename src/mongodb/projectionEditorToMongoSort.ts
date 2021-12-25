import { IProjectionEditor } from "gabby-query-protocol-projection";
import { stringify } from "querystring";
const projectionEditorToMongoSort = (projectionEditor: IProjectionEditor): object => {
  return Object.entries(projectionEditor.getProjectionOrderByColumPosition())
    .map(([key, projectedItem]) => {
      return {
        subjectId: projectedItem.subjectId,
        sortOrder: projectedItem.sortOrder,
      };
    })
    .filter((projectedItem) => projectedItem.sortOrder != 0)
    .sort((a, b) => Math.abs(a.sortOrder) - Math.abs(b.sortOrder))
    .map((projectedItem) => {
      return [projectedItem.subjectId, projectedItem.sortOrder > 0 ? 1 : -1];
    })
    .reduce((acc, curr) => {
      const [subjectId, sortOrder] = curr as [string, number];
      acc[subjectId] = sortOrder;
      return acc;
    }, {} as { [key: string]: number });
};

export { projectionEditorToMongoSort };
