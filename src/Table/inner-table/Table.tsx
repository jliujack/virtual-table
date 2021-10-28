/**
 * Todo:
 *  - add Title, Footer, StickyScrollBar, Summary
 *
 * Removed:
 *  - tableLayout,  virtual render table can't use auto layout
 *
 * Deprecated:
 *  -
 */

import * as React from 'react';
import classNames from 'classnames';
import shallowEqual from 'shallowequal';
import warning from 'rc-util/lib/warning';
import ResizeObserver from 'rc-resize-observer';

import { ContextMenuProps, MenuOptProps } from '../../ContextMenu/ContextMenu';
import useContextMenu from './hooks/useContextMenu';

import Header from './Layout/Header/Header';
import type {
  Key,
  RowHeight,
  DefaultRecordType,
  ColumnType,
  ColumnsType,
  GetRowKey,
  PanelRender,
  ExpandableType,
  ExpandableConfig,
  RowClassName,
  GetComponentProps,
  TriggerEventHandler,
  TableSticky,
  RowEventProps,
  RowEventHandlersProps,
  RowFlagProps,
  TableFunc,
} from './interface';
import TableContext, { TableContextProps } from './context/TableContext';
import BodyContext, { BodyContextProps } from './context/BodyContext';
import ScrollContext from './context/ScrollContext';
import Body, { BodyProps } from './Layout/Body';
import FixedRows from './Layout/Body/FixedRows';
import { getDataAndAriaProps } from './utils/legacyUtil';
import { findAllChildrenKeys, renderExpandIcon } from './utils/expandUtil';
import { FixedInfo, getCellFixedInfo } from './utils/fixUtil';
import useColumns from './hooks/useColumns';
import useFlattenRecords from './hooks/useFlattenRecords';
import useScroll from './hooks/useScroll';
import { getColumnsKey, getUniqID, getColumnsDeeps } from './utils/valueUtil';
import Panel from './Panel';
import Footer from './Layout/Footer';
import useStickyOffsets from './hooks/useStickyOffsets';
import useSticky from './hooks/useSticky';
import useBodyCalc from './hooks/useBodyCalc';
import FixedHolder from './FixedHolder';
import type { SummaryProps } from './Layout/Footer/Summary';
import Summary from './Layout/Footer/Summary';

// Used for conditions cache
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EMPTY_DATA: any[] = [];

interface MemoTableContentProps {
  children: React.ReactNode;
  pingLeft: boolean;
  pingRight: boolean;
  props: any;
}

const MemoTableContent = React.memo<MemoTableContentProps>(
  ({ children }) => children as React.ReactElement,

  (prev, next) => {
    if (!shallowEqual(prev.props, next.props)) {
      return false;
    }

    // No additional render when pinged status change.
    // This is not a bug.
    return prev.pingLeft !== next.pingLeft || prev.pingRight !== next.pingRight;
  },
);

type MenuFunc<RecordType> = (menuData: { rowData: RecordType }) => MenuOptProps[];
type ContextMenu<RecordType> = Pick<ContextMenuProps['options'], 'onClick'> & {
  menu: MenuOptProps[] | MenuFunc<RecordType>;
};

/**
 * Table properties.
 */
export interface TableProps<RecordType> {
  /**
   * @description       class前缀
   * @default           'QT-table'
   */
  prefixCls?: string;
  /**
   * @description       最外层class
   */
  className?: string;
  /**
   * @description       react-window class
   */
  specialClass?: string;
  /**
   * @description       控制表格最外层样式
   */
  style?: React.CSSProperties;
  /**
   * @description       children的方式传入column
   */
  children?: React.ReactNode;
  data?: readonly RecordType[];
  /**
   * @description       行冻结的数据列表， 不存在则不渲染冻结行
   */
  frozenData?: readonly RecordType[];
  columns?: ColumnsType<RecordType>;
  /**
   * @description       获取行的key， 可以是字段或者函数
   * @default           'id'
   */
  rowKey?: string | GetRowKey<RecordType>;
  /**
   * @description       表格的宽度
   * @default           400
   */
  width?: number;
  /**
   * @description       表格的高度
   * @default           400
   */
  height?: number;

  // table style render
  /**
   * @description       控制表格虚拟渲染多少行
   * @default           1
   */
  overscanRowCount?: BodyProps<RecordType>['overscanRowCount'];
  /**
   * @description       控制每一行的高度
   * @default           32
   */
  rowHeight?: RowHeight<RecordType>;
  /**
   * @description       控制表头的高度
   * @default           36
   */
  headerHeight?: number;
  /**
   * @description       是否使用斑马线
   * @default           true
   */
  intervalRowBg?: boolean;
  /**
   * @description       控制表格行编辑
   */
  editingKey?: number | string;

  // scroll
  /**
   * @description 滚动到底事件触发的计算值
   * @default 50
   */
  onEndReachedThreshold?: number;
  /**
   * @description 滚动到底事件的回调, 请业务自己做好防抖？
   */
  onEndReached?: ({ distanceFromEnd }: { distanceFromEnd: number }) => void;

  // Expandable
  /**
   * @description       控制表格展开逻辑，支持树形嵌套和自定义渲染（互斥），具体配置请查看下方Expandable
   */
  expandable?: ExpandableConfig<RecordType>;
  /**
   * @description       行class自定义，可以是字符串或函数
   */
  rowClassName?: string | RowClassName<RecordType>;

  // Additional Part
  /**
   * @description       现在还未实现，根据需求再做
   */
  title?: PanelRender<RecordType>;
  /**
   * @description       现在还未实现，根据需求再做
   */
  footer?: PanelRender<RecordType>;
  /**
   * @description       现在还未实现，根据需求再做
   */
  summary?: (data: readonly RecordType[]) => React.ReactNode;

  /**
   * @description       可以传入true或具体的值启用横向虚拟化，传入数字时表示多余计算的像素
   * @default           false
   */
  enableHorizontalVirtual?: boolean | number;

  // Customize
  /**
   * @description       表格最外层div追加id
   */
  id?: string;
  /**
   * @description       是否展示表头
   */
  showHeader?: boolean;
  /**
   * @description       表格行事件
   */
  onRow?: GetComponentProps<RecordType>;
  /** @deprecated Use `onRow` instead */
  onRowSelect?: (data: RowEventProps<RecordType>) => void;
  /** @deprecated Use `onRow` instead */
  onRowHover?: (data: RowEventProps<RecordType>) => void;
  /**
   * @description       表格表头行事件
   */
  onHeaderRow?: GetComponentProps<readonly ColumnType<RecordType>[]>;
  /**
   * @description       表格空内容
   */
  emptyText?: React.ReactNode | (() => React.ReactNode);

  /** Used for antd table transform column with additional column */
  transformColumns?: (columns: ColumnsType<RecordType>) => ColumnsType<RecordType>;

  /**
   * @description       表格stick 待实现！
   * @default           false
   */
  sticky?: boolean | TableSticky;
  /** @deprecated Use `onRow` instead */
  rowEventHandlers?: RowEventHandlersProps<RecordType>;
  rowFlag?: RowFlagProps;

  // react window onItemsRendered方法包装
  /**
   * @description       表格渲染区域改变时的回调， 参考react-window onItemsRendered
   */
  onRowsRendered?: BodyProps<RecordType>['onRowsRendered'];
  // 控制ReactWindow
  rwRef: React.MutableRefObject<TableFunc>;
  contextMenu?: ContextMenu<RecordType>;
}

export const DEFAULT_PROPS = {
  prefixCls: '',
  rowClassName: '',
  rowKey: 'id',
  width: 400,
  height: 400,
  rowHeight: 32,
  headerHeight: 36,
  intervalRowBg: true,
  onEndReachedThreshold: 50,
  enableHorizontalVirtual: false,
  sticky: false,
};

function Table<RecordType extends DefaultRecordType>(props: TableProps<RecordType>) {
  const {
    prefixCls = DEFAULT_PROPS.prefixCls,
    className,
    specialClass,
    rowClassName = DEFAULT_PROPS.rowClassName,
    style,
    data,
    rowKey = 'id',
    width = DEFAULT_PROPS.width,
    height = DEFAULT_PROPS.height,
    overscanRowCount,
    rowHeight = DEFAULT_PROPS.rowHeight,
    headerHeight = DEFAULT_PROPS.headerHeight,
    intervalRowBg = DEFAULT_PROPS.intervalRowBg,
    editingKey,
    onEndReachedThreshold = DEFAULT_PROPS.onEndReachedThreshold,

    // Additional Part
    title,
    footer,
    summary,

    // virtual
    enableHorizontalVirtual = DEFAULT_PROPS.enableHorizontalVirtual,

    // Expandable
    expandable = {},

    // Customize
    id,
    showHeader,
    onRow,
    onHeaderRow,
    emptyText,

    // Internal
    transformColumns,

    // fix rows
    frozenData,

    sticky = DEFAULT_PROPS.sticky,
    rowEventHandlers,
    onRowHover,
    onRowSelect,
    rowFlag,

    onRowsRendered,
    rwRef,
    contextMenu,
  } = props;

  const tableSpecialClass = React.useMemo(
    () => specialClass || `table_special_${getUniqID()}`,
    [specialClass],
  );

  const getRowKey = React.useMemo<GetRowKey<RecordType>>(() => {
    if (typeof rowKey === 'function') {
      return rowKey;
    }
    return (record: RecordType) => {
      const key: Key = record && (record[rowKey] as Key);

      if (process.env.NODE_ENV !== 'production') {
        warning(
          key !== undefined,
          'Each record in table should have a unique `key` prop, or set `rowKey` to an unique primary key.',
        );
      }

      return key;
    };
  }, [rowKey]);

  // ====================== Data ======================
  const mergedData: RecordType[] = React.useMemo(() => {
    return (data || EMPTY_DATA) as unknown as RecordType[];
  }, [data]);
  const hasData = !!mergedData.length;

  // ====================== Expand ======================
  const {
    expandIcon,
    expandedRowKeys,
    defaultExpandedRowKeys,
    defaultExpandAllRows,
    expandedRowRender,
    onExpand,
    onExpandedRowsChange,
    expandRowByClick,
    rowExpandable,
    expandIconColumnIndex,
    expandedRowClassName,
    childrenColumnName,
    indentSize = 15,
  } = expandable;

  const mergedExpandIcon = expandIcon || renderExpandIcon;

  const mergedChildrenColumnName = childrenColumnName || 'children';
  const expandableType = React.useMemo<ExpandableType>(() => {
    if (expandedRowRender) {
      return 'row';
    }

    if (
      props.expandable &&
      mergedData.some(
        (record) => record && typeof record === 'object' && record[mergedChildrenColumnName],
      )
    ) {
      return 'nest';
    }
    /* eslint-enable */
    return false;
  }, [expandedRowRender, mergedChildrenColumnName, mergedData, props.expandable]);

  const [innerExpandedKeys, setInnerExpandedKeys] = React.useState(() => {
    if (defaultExpandedRowKeys) {
      return defaultExpandedRowKeys;
    }
    if (defaultExpandAllRows) {
      return findAllChildrenKeys<RecordType>(mergedData, getRowKey, mergedChildrenColumnName);
    }
    return [];
  });
  const mergedExpandedKeys = React.useMemo(
    () => new Set(expandedRowKeys || innerExpandedKeys || []),
    [expandedRowKeys, innerExpandedKeys],
  );

  const onTriggerExpand: TriggerEventHandler<RecordType> = React.useCallback(
    (record: RecordType) => {
      const key = getRowKey(record, mergedData.indexOf(record));

      let newExpandedKeys: Key[];
      const hasKey = mergedExpandedKeys.has(key);
      if (hasKey) {
        mergedExpandedKeys.delete(key);
        newExpandedKeys = [...mergedExpandedKeys];
      } else {
        newExpandedKeys = [...mergedExpandedKeys, key];
      }

      setInnerExpandedKeys(newExpandedKeys);
      if (onExpand) {
        onExpand(!hasKey, record, newExpandedKeys);
      }
      if (onExpandedRowsChange) {
        onExpandedRowsChange(newExpandedKeys);
      }
    },
    [getRowKey, mergedExpandedKeys, mergedData, onExpand, onExpandedRowsChange],
  );

  // =================== Flatten Data ===================
  const flattenData: { record: RecordType; indent: number }[] = useFlattenRecords<RecordType>(
    mergedData,
    mergedChildrenColumnName,
    mergedExpandedKeys,
    getRowKey,
  );

  // ====================== Display Data ======================
  const dataWithIndent = React.useMemo(() => {
    return mergedData.map((row) => ({ record: row, indent: 0 }));
  }, [mergedData]);
  const displayData = React.useMemo(() => {
    return expandableType === 'row' ? dataWithIndent : flattenData;
  }, [dataWithIndent, expandableType, flattenData]);

  // ====================== Body Width ======================
  const [scrollbarSize, setScrollbarSize] = React.useState(0);
  const [bodyWidth, setBodyWidth] = React.useState(width);

  // ====================== Column ======================
  const [componentWidth, setComponentWidth] = React.useState(0);

  const { columns, flattenColumns, colsWidths } = useColumns(
    {
      ...props,
      ...expandable,
      expandable: !!expandedRowRender,
      expandedKeys: mergedExpandedKeys,
      getRowKey,
      // https://github.com/ant-design/ant-design/issues/23894
      onTriggerExpand,
      expandIcon: mergedExpandIcon,
      expandIconColumnIndex,
      bodyWidth,
    },
    transformColumns,
  );

  const columnContext = React.useMemo(
    () => ({
      columns,
      flattenColumns,
    }),
    [columns, flattenColumns],
  );

  // ===================== Columns Width =================
  // Convert map to number width
  const colsKeys = getColumnsKey(flattenColumns);
  const pureColWidths = colsKeys.map((columnKey) => colsWidths.get(columnKey) || 0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const colWidths = React.useMemo(() => pureColWidths, [pureColWidths.join('_')]);
  // column width rely on column data, can't put in useBodyCalc
  const colTotalWidth = React.useMemo(
    () => colWidths.reduce((res, colWidth) => res + colWidth, 0),
    [colWidths],
  );

  // ====================== Body size & scroll ======================
  const columnsDeeps = getColumnsDeeps(columns);

  const {
    verticalScroll,
    horizonScroll,
    bodyHeight,
    getRowHeight,
    getRowWithExpandRowHeight,
    setRowHeight,
    rowTotalHeight,
  } = useBodyCalc({
    data: displayData,
    colTotalWidth,
    width,
    height: height - headerHeight * columnsDeeps,
    rowHeight,
    scrollbarSize,
    getRowKey,
  });

  React.useEffect(() => {
    if (verticalScroll) {
      setBodyWidth(width - scrollbarSize);
    } else {
      setBodyWidth(width);
    }
  }, [scrollbarSize, verticalScroll, width]);

  // ====================== Scroll ======================
  const resetScrollBarSize = React.useCallback(
    (barWidth: number) => {
      if (barWidth !== scrollbarSize && barWidth !== 0) {
        setScrollbarSize(barWidth);
      }
    },
    [scrollbarSize],
  );
  const { refs, pingedLeft, pingedRight, scrollLeft, onScroll } = useScroll({
    tableSpecialClass,
    colTotalWidth,
    width,
    scrollbarSize,
    resetScrollBarSize,
    rowTotalHeight,
    tableHeight: props.height!,
    onEndReachedThreshold,
    onEndReached: props.onEndReached,
    verticalScroll,
    horizonScroll,
  });

  const { fullTableRef, scrollHeaderRef, scrollBodyRef } = refs;

  const stickyOffsets = useStickyOffsets(colWidths, flattenColumns.length);

  const fixColumn = horizonScroll && flattenColumns.some(({ fixed }) => fixed);

  // todo：暂时没用 后续可以考虑使用
  const { isSticky, offsetHeader, stickyClassName } = useSticky(sticky, prefixCls);

  // Footer (Fix footer must fixed header)
  const summaryNode = summary?.(mergedData);
  const fixFooter =
    (verticalScroll || isSticky) &&
    React.isValidElement(summaryNode) &&
    summaryNode.type === Summary &&
    (summaryNode.props as SummaryProps).fixed;

  const triggerOnScroll = () => {
    if (scrollBodyRef.current) {
      onScroll({
        currentTarget: scrollBodyRef.current,
      } as React.UIEvent<HTMLDivElement>);
    }
  };

  const onFullTableResize = ({ width: newWidth }: { width: number }) => {
    if (newWidth !== componentWidth) {
      triggerOnScroll();
      setComponentWidth(fullTableRef.current ? fullTableRef.current.offsetWidth : newWidth);
    }
  };

  // Sync scroll bar when init or `horizonScroll` changed
  React.useEffect(() => triggerOnScroll, []);
  React.useEffect(() => {
    if (horizonScroll) {
      triggerOnScroll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horizonScroll]);

  // ====================== Render ======================
  // Header props
  const headerProps = {
    colWidths,
    columCount: flattenColumns.length,
    stickyOffsets,
    onHeaderRow,
    verticalScroll,
  };

  // Empty
  const emptyNode: React.ReactNode = React.useMemo(() => {
    if (hasData) {
      return null;
    }

    if (typeof emptyText === 'function') {
      return emptyText();
    }
    return emptyText;
  }, [hasData, emptyText]);

  // ====================== Context Menu ======================
  const { contextMenuId, contextMenuNode } = useContextMenu(contextMenu);

  // handle body ref
  React.useEffect(() => {
    const bodyRef = scrollBodyRef as unknown as React.MutableRefObject<TableFunc>;
    rwRef.current = {
      scrollToTop: bodyRef.current.scrollToTop,
      scrollToRow: bodyRef.current.scrollToRow,
    };
  }, [rwRef, scrollBodyRef]);

  // Body
  const bodyTable = (
    <Body<RecordType>
      data={displayData}
      expandedKeys={mergedExpandedKeys}
      rowExpandable={rowExpandable}
      getRowKey={getRowKey}
      getRowWithExpandRowHeight={getRowWithExpandRowHeight}
      setRowHeight={setRowHeight}
      onRow={onRow}
      emptyNode={emptyNode}
      childrenColumnName={mergedChildrenColumnName}
      onScroll={onScroll}
      // @ts-ignore
      ref={scrollBodyRef}
      overscanRowCount={overscanRowCount}
      editingKey={editingKey}
      onRowsRendered={onRowsRendered}
      contextMenuId={contextMenuId}
    />
  );

  // >>>>>> Fixed Header
  const bodyContent: React.ReactNode = bodyTable;

  // Fixed holder share the props
  const fixedHolderProps = {
    noData: !mergedData.length,
    maxContentScroll: horizonScroll,
    ...headerProps,
    ...columnContext,
    stickyClassName,
    onScroll,
  };

  // Fixed Rows
  const fixedRow = React.useMemo(() => {
    if (frozenData && frozenData.length > 0) {
      return <FixedRows frozenData={frozenData} getRowKey={getRowKey} onRow={onRow} />;
    }
    return null;
  }, [frozenData, getRowKey, onRow]);

  const groupTableNode = (
    <>
      {/* Header Table */}
      {showHeader !== false && (
        // @ts-ignore
        <FixedHolder
          {...fixedHolderProps}
          stickyTopOffset={offsetHeader}
          className={`${prefixCls}-header`}
          ref={scrollHeaderRef}
        >
          {(fixedHolderPassProps) => (
            <>
              <Header {...fixedHolderPassProps} fixedRow={fixedRow} />
              {fixFooter === 'top' && <Footer {...fixedHolderPassProps}>{summaryNode}</Footer>}
            </>
          )}
        </FixedHolder>
      )}

      {/* Body Table */}
      {bodyContent}

      {/* Summary Table */}
      {/* {fixFooter && fixFooter !== 'top' && (
        <FixedHolder
          {...fixedHolderProps}
          stickyBottomOffset={offsetSummary}
          className={`${prefixCls}-summary`}
          ref={scrollSummaryRef}
        >
          {(fixedHolderPassProps) => <Footer {...fixedHolderPassProps}>{summaryNode}</Footer>}
        </FixedHolder>
      )} */}
    </>
  );

  const ariaProps = getDataAndAriaProps(props);

  let fullTable = (
    <div
      className={classNames(prefixCls, className, {
        [`${prefixCls}-ping-left`]: pingedLeft,
        [`${prefixCls}-ping-right`]: pingedRight,
        [`${prefixCls}-fixed-header`]: verticalScroll,
        /** No used but for compatible */
        [`${prefixCls}-fixed-column`]: fixColumn,
        [`${prefixCls}-scroll-horizontal`]: horizonScroll,
        [`${prefixCls}-has-fix-left`]: flattenColumns[0] && flattenColumns[0].fixed,
        [`${prefixCls}-has-fix-right`]:
          flattenColumns[flattenColumns.length - 1] &&
          flattenColumns[flattenColumns.length - 1].fixed === 'right',
      })}
      style={style}
      id={id}
      ref={fullTableRef}
      {...ariaProps}
    >
      <MemoTableContent
        pingLeft={pingedLeft}
        pingRight={pingedRight}
        props={{ ...props, stickyOffsets, mergedExpandedKeys }}
      >
        {title && <Panel className={`${prefixCls}-title`}>{title(mergedData)}</Panel>}
        <div className={`${prefixCls}-container`}>{groupTableNode}</div>
        {footer && <Panel className={`${prefixCls}-footer`}>{footer(mergedData)}</Panel>}
      </MemoTableContent>
      {contextMenuNode}
    </div>
  );

  if (horizonScroll) {
    fullTable = <ResizeObserver onResize={onFullTableResize}>{fullTable}</ResizeObserver>;
  }

  const TableContextValue: TableContextProps = React.useMemo(() => {
    const fixedInfoMap = new Map<React.Key, FixedInfo>();
    const flatColsKeys = getColumnsKey(flattenColumns);
    flattenColumns.forEach((_, colIndex) => {
      fixedInfoMap.set(
        flatColsKeys[colIndex],
        getCellFixedInfo(colIndex, colIndex, flattenColumns, stickyOffsets),
      );
    });
    return {
      prefixCls,
      tableSpecialClass,
      scrollbarSize,
      fixedInfoMap,
      isSticky,
      enableHorizontalVirtual,
      intervalRowBg,
    };
  }, [
    flattenColumns,
    prefixCls,
    tableSpecialClass,
    scrollbarSize,
    isSticky,
    enableHorizontalVirtual,
    stickyOffsets,
    intervalRowBg,
  ]);

  const BodyContextValue: BodyContextProps<RecordType> = React.useMemo(
    () => ({
      ...columnContext,
      rowClassName,
      expandedRowClassName,
      componentWidth,
      verticalScroll,
      fixColumn,
      horizonScroll,
      expandIcon: mergedExpandIcon,
      expandableType,
      expandRowByClick,
      expandedRowRender,
      onTriggerExpand,
      expandIconColumnIndex,
      indentSize,
      width,
      height,
      rowHeight,
      getRowHeight,
      headerHeight,
      bodyWidth,
      bodyHeight,
      colTotalWidth,
      rowTotalHeight,
      onRow,
      rowEventHandlers,
      onRowHover,
      onRowSelect,
      rowFlag,
    }),
    [
      columnContext,
      rowClassName,
      expandedRowClassName,
      componentWidth,
      verticalScroll,
      fixColumn,
      horizonScroll,
      mergedExpandIcon,
      expandableType,
      expandRowByClick,
      expandedRowRender,
      onTriggerExpand,
      expandIconColumnIndex,
      indentSize,
      width,
      height,
      rowHeight,
      getRowHeight,
      headerHeight,
      bodyWidth,
      bodyHeight,
      colTotalWidth,
      rowTotalHeight,
      onRow,
      rowEventHandlers,
      onRowHover,
      onRowSelect,
      rowFlag,
    ],
  );

  const ScrollContextValue = React.useMemo(() => ({ scrollLeft }), [scrollLeft]);

  return (
    <TableContext.Provider value={TableContextValue}>
      <BodyContext.Provider value={BodyContextValue}>
        <ScrollContext.Provider value={ScrollContextValue}>{fullTable}</ScrollContext.Provider>
      </BodyContext.Provider>
    </TableContext.Provider>
  );
}

Table.defaultProps = {
  rowKey: 'key',
  prefixCls: 'QT-table',
  emptyText: () => '暂无数据',
};

export default Table;
