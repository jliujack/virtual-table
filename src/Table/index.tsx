import Table, { TableProps, TableRef } from './Table';
import { ColumnProps } from './Column';
import type {
  ColumnsType,
  ColumnType,
  ColumnGroupType,
  ExpandableConfig,
  TableRowSelection,
} from './interface';

export type {
  TableProps,
  TableRef,
  ColumnProps,
  ColumnsType,
  ColumnType,
  ColumnGroupType,
  ExpandableConfig,
  TableRowSelection,
};

export default Table;

/** Description of the TableProps */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TablePropsApi<RecordType>(props: TableProps<RecordType>) {
  console.log('liujie log:', 'props:', props);
  return null;
}

/** Description of the Columns */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ColumnsApi<RecordType>(props: ColumnType<RecordType>) {
  console.log('liujie log:', 'props:', props);
  return null;
}

/** Description of the Expandable */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Expandable<RecordType>(props: ExpandableConfig<RecordType>) {
  console.log('liujie log:', 'props:', props);
  return null;
}

/** Description of the Selection */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Selection<RecordType>(props: TableRowSelection<RecordType>) {
  console.log('liujie log:', 'props:', props);
  return null;
}
