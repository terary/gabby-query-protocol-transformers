import type {
  IProjectionEditor,
  TProjectionItemProperties,
} from "gabby-query-protocol-projection";

const PRETTY = true;
const nl = (isPretty: boolean) => {
  return isPretty ? "\n" : " ";
};
const tabs = (tabPosition: number, isPretty: boolean) => {
  return isPretty ? "\t".repeat(tabPosition) : "";
};

const selectableFilter = (projectionItem: TProjectionItemProperties) => {
  return projectionItem.columnOrder >= 0;
};

const getSelectColumns = (projectionEditor: IProjectionEditor) => {
  return projectionEditor.filterProjection(selectableFilter).sort((a, b) => {
    return a.columnOrder - b.columnOrder;
  });
};

const getSelectColumnsSqlEncode = (
  projectionEditor: IProjectionEditor,
  leftDelimiter = "`",
  rightDelimiter = "`"
) => {
  return getSelectColumns(projectionEditor).map(
    (column) => `${column.subjectId} AS ${leftDelimiter}${column.label}${rightDelimiter}`
  );
};

const _getSelectAsSqlStringPretty = (
  projectionEditor: IProjectionEditor,
  leftDelimiter: string,
  rightDelimiter: string,
  tabPosition = 0,
  isPretty = false
) => {
  return getSelectColumns(projectionEditor)
    .map(
      (column) =>
        `${tabs(tabPosition, isPretty)}${column.subjectId} AS ${leftDelimiter}${
          column.label
        }${rightDelimiter}`
    )
    .join(`,${nl(isPretty)}`);
};
export const Select = {
  getSelectColumns,
  getSelectColumnsSqlEncode,
  getSelectAsSqlString: (
    projectionEditor: IProjectionEditor,
    leftDelimiter = "`",
    rightDelimiter = "`"
  ) => {
    return _getSelectAsSqlStringPretty(projectionEditor, leftDelimiter, rightDelimiter);
  }, // getSelectSQLString,

  getSelectAsSqlStringPretty: (
    projectionEditor: IProjectionEditor,
    leftDelimiter = "`",
    rightDelimiter = "`",
    tabPosition = 1
  ) => {
    return _getSelectAsSqlStringPretty(
      projectionEditor,
      leftDelimiter,
      rightDelimiter,
      tabPosition,
      PRETTY
    );
  },
};
