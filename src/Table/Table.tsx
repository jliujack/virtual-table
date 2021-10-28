/**
 * Todo:
 *  - row event prop use onRow, rowEventHandlers will deprecated
 *  - add sort handle
 *  - add select ?
 *  -
 *
 * Deprecated:
 *  - rowEventHandlers
 *  - All expanded props, move into expandable
 */

import * as React from 'react';
import classNames from 'classnames';
import omit from 'rc-util/lib/omit';
import { Spin, SpinProps, Empty, TooltipProps } from 'antd';

import { AutoResizer, AutoResizerNext } from '../AutoResizer';
import { CONTEXT_MENU } from '../ContextMenu';
import HighLight from '../Highlight';

import useLazyKVMap from './hooks/useLazyKVMap';
import useSelection, { ShowSelectionColumnProps } from './hooks/useSelection';
import type { SortState } from './hooks/useSorter';
import useSorter, { getSortData } from './hooks/useSorter';
import useTitleColumns from './hooks/useTitleColumns';
import useResizable from './hooks/useResizable';
import renderExpandIcon from './ExpandIcon';
import type {
  TableRowSelection,
  GetRowKey,
  ColumnsType,
  SorterResult,
  ExpandableConfig,
  ExpandType,
  TablePaginationConfig,
  SortOrder,
  TableLocale,
  TableAction,
  FilterValue,
  DefaultRecordType,
  TableFunc,
  ResizableConfig,
} from './interface';

import type { TableProps as RcTableProps } from './inner-table';
import RcTable, { DEFAULT_PROPS as RC_DEFAULT_PROPS } from './inner-table';
import { convertChildrenToColumns } from './inner-table/hooks/useColumns';
import Column from './Column';
import ColumnGroup from './ColumnGroup';

import EMPTY_IMT_DARK_BG from '../../assets/empty-dark.png';

import { GetComponentProps, RowClassName, RowFlagProps } from './inner-table/interface';
import noop from 'lodash/noop';
import { getColumnKey, getChangeWidthColumn } from './util';

// import './style';

const defaultTableLocal: TableLocale = {
  filterTitle: '筛选',
  filterConfirm: '确定',
  filterReset: '重置',
  filterEmptyText: '无筛选项',
  selectAll: '全选当页',
  selectInvert: '反选当页',
  selectNone: '清空所有',
  selectionAll: '全选所有',
  sortTitle: '排序',
  expand: '展开行',
  collapse: '关闭行',
  triggerDesc: '点击降序',
  triggerAsc: '点击升序',
  cancelSort: '取消排序',
};

const StableObject = {};

interface ChangeEventInfo<RecordType> {
  pagination: {
    current?: number;
    pageSize?: number;
    total?: number;
  };
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<RecordType> | SorterResult<RecordType>[];

  // filterStates: FilterState<RecordType>[];
  sorterStates: SortState<RecordType>[];

  // eslint-disable-next-line @typescript-eslint/ban-types
  resetPagination: Function;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EMPTY_LIST: any[] = [];

/** 对外暴露的方法 */
export type TableRef = TableFunc;

export interface TableProps<RecordType>
  extends Omit<
    RcTableProps<RecordType>,
    'transformColumns' | 'data' | 'columns' | 'emptyText' | 'indentSize' | 'rwRef'
  > {
  // dropdownPrefixCls?: string;
  /**
   * @description       表格数据列表
   */
  dataSource?: RcTableProps<RecordType>['data'];
  /**
   * @description       表格列配置， 具体配置在下方ColumnsApi
   */
  columns?: ColumnsType<RecordType>;
  /**
   * @description       控制表格是否loading
   * @default           false
   */
  loading?: boolean | SpinProps;
  /**
   * @description       控制表格是否存在border
   * @default           true
   */
  bordered?: boolean;
  /**
   * @description       控制表格多语言
   * @default           中文
   */
  locale?: TableLocale;
  /**
   * @description 列宽改变时的回调
   */
  onColumnResize?: (newColumns: ColumnsType<RecordType>) => void;
  /**
   * @description       表格分页、筛选、排序改变后的回调
   */
  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<RecordType> | SorterResult<RecordType>[],
    action: TableAction,
  ) => void;
  /**
   * @description       控制表格行选中 具体配置请查看Selection
   */
  rowSelection?: TableRowSelection<RecordType>;

  /** @description      控制checkBox列的prop, 兼容1.0版本 */
  showSelectionColumnProps?: ShowSelectionColumnProps<RecordType>;

  /** @deprecated Use `expandable.expandedRowKeys` instead */
  expandedRowKeys?: React.Key[];
  /** @deprecated Use `expandable.onExpand` instead */
  onExpand?: (expanded: boolean, record: RecordType, newExpandedKeys: React.Key[]) => void;
  /**
   * @deprecated Use `expandable.indentSize` instead
   * @default  15
   */
  indentSize?: number;
  /** @deprecated Use `expandable.childrenColumnName` instead */
  childrenColumnName?: string;

  /**
   * @description       控制表格可以进行的排序方向组合 ， 如设置['asc']则只有增序
   */
  sortDirections?: SortOrder[];
  /**
   * @description       控制表格是否在表头展示排序提示
   */
  showSorterTooltip?: boolean | TooltipProps;
  /**
   * @description       兼容1.0的排序使用方法，该属性受控，传入数组为多列排序否则为单列排序
   */
  sortedInfo?: ChangeEventInfo<RecordType>['sorter'];
  onRow?: GetComponentProps<RecordType>;
  rowFlag?: RowFlagProps;
  /**
   * @description       列拖动时，列的最小宽度
   */
  minColumnWidth?: number;
}

/** QT Table */
function Table<RecordType extends DefaultRecordType>(
  props: TableProps<RecordType>,
  ref?: React.Ref<TableRef>,
) {
  const {
    prefixCls = 'QT-table',
    className,
    id,
    style,
    bordered = true,
    dataSource,
    rowSelection,
    showSelectionColumnProps,
    rowKey = 'key',
    rowClassName,
    columns,
    children,
    onColumnResize,
    onChange,
    loading,
    expandable = StableObject,
    expandedRowKeys,
    onExpand,
    childrenColumnName: legacyChildrenColumnName,
    indentSize,
    sortDirections,
    locale,
    showSorterTooltip,
    width,
    frozenData,
    sortedInfo,
    minColumnWidth = 100,
  } = props;

  const mergedColumns = React.useMemo(() => {
    // return columns || [];
    return columns || convertChildrenToColumns(children);
  }, [columns, children]);
  const [innerColumns, setInnerColumns] = React.useState(mergedColumns);
  React.useEffect(() => {
    setInnerColumns(mergedColumns);
  }, [mergedColumns]);

  const tableLocale = React.useMemo(() => {
    return { ...defaultTableLocal, ...locale } as TableLocale;
  }, [locale]);
  const rawData: readonly RecordType[] = dataSource || EMPTY_LIST;

  const mergedExpandable: ExpandableConfig<RecordType> = React.useMemo(() => {
    return {
      expandedRowKeys,
      onExpand,
      childrenColumnName: legacyChildrenColumnName,
      indentSize,
      ...expandable,
    };
  }, [expandable, expandedRowKeys, indentSize, legacyChildrenColumnName, onExpand]);

  const { childrenColumnName = 'children' } = mergedExpandable;

  const expandType: ExpandType = React.useMemo<ExpandType>(() => {
    if (rawData.some((item) => (item as any)?.[childrenColumnName])) {
      return 'nest';
    }

    if (mergedExpandable.expandedRowRender) {
      return 'row';
    }

    return null;
  }, [childrenColumnName, mergedExpandable.expandedRowRender, rawData]);

  const tableProps = omit(props, [
    'className',
    'style',
    'columns',
    'width',
  ]) as TableProps<RecordType>;

  // ============================ RowKey ============================
  const getRowKey = React.useMemo<GetRowKey<RecordType>>(() => {
    if (typeof rowKey === 'function') {
      return rowKey;
    }

    return (record: RecordType) => (record as any)?.[rowKey as string];
  }, [rowKey]);

  const [getRecordByKey] = useLazyKVMap(rawData, childrenColumnName, getRowKey);

  // ============================ Events =============================
  const changeEventInfo: Partial<ChangeEventInfo<RecordType>> = {};

  const triggerOnChange = (info: Partial<ChangeEventInfo<RecordType>>, action: TableAction) => {
    const changeInfo = {
      ...changeEventInfo,
      ...info,
    };

    // todo: pagination handle

    // todo: add scrollToFirstRowOnChange prop to scroll top when event fire
    // if (scrollToFirstRowOnChange !== false && internalRefs.body.current) {
    //   scrollTo(0, {
    //     getContainer: () => internalRefs.body.current!,
    //   });
    // }

    onChange?.(changeInfo.pagination!, changeInfo.filters!, changeInfo.sorter!, action);
  };

  // ============================ Sorter =============================
  const onSorterChange = (
    sorter: SorterResult<RecordType> | SorterResult<RecordType>[],
    sorterStates: SortState<RecordType>[],
  ) => {
    triggerOnChange(
      {
        sorter,
        sorterStates,
      },
      'sort',
    );
  };
  const [transformSorterColumns, sortStates, sorterTitleProps, getSorters] = useSorter<RecordType>({
    prefixCls,
    mergedColumns: innerColumns,
    onSorterChange,
    sortDirections: sortDirections || ['asc', 'desc'],
    tableLocale,
    showSorterTooltip,
    sortedInfo,
  });
  const sortedData = React.useMemo(
    () => getSortData(rawData, sortStates, childrenColumnName),
    [rawData, sortStates, childrenColumnName],
  );

  changeEventInfo.sorter = getSorters();
  changeEventInfo.sorterStates = sortStates;

  // ====================== Resize Column Width =====================
  const innerColumnsRef = React.useRef(innerColumns);
  innerColumnsRef.current = innerColumns; // 为了 handleColumnResize 能用到最新的innerColumns
  const handleColumnResize = React.useCallback<ResizableConfig['onColumnResize']>(
    (colsWidthMap) => {
      const newColumns = getChangeWidthColumn(innerColumnsRef.current, colsWidthMap);
      if (typeof onColumnResize === 'function') {
        onColumnResize(newColumns);
      } else {
        setInnerColumns(newColumns);
      }
    },
    [onColumnResize],
  );
  const [transformResizeColumns] = useResizable({
    prefixCls,
    onColumnResize: handleColumnResize,
    minColumnWidth,
  });

  // ============================ Column ============================
  const columnTitleProps = React.useMemo(
    () => ({
      ...sorterTitleProps,
    }),
    [sorterTitleProps],
  );
  const [transformTitleColumns] = useTitleColumns(columnTitleProps);

  // ============================= Data =============================
  const pageData = React.useMemo<RecordType[]>(() => {
    return [...sortedData];
  }, [sortedData]);

  // ========================== Selections ==========================
  const [transformSelectionColumns, selectedKeySet] = useSelection<RecordType>(rowSelection, {
    prefixCls,
    data: sortedData,
    pageData,
    getRowKey,
    getRecordByKey,
    expandType,
    childrenColumnName,
    locale: tableLocale,
    expandIconColumnIndex: mergedExpandable.expandIconColumnIndex,
    showSelectionColumnProps,
    // getPopupContainer,
  });

  const internalRowClassName = ({
    rowData: record,
    index,
    indent,
  }: Parameters<RowClassName<RecordType>>[number]) => {
    let mergedRowClassName;
    if (typeof rowClassName === 'function') {
      mergedRowClassName = classNames(rowClassName({ rowData: record, index, indent }));
    } else {
      mergedRowClassName = classNames(rowClassName);
    }

    return classNames(
      {
        [`${prefixCls}-row-selected`]: selectedKeySet.has(getRowKey(record, index)),
      },
      mergedRowClassName,
    );
  };

  // #region Expandable
  // ========================== Expandable ==========================

  // Customize expandable icon
  mergedExpandable.expandIcon = React.useMemo(() => {
    return mergedExpandable.expandIcon || renderExpandIcon(tableLocale!);
  }, [mergedExpandable.expandIcon, tableLocale]);

  // Adjust expand icon index, no overwrite expandIconColumnIndex if set.
  if (expandType === 'nest' && mergedExpandable.expandIconColumnIndex === undefined) {
    mergedExpandable.expandIconColumnIndex = rowSelection ? 1 : 0;
  }

  // Indent size
  if (typeof mergedExpandable.indentSize !== 'number') {
    mergedExpandable.indentSize = typeof indentSize === 'number' ? indentSize : 15;
  }
  // #endregion

  // ====================== Ref ======================
  const rwRef = React.useRef<TableFunc>({ scrollToTop: noop, scrollToRow: noop });
  React.useImperativeHandle(
    ref,
    () => {
      return {
        // 通过react window 对外暴露的功能
        scrollToTop: rwRef.current.scrollToTop,
        scrollToRow: rwRef.current.scrollToRow,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rwRef.current],
  );

  // ============================ Render ============================

  const transformColumns = React.useCallback(
    (beforeColumns: ColumnsType<RecordType>): ColumnsType<RecordType> =>
      transformTitleColumns(
        transformResizeColumns(transformSelectionColumns(transformSorterColumns(beforeColumns))),
      ),
    [
      transformResizeColumns,
      transformSelectionColumns,
      transformSorterColumns,
      transformTitleColumns,
    ],
  );

  // >>>>>>>>> Spinning
  let spinProps: SpinProps | undefined;
  if (typeof loading === 'boolean') {
    spinProps = {
      spinning: loading,
    };
  } else if (typeof loading === 'object') {
    spinProps = {
      spinning: true,
      ...loading,
    };
  }

  const wrapperClassNames = classNames(`${prefixCls}-wrapper`, className);

  const emptyHeight = React.useMemo(() => {
    return (
      (props.height || RC_DEFAULT_PROPS.height) -
      (props.headerHeight || RC_DEFAULT_PROPS.headerHeight)
    );
  }, [props.headerHeight, props.height]);

  const rcTableWidth = React.useMemo(() => {
    return (props.width || RC_DEFAULT_PROPS.width) - +bordered * 2;
  }, [bordered, props.width]);

  const rcTableHeight = React.useMemo(() => {
    return (props.height || RC_DEFAULT_PROPS.height) - +bordered;
  }, [bordered, props.height]);

  return (
    <div className={wrapperClassNames} id={id} style={{ ...style, width }}>
      <Spin spinning={false} {...spinProps}>
        <RcTable
          {...tableProps}
          rwRef={rwRef}
          frozenData={frozenData}
          columns={innerColumns}
          expandable={mergedExpandable}
          prefixCls={prefixCls}
          className={classNames({
            [`${prefixCls}-bordered`]: bordered,
            [`${prefixCls}-empty`]: rawData.length === 0,
          })}
          width={rcTableWidth}
          height={rcTableHeight}
          data={pageData}
          rowKey={getRowKey}
          rowClassName={internalRowClassName}
          emptyText={
            <Empty
              className={`${prefixCls}-empty`}
              style={{ width, height: emptyHeight }}
              image={EMPTY_IMT_DARK_BG}
              imageStyle={{ height: 68 }}
              description="暂无数据"
            />
          }
          transformColumns={transformColumns}
        />
      </Spin>
    </div>
  );
}

const TableWithRef = React.forwardRef(Table) as <T>(
  props: TableProps<T> & {
    ref?: React.ForwardedRef<TableRef>;
  },
) => ReturnType<typeof Table>;

function RefTable<RecordType extends DefaultRecordType>(
  props: TableProps<RecordType> & {
    forwardedRef?: React.ForwardedRef<TableRef>;
    /**
     * @deprecated please use forwardRef, ref can't be used correctly
     */
    ref?: React.ForwardedRef<TableRef>;
  },
) {
  return <TableWithRef<RecordType> {...props} ref={props.forwardedRef} />;
}

RefTable.AutoResizer = AutoResizer;
RefTable.AutoResizerNext = AutoResizerNext;
RefTable.SORT_ORDER = {
  /**
   * Sort data in ascending order
   * @deprecated use order in Columns instead
   */
  ASC: 'asc',
  /**
   * Sort data in descending order
   * @deprecated use order in Columns instead
   */
  DESC: 'desc',
};
RefTable.CONTEXT_MENU = CONTEXT_MENU;
RefTable.HighLight = HighLight;
RefTable.Column = Column;
RefTable.ColumnGroup = ColumnGroup;

export default RefTable;
