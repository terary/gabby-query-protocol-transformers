import type {
  IProjectionEditor,
  TProjectionItemProperties,
} from "gabby-query-protocol-projection";

const SORT_NONE = 0;
const PRETTY = true;
const nl = (isPretty: boolean) => {
  return isPretty ? "\n" : " ";
};
const tabs = (tabPosition: number, isPretty: boolean) => {
  return isPretty ? "\t".repeat(tabPosition) : "";
};

const orderByFilter = (projectionItem: TProjectionItemProperties) => {
  return projectionItem.sortOrder !== SORT_NONE;
};

const getOrderByColumns = (projectionEditor: IProjectionEditor) => {
  return projectionEditor.filterProjection(orderByFilter).sort((a, b) => {
    return Math.abs(a.sortOrder) - Math.abs(b.sortOrder);
  });
};

const getOrderByColumnsSqlEncode = (projectionEditor: IProjectionEditor) => {
  const columns = getOrderByColumns(projectionEditor);
  return columns.map((column) => {
    return `${column.subjectId} ${column.sortOrder > 0 ? "ASC" : "DESC"}`;
  });
};

const _getOrderByAsSqlString = (
  projectionEditor: IProjectionEditor,
  tabCount = 0,
  isPretty = false
) => {
  const columns = getOrderByColumnsSqlEncode(projectionEditor);
  return (
    tabs(tabCount, isPretty) + columns.join(`,${nl(isPretty)}${tabs(tabCount, isPretty)}`)
  );
};

export const OrderBy = {
  getOrderByColumns,
  getOrderByColumnsSqlEncode, //getOrderByColumnsAsSql
  getOrderByAsSqlStringPretty: (projectionEditor: IProjectionEditor, tabCount = 1) => {
    return _getOrderByAsSqlString(projectionEditor, tabCount, PRETTY);
  },

  getOrderByAsSqlString: (projectionEditor: IProjectionEditor) => {
    return _getOrderByAsSqlString(projectionEditor);
  },
};
