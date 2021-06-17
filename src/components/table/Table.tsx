/**
 * Todo:
 *  - height and width move to scroll object
 *  - row event prop use onRow, rowEventHandlers will deprecated
 *
 * Deprecated:
 *  - height
 *  - width
 *  - rowEventHandlers
 *  - All expanded props, move into expandable
 */

import RcTable from "./inner-table";
import { TableProps as RcTableProps } from "./inner-table/Table";
// interface ChangeEventInfo<RecordType> {
//   pagination: {
//     current?: number;
//     pageSize?: number;
//     total?: number;
//   };
//   filters: Record<string, FilterValue | null>;
//   sorter: SorterResult<RecordType> | SorterResult<RecordType>[];

//   filterStates: FilterState<RecordType>[];
//   sorterStates: SortState<RecordType>[];

//   resetPagination: Function;
// }

export interface TableProps<RecordType> extends RcTableProps<RecordType> {}

function Table<RecordType extends object = any>(props: TableProps<RecordType>) {
  return <RcTable {...props} />;
}

export default Table;
