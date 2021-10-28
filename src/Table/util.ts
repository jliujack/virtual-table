import { ColumnGroupType } from './inner-table/interface';
import {
  ColumnType,
  ColumnTitle,
  ColumnTitleProps,
  Key,
  ColumnsType,
  ResizableConfig,
} from './interface';

export function getColumnKey<RecordType>(column: ColumnType<RecordType>, defaultKey: string): Key {
  if ('key' in column && column.key !== undefined && column.key !== null) {
    return column.key;
  }
  if (column.dataIndex) {
    return (Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex) as Key;
  }

  return defaultKey;
}

export function getColumnPos(index: number, pos?: string) {
  return pos ? `${pos}-${index}` : `${index}`;
}

export function renderColumnTitle<RecordType>(
  title: ColumnTitle<RecordType>,
  props: ColumnTitleProps<RecordType>,
) {
  if (typeof title === 'function') {
    return title(props);
  }

  return title;
}

export function getChangeWidthColumn<RecordType>(
  columns: ColumnsType<RecordType>,
  widthMap: Parameters<ResizableConfig['onColumnResize']>[0],
) {
  return columns.map((col, index) => {
    const key = getColumnKey(col, `column-${index}`);
    const width = widthMap[key];
    if (width) {
      return {
        ...col,
        width,
      };
    }

    const child = (col as ColumnGroupType<RecordType>).children;
    if (child) {
      // eslint-disable-next-line no-param-reassign
      (col as ColumnGroupType<RecordType>).children = getChangeWidthColumn(child, widthMap);
    }

    return col;
  });
}
