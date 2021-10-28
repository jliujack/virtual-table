import * as React from 'react';
import classNames from 'classnames';
import { Tooltip, TooltipProps } from 'antd';
import CaretDownOutlined from '@ant-design/icons/CaretDownOutlined';
import CaretUpOutlined from '@ant-design/icons/CaretUpOutlined';

import { getPathValue } from '../inner-table';

import type {
  TransformColumns,
  ColumnsType,
  Key,
  ColumnType,
  SortOrder,
  CompareFn,
  ColumnTitleProps,
  SorterResult,
  ColumnGroupType,
  TableLocale,
} from '../interface';
import { getColumnKey, getColumnPos, renderColumnTitle } from '../util';

const ASCEND = 'asc';
const DESCEND = 'desc';

function getMultiplePriority<RecordType>(column: ColumnType<RecordType>): number | false {
  if (typeof column.sorter === 'object' && typeof column.sorter.multiple === 'number') {
    return column.sorter.multiple;
  }
  return false;
}

function getSortFunction<RecordType>(
  sorter: ColumnType<RecordType>['sorter'],
): CompareFn<RecordType> | false {
  if (typeof sorter === 'function') {
    return sorter;
  }
  if (sorter && typeof sorter === 'object' && sorter.compare) {
    return sorter.compare;
  }
  return false;
}

function nextSortDirection(sortDirections: SortOrder[], current: SortOrder | null) {
  if (!current) {
    return sortDirections[0];
  }

  return sortDirections[sortDirections.indexOf(current) + 1];
}

export interface SortState<RecordType> {
  column: ColumnType<RecordType>;
  key: Key;
  sortOrder: SortOrder | null;
  multiplePriority: number | false;
}

/** SorterResult 转换为SortState */
function infoToState<RecordType>(
  info: SorterResult<RecordType>,
  idx?: number,
): SortState<RecordType> {
  const { column, key, order } = info;
  let priority: number | boolean = false;
  if (typeof idx === 'number') {
    priority = 0 - idx;
  }
  return {
    column,
    key,
    sortOrder: order,
    multiplePriority: priority,
  };
}

function generateSortState<RecordType>(
  sortedInfo: SortedInfo<RecordType>,
): SortState<RecordType>[] {
  if (Array.isArray(sortedInfo)) {
    return sortedInfo.filter((info) => info.order).map(infoToState);
  }

  return [infoToState(sortedInfo)];
}

function collectSortStates<RecordType>(
  columns: ColumnsType<RecordType>,
  init: boolean,
  pos?: string,
  sortedInfo?: SortedInfo<RecordType>,
): SortState<RecordType>[] {
  if (sortedInfo) {
    // 兼容旧版本使用sortedInfo的模式
    return generateSortState(sortedInfo);
  }

  let sortStates: SortState<RecordType>[] = [];

  function pushState(column: ColumnsType<RecordType>[number], columnPos: string) {
    sortStates.push({
      column,
      key: getColumnKey(column, columnPos),
      multiplePriority: getMultiplePriority(column),
      sortOrder: column.sortOrder!,
    });
  }

  (columns || []).forEach((column, index) => {
    const columnPos = getColumnPos(index, pos);

    if ((column as ColumnGroupType<RecordType>).children) {
      if ('sortOrder' in column) {
        // Controlled
        pushState(column, columnPos);
      }
      sortStates = [
        ...sortStates,
        ...collectSortStates((column as ColumnGroupType<RecordType>).children, init, columnPos),
      ];
    } else if (column.sorter) {
      if ('sortOrder' in column) {
        // Controlled
        pushState(column, columnPos);
      } else if (init && column.defaultSortOrder) {
        // Default sorter
        sortStates.push({
          column,
          key: getColumnKey(column, columnPos),
          multiplePriority: getMultiplePriority(column),
          sortOrder: column.defaultSortOrder!,
        });
      }
    }
  });

  return sortStates;
}

function injectSorter<RecordType>(
  prefixCls: string,
  columns: ColumnsType<RecordType>,
  sorterSates: SortState<RecordType>[],
  triggerSorter: (sorterSates: SortState<RecordType>) => void,
  defaultSortDirections: SortOrder[],
  tableLocale?: TableLocale,
  tableShowSorterTooltip?: boolean | TooltipProps,
  pos?: string,
): ColumnsType<RecordType> {
  const newColumns = (columns || []).map((column, index) => {
    const columnPos = getColumnPos(index, pos);
    // 如果列未变化 保持其引用并返回， 这时候我们认为子列不会变化
    const lastColumnInfo = injectSorter.lastColumnsKeyMap.get(columnPos);
    if (lastColumnInfo && column === lastColumnInfo.before) {
      return lastColumnInfo.after as ColumnGroupType<RecordType> | ColumnType<RecordType>;
    }

    let newColumn: ColumnsType<RecordType>[number] = column;

    if (newColumn.sorter) {
      const sortDirections: SortOrder[] = newColumn.sortDirections || defaultSortDirections;
      const showSorterTooltip =
        newColumn.showSorterTooltip === undefined
          ? tableShowSorterTooltip
          : newColumn.showSorterTooltip;
      const columnKey = getColumnKey(newColumn, columnPos);
      const sorterState = sorterSates.find(({ key }) => key === columnKey);
      const sorterOrder = sorterState ? sorterState.sortOrder : null;
      const nextSortOrder = nextSortDirection(sortDirections, sorterOrder);
      const upNode: React.ReactNode = sortDirections.includes(ASCEND) && (
        <CaretUpOutlined
          className={classNames(`${prefixCls}-column-sorter-up`, {
            active: sorterOrder === ASCEND,
          })}
        />
      );
      const downNode: React.ReactNode = sortDirections.includes(DESCEND) && (
        <CaretDownOutlined
          className={classNames(`${prefixCls}-column-sorter-down`, {
            active: sorterOrder === DESCEND,
          })}
        />
      );
      const { cancelSort, triggerAsc, triggerDesc } = tableLocale || {};
      let sortTip: string | undefined = cancelSort;
      if (nextSortOrder === DESCEND) {
        sortTip = triggerDesc;
      } else if (nextSortOrder === ASCEND) {
        sortTip = triggerAsc;
      }
      const tooltipProps: TooltipProps =
        typeof showSorterTooltip === 'object' ? showSorterTooltip : { title: sortTip };
      newColumn = {
        ...newColumn,
        className: classNames(newColumn.className, {
          [`${prefixCls}-column-sort`]: sorterOrder,
        }),
        title: (renderProps: ColumnTitleProps<RecordType>) => {
          const renderSortTitle = (
            <div className={`${prefixCls}-column-sorters`}>
              <span className={`${prefixCls}-column-title`}>
                {renderColumnTitle(column.title, renderProps)}
              </span>
              <span
                className={classNames(`${prefixCls}-column-sorter`, {
                  [`${prefixCls}-column-sorter-full`]: !!(upNode && downNode),
                })}
              >
                <span className={`${prefixCls}-column-sorter-inner`}>
                  {upNode}
                  {downNode}
                </span>
              </span>
            </div>
          );
          return showSorterTooltip ? (
            <Tooltip {...tooltipProps}>{renderSortTitle}</Tooltip>
          ) : (
            renderSortTitle
          );
        },
        onHeaderCell: (col) => {
          const cell: React.HTMLAttributes<HTMLElement> =
            (column.onHeaderCell && column.onHeaderCell(col)) || {};
          const originOnClick = cell.onClick;
          cell.onClick = (event: React.MouseEvent<HTMLElement>) => {
            triggerSorter({
              column,
              key: columnKey,
              sortOrder: nextSortOrder,
              multiplePriority: getMultiplePriority(column),
            });

            if (originOnClick) {
              originOnClick(event);
            }
          };

          cell.className = classNames(cell.className, `${prefixCls}-column-has-sorters`);

          return cell;
        },
      };
    }

    if ('children' in newColumn) {
      newColumn = {
        ...newColumn,
        children: injectSorter(
          prefixCls,
          newColumn.children,
          sorterSates,
          triggerSorter,
          defaultSortDirections,
          tableLocale,
          tableShowSorterTooltip,
          columnPos,
        ),
      };
    }

    injectSorter.lastColumnsKeyMap.set(columnPos, column);

    return newColumn;
  });

  return newColumns;
}

injectSorter.lastColumnsKeyMap = new Map<string, { before: unknown; after: unknown }>();

function stateToInfo<RecordType>(sorterStates: SortState<RecordType>) {
  const { column = {}, sortOrder, key } = sorterStates;
  return {
    column,
    order: sortOrder,
    field: column.dataIndex,
    columnKey: column.key,
    key,
  };
}

function generateSorterInfo<RecordType>(
  sorterStates: SortState<RecordType>[],
  sortedInfo?: SortedInfo<RecordType>[] | SortedInfo<RecordType>,
): SortedInfo<RecordType> {
  const list = sorterStates.filter(({ sortOrder, column }) => sortOrder && column).map(stateToInfo);

  // =========== Legacy compatible support ===========
  // https://github.com/ant-design/ant-design/pull/19226
  if (list.length === 0 && sorterStates.length) {
    if (Array.isArray(sortedInfo)) {
      return [];
    }

    return {
      ...stateToInfo(sorterStates[sorterStates.length - 1]),
      column: {},
    };
  }

  if (list.length <= 1 && !Array.isArray(sortedInfo)) {
    return list[0] || {};
  }

  return list;
}

export function getSortData<RecordType>(
  data: readonly RecordType[],
  sortStates: SortState<RecordType>[],
  childrenColumnName: string,
): RecordType[] {
  const innerSorterStates = sortStates
    .slice()
    .sort((a, b) => (b.multiplePriority as number) - (a.multiplePriority as number));

  const cloneData = data.slice();

  const runningSorters = innerSorterStates.filter(({ column, sortOrder }) => {
    const { sorter } = column || {};
    return getSortFunction(sorter) && sortOrder;
  });

  // Skip if no sorter needed
  if (!runningSorters.length) {
    return cloneData;
  }

  return cloneData
    .sort((record1, record2) => {
      for (let i = 0; i < runningSorters.length; i += 1) {
        const sorterState = runningSorters[i];
        const {
          column: { sorter },
          sortOrder,
        } = sorterState;

        const compareFn = getSortFunction(sorter);

        if (compareFn && sortOrder) {
          const compareResult = compareFn(record1, record2, sortOrder);

          if (compareResult !== 0) {
            return sortOrder === ASCEND ? compareResult : -compareResult;
          }
        }
      }

      return 0;
    })
    .map<RecordType>((record) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subRecords = (record as any)[childrenColumnName];
      if (subRecords) {
        return {
          ...record,
          [childrenColumnName]: getSortData(subRecords, sortStates, childrenColumnName),
        };
      }
      return record;
    });
}

type SortedInfo<RecordType> = SorterResult<RecordType> | SorterResult<RecordType>[];

interface SorterConfig<RecordType> {
  prefixCls: string;
  mergedColumns: ColumnsType<RecordType>;
  onSorterChange: (
    sorterResult: SortedInfo<RecordType>,
    sortStates: SortState<RecordType>[],
  ) => void;
  sortDirections: SortOrder[];
  tableLocale?: TableLocale;
  showSorterTooltip?: boolean | TooltipProps;
  sortedInfo?: SortedInfo<RecordType>;
}

export default function useFilterSorter<RecordType extends Record<string, unknown>>({
  prefixCls,
  mergedColumns,
  onSorterChange,
  sortDirections,
  tableLocale,
  showSorterTooltip,
  sortedInfo,
}: SorterConfig<RecordType>): [
  TransformColumns<RecordType>,
  SortState<RecordType>[],
  ColumnTitleProps<RecordType>,
  () => SortedInfo<RecordType>,
] {
  const [sortStates, setSortStates] = React.useState<SortState<RecordType>[]>(
    collectSortStates(mergedColumns, true, undefined, sortedInfo),
  );

  const mergedSorterStates = React.useMemo(() => {
    let validate = true;
    const collectedStates = collectSortStates(mergedColumns, false, undefined, sortedInfo);

    // Return if not controlled
    if (!collectedStates.length) {
      return sortStates;
    }

    const validateStates: SortState<RecordType>[] = [];

    function patchStates(state: SortState<RecordType>) {
      if (validate) {
        validateStates.push(state);
      } else {
        validateStates.push({
          ...state,
          sortOrder: null,
        });
      }
    }

    let multipleMode: boolean | null = null;
    collectedStates.forEach((state) => {
      if (multipleMode === null) {
        patchStates(state);

        if (state.sortOrder) {
          if (state.multiplePriority === false && !Array.isArray(sortedInfo)) {
            validate = false;
          } else {
            multipleMode = true;
          }
        }
      } else if (multipleMode && state.multiplePriority !== false) {
        patchStates(state);
      } else {
        validate = false;
        patchStates(state);
      }
    });

    return validateStates;
  }, [mergedColumns, sortStates, sortedInfo]);

  // Get render columns title required props
  const columnTitleSorterProps = React.useMemo<ColumnTitleProps<RecordType>>(() => {
    const sortColumns = mergedSorterStates.map(({ column, sortOrder }) => ({
      column,
      order: sortOrder,
    }));

    return {
      sortColumns,
      // Legacy
      sortColumn: sortColumns[0] && sortColumns[0].column,
      sortOrder: sortColumns[0] && sortColumns[0].order,
    };
  }, [mergedSorterStates]);

  const triggerSorter = React.useCallback(
    (sortState: SortState<RecordType>) => {
      let newSorterStates;

      // add default sorter function
      const { column } = sortState;
      if (column.sorter === true) {
        column.sorter = (a: RecordType, b: RecordType) => {
          const prev = getPathValue<Record<string, unknown> | React.ReactNode, RecordType>(
            a!,
            (column as ColumnType<RecordType>).dataIndex!,
          );
          const next = getPathValue<Record<string, unknown> | React.ReactNode, RecordType>(
            b!,
            (column as ColumnType<RecordType>).dataIndex!,
          );
          return String(prev).localeCompare(String(next));
        };
      }

      if (
        (sortState.multiplePriority === false ||
          !mergedSorterStates.length ||
          mergedSorterStates[0].multiplePriority === false) &&
        !Array.isArray(sortedInfo)
      ) {
        newSorterStates = [sortState];
      } else {
        newSorterStates = [
          ...mergedSorterStates.filter(({ key }) => key !== sortState.key),
          sortState,
        ];
      }

      setSortStates(newSorterStates);
      onSorterChange(generateSorterInfo(newSorterStates, sortedInfo), newSorterStates);
    },
    [mergedSorterStates, onSorterChange, sortedInfo],
  );

  const transformColumns = React.useCallback(
    (innerColumns: ColumnsType<RecordType>) =>
      injectSorter(
        prefixCls,
        innerColumns,
        mergedSorterStates,
        triggerSorter,
        sortDirections,
        tableLocale,
        showSorterTooltip,
      ),
    [mergedSorterStates, prefixCls, showSorterTooltip, sortDirections, tableLocale, triggerSorter],
  );

  const getSorters = () => generateSorterInfo(mergedSorterStates);

  return [transformColumns, mergedSorterStates, columnTitleSorterProps, getSorters];
}
