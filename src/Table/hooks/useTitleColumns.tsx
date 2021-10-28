import * as React from 'react';
import {
  TransformColumns,
  ColumnTitleProps,
  ColumnsType,
  ColumnGroupType,
  ColumnType,
} from '../interface';
import { renderColumnTitle, getColumnPos } from '../util';

function fillTitle<RecordType>(
  columns: ColumnsType<RecordType>,
  columnTitleProps: ColumnTitleProps<RecordType>,
  pos?: string,
) {
  return columns.map((column, index) => {
    const columnPos = getColumnPos(index, pos);
    // 如果列未变化 保持其引用并返回， 这时候我们认为子列不会变化
    const lastColumnInfo = fillTitle.lastColumnsKeyMap.get(columnPos);
    if (lastColumnInfo && column === lastColumnInfo.before) {
      if (!column.width) {
        (lastColumnInfo.after as ColumnType<RecordType>).width = undefined;
      }
      const newColumn = lastColumnInfo.after as
        | ColumnGroupType<RecordType>
        | ColumnType<RecordType>;
      // Object.assign(newColumn, column);
      return newColumn;
    }

    const cloneColumn = { ...column };

    cloneColumn.title = renderColumnTitle(column.title, columnTitleProps);

    if ('children' in cloneColumn) {
      cloneColumn.children = fillTitle(cloneColumn.children, columnTitleProps, columnPos);
    }
    fillTitle.lastColumnsKeyMap.set(columnPos, { before: column, after: cloneColumn });

    return cloneColumn;
  });
}

fillTitle.lastColumnsKeyMap = new Map<string, { before: unknown; after: unknown }>();

export default function useTitleColumns<RecordType>(
  columnTitleProps: ColumnTitleProps<RecordType>,
): [TransformColumns<RecordType>] {
  const filledColumns = React.useCallback(
    (columns: ColumnsType<RecordType>) => fillTitle(columns, columnTitleProps),
    [columnTitleProps],
  );

  return [filledColumns];
}
