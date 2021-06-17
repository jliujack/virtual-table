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

import * as React from "react";
import isVisible from "rc-util/lib/Dom/isVisible";
import classNames from "classnames";
import shallowEqual from "shallowequal";
import warning from "rc-util/lib/warning";
import ResizeObserver from "rc-resize-observer";
import { getTargetScrollBarSize } from "rc-util/lib/getScrollBarSize";

import Header from "./Header/Header";
import type {
  Key,
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
} from "./interface";
import TableContext from "./context/TableContext";
import BodyContext from "./context/BodyContext";
import ResizeContext from "./context/ResizeContext";
import Body from "./Body";
import { getDataAndAriaProps } from "./utils/legacyUtil";
import { findAllChildrenKeys, renderExpandIcon } from "./utils/expandUtil";
import { getCellFixedInfo } from "./utils/fixUtil";
import useColumns from "./hooks/useColumns";
import { useLayoutState, useTimeoutLock } from "./hooks/useFrame";
import {
  getPathValue,
  mergeObject,
  validateValue,
  getColumnsKey,
} from "./utils/valueUtil";
import Panel from "./Panel";
import Footer, { FooterComponents } from "./Footer";
import useStickyOffsets from "./hooks/useStickyOffsets";
import useSticky from "./hooks/useSticky";
import FixedHolder from "./FixedHolder";
import type { SummaryProps } from "./Footer/Summary";
import Summary from "./Footer/Summary";

// Used for conditions cache
const EMPTY_DATA = [];

// Used for customize scroll
const EMPTY_SCROLL_TARGET = {};

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
  }
);

export interface TableProps<RecordType = unknown> {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  data?: readonly RecordType[];
  columns?: ColumnsType<RecordType>;
  rowKey?: string | GetRowKey<RecordType>;

  // Fixed Columns
  scroll?: { x?: number | true | string; y?: number | string };

  // Expandable
  /** Config expand rows */
  expandable?: ExpandableConfig<RecordType>;
  indentSize?: number;
  rowClassName?: string | RowClassName<RecordType>;

  // Additional Part
  title?: PanelRender<RecordType>;
  footer?: PanelRender<RecordType>;
  summary?: (data: readonly RecordType[]) => React.ReactNode;

  // Customize
  id?: string;
  showHeader?: boolean;
  onRow?: GetComponentProps<RecordType>;
  onHeaderRow?: GetComponentProps<readonly ColumnType<RecordType>[]>;
  emptyText?: React.ReactNode | (() => React.ReactNode);

  sticky?: boolean | TableSticky;
}

function Table<RecordType extends DefaultRecordType>(
  props: TableProps<RecordType>
) {
  const {
    prefixCls,
    className,
    rowClassName,
    style,
    data,
    rowKey,
    scroll,

    // Additional Part
    title,
    footer,
    summary,

    // Expandable
    expandable = {},

    // Customize
    id,
    showHeader,
    onRow,
    onHeaderRow,
    emptyText,

    sticky,
  } = props;

  const mergedData = data || EMPTY_DATA;
  const hasData = !!mergedData.length;

  const getRowKey = React.useMemo<GetRowKey<RecordType>>(() => {
    if (typeof rowKey === "function") {
      return rowKey;
    }
    return (record: RecordType) => {
      const key = record && record[rowKey];

      if (process.env.NODE_ENV !== "production") {
        warning(
          key !== undefined,
          "Each record in table should have a unique `key` prop, or set `rowKey` to an unique primary key."
        );
      }

      return key;
    };
  }, [rowKey]);

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
    indentSize,
  } = expandable;

  const mergedExpandIcon = expandIcon || renderExpandIcon;
  const mergedChildrenColumnName = childrenColumnName || "children";
  const expandableType = React.useMemo<ExpandableType>(() => {
    if (expandedRowRender) {
      return "row";
    }
    /* eslint-disable no-underscore-dangle */
    /**
     * Fix https://github.com/ant-design/ant-design/issues/21154
     * This is a workaround to not to break current behavior.
     * We can remove follow code after final release.
     *
     * To other developer:
     *  Do not use `__PARENT_RENDER_ICON__` in prod since we will remove this when refactor
     */
    if (
      props.expandable ||
      mergedData.some(
        (record) =>
          record &&
          typeof record === "object" &&
          record[mergedChildrenColumnName]
      )
    ) {
      return "nest";
    }
    /* eslint-enable */
    return false;
  }, [!!expandedRowRender, mergedData]);

  const [innerExpandedKeys, setInnerExpandedKeys] = React.useState(() => {
    if (defaultExpandedRowKeys) {
      return defaultExpandedRowKeys;
    }
    if (defaultExpandAllRows) {
      return findAllChildrenKeys<RecordType>(
        mergedData,
        getRowKey,
        mergedChildrenColumnName
      );
    }
    return [];
  });
  const mergedExpandedKeys = React.useMemo(
    () => new Set(expandedRowKeys || innerExpandedKeys || []),
    [expandedRowKeys, innerExpandedKeys]
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
        onExpand(!hasKey, record);
      }
      if (onExpandedRowsChange) {
        onExpandedRowsChange(newExpandedKeys);
      }
    },
    [getRowKey, mergedExpandedKeys, mergedData, onExpand, onExpandedRowsChange]
  );

  // ====================== Column ======================
  const [componentWidth, setComponentWidth] = React.useState(0);

  const [columns, flattenColumns] = useColumns({
    ...props,
    ...expandable,
    expandable: !!expandedRowRender,
    expandedKeys: mergedExpandedKeys,
    getRowKey,
    // https://github.com/ant-design/ant-design/issues/23894
    onTriggerExpand,
    expandIcon: mergedExpandIcon,
    expandIconColumnIndex,
  });

  const columnContext = React.useMemo(
    () => ({
      columns,
      flattenColumns,
    }),
    [columns, flattenColumns]
  );

  // ====================== Scroll ======================
  const fullTableRef = React.useRef<HTMLDivElement>();
  const scrollHeaderRef = React.useRef<HTMLDivElement>();
  const scrollBodyRef = React.useRef<HTMLDivElement>();
  const scrollSummaryRef = React.useRef<HTMLDivElement>();
  const [pingedLeft, setPingedLeft] = React.useState(false);
  const [pingedRight, setPingedRight] = React.useState(false);
  const [colsWidths, updateColsWidths] = useLayoutState(
    new Map<React.Key, number>()
  );

  // Convert map to number width
  const colsKeys = getColumnsKey(flattenColumns);
  const pureColWidths = colsKeys.map((columnKey) => colsWidths.get(columnKey));
  const colWidths = React.useMemo(
    () => pureColWidths,
    [pureColWidths.join("_")]
  );
  const stickyOffsets = useStickyOffsets(colWidths, flattenColumns.length);
  const fixHeader = scroll && validateValue(scroll.y);
  const horizonScroll =
    (scroll && validateValue(scroll.x)) || Boolean(expandable.fixed);
  const fixColumn = horizonScroll && flattenColumns.some(({ fixed }) => fixed);

  // Sticky
  const stickyRef = React.useRef<{ setScrollLeft: (left: number) => void }>();
  const {
    isSticky,
    offsetHeader,
    offsetSummary,
    offsetScroll,
    stickyClassName,
    container,
  } = useSticky(sticky, prefixCls);

  // Footer (Fix footer must fixed header)
  const summaryNode = summary?.(mergedData);
  const fixFooter =
    (fixHeader || isSticky) &&
    React.isValidElement(summaryNode) &&
    summaryNode.type === Summary &&
    (summaryNode.props as SummaryProps).fixed;

  // Scroll
  let scrollXStyle: React.CSSProperties;
  let scrollYStyle: React.CSSProperties;
  let scrollTableStyle: React.CSSProperties;

  if (fixHeader) {
    scrollYStyle = {
      overflowY: "scroll",
      maxHeight: scroll.y,
    };
  }

  if (horizonScroll) {
    scrollXStyle = { overflowX: "auto" };
    // When no vertical scrollbar, should hide it
    // https://github.com/ant-design/ant-design/pull/20705
    // https://github.com/ant-design/ant-design/issues/21879
    if (!fixHeader) {
      scrollYStyle = { overflowY: "hidden" };
    }
    scrollTableStyle = {
      width: scroll.x === true ? "auto" : scroll.x,
      minWidth: "100%",
    };
  }

  const onColumnResize = React.useCallback(
    (columnKey: React.Key, width: number) => {
      if (isVisible(fullTableRef.current)) {
        updateColsWidths((widths) => {
          if (widths.get(columnKey) !== width) {
            const newWidths = new Map(widths);
            newWidths.set(columnKey, width);
            return newWidths;
          }
          return widths;
        });
      }
    },
    []
  );

  const [setScrollTarget, getScrollTarget] = useTimeoutLock(null);

  function forceScroll(
    scrollLeft: number,
    target: HTMLDivElement | ((left: number) => void)
  ) {
    if (!target) {
      return;
    }
    if (typeof target === "function") {
      target(scrollLeft);
    } else if (target.scrollLeft !== scrollLeft) {
      // eslint-disable-next-line no-param-reassign
      target.scrollLeft = scrollLeft;
    }
  }

  const onScroll = ({
    currentTarget,
    scrollLeft,
  }: {
    currentTarget: HTMLElement;
    scrollLeft?: number;
  }) => {
    const mergedScrollLeft =
      typeof scrollLeft === "number" ? scrollLeft : currentTarget.scrollLeft;

    const compareTarget = currentTarget || EMPTY_SCROLL_TARGET;
    if (!getScrollTarget() || getScrollTarget() === compareTarget) {
      setScrollTarget(compareTarget);

      forceScroll(mergedScrollLeft, scrollHeaderRef.current);
      forceScroll(mergedScrollLeft, scrollBodyRef.current);
      forceScroll(mergedScrollLeft, scrollSummaryRef.current);
      forceScroll(mergedScrollLeft, stickyRef.current?.setScrollLeft);
    }

    if (currentTarget) {
      const { scrollWidth, clientWidth } = currentTarget;
      setPingedLeft(mergedScrollLeft > 0);
      setPingedRight(mergedScrollLeft < scrollWidth - clientWidth);
    }
  };

  const triggerOnScroll = () => {
    if (scrollBodyRef.current) {
      onScroll({
        currentTarget: scrollBodyRef.current,
      } as React.UIEvent<HTMLDivElement>);
    }
  };

  const onFullTableResize = ({ width }) => {
    if (width !== componentWidth) {
      triggerOnScroll();
      setComponentWidth(
        fullTableRef.current ? fullTableRef.current.offsetWidth : width
      );
    }
  };

  // Sync scroll bar when init or `horizonScroll` changed
  React.useEffect(() => triggerOnScroll, []);
  React.useEffect(() => {
    if (horizonScroll) {
      triggerOnScroll();
    }
  }, [horizonScroll]);

  // ===================== Effects ======================
  const [scrollbarSize, setScrollbarSize] = React.useState(0);

  React.useEffect(() => {
    setScrollbarSize(getTargetScrollBarSize(scrollBodyRef.current).width);
  }, []);

  // ====================== Render ======================
  let groupTableNode: React.ReactNode;

  // Header props
  const headerProps = {
    colWidths,
    columCount: flattenColumns.length,
    stickyOffsets,
    onHeaderRow,
    fixHeader,
    scroll,
  };

  // Empty
  const emptyNode: React.ReactNode = React.useMemo(() => {
    if (hasData) {
      return null;
    }

    if (typeof emptyText === "function") {
      return emptyText();
    }
    return emptyText;
  }, [hasData, emptyText]);

  // Body
  const bodyTable = (
    <Body
      data={mergedData}
      measureColumnWidth={fixHeader || horizonScroll || isSticky}
      expandedKeys={mergedExpandedKeys}
      rowExpandable={rowExpandable}
      getRowKey={getRowKey}
      onRow={onRow}
      emptyNode={emptyNode}
      childrenColumnName={mergedChildrenColumnName}
      onScroll={onScroll}
      ref={scrollBodyRef}
    />
  );

  // >>>>>> Fixed Header
  const bodyContent: React.ReactNode = bodyTable;

  // Fixed holder share the props
  const fixedHolderProps = {
    noData: !mergedData.length,
    maxContentScroll: horizonScroll && scroll.x === "max-content",
    ...headerProps,
    ...columnContext,
    stickyClassName,
    onScroll,
  };

  groupTableNode = (
    <>
      {/* Header Table */}
      {showHeader !== false && (
        <FixedHolder
          {...fixedHolderProps}
          stickyTopOffset={offsetHeader}
          className={`${prefixCls}-header`}
          ref={scrollHeaderRef}
        >
          {(fixedHolderPassProps) => (
            <>
              <Header {...fixedHolderPassProps} />
              {fixFooter === "top" && (
                <Footer {...fixedHolderPassProps}>{summaryNode}</Footer>
              )}
            </>
          )}
        </FixedHolder>
      )}

      {/* Body Table */}
      {bodyContent}

      {/* Summary Table */}
      {fixFooter && fixFooter !== "top" && (
        <FixedHolder
          {...fixedHolderProps}
          stickyBottomOffset={offsetSummary}
          className={`${prefixCls}-summary`}
          ref={scrollSummaryRef}
        >
          {(fixedHolderPassProps) => (
            <Footer {...fixedHolderPassProps}>{summaryNode}</Footer>
          )}
        </FixedHolder>
      )}
    </>
  );

  const ariaProps = getDataAndAriaProps(props);

  let fullTable = (
    <div
      className={classNames(prefixCls, className, {
        [`${prefixCls}-ping-left`]: pingedLeft,
        [`${prefixCls}-ping-right`]: pingedRight,
        [`${prefixCls}-fixed-header`]: fixHeader,
        /** No used but for compatible */
        [`${prefixCls}-fixed-column`]: fixColumn,
        [`${prefixCls}-scroll-horizontal`]: horizonScroll,
        [`${prefixCls}-has-fix-left`]:
          flattenColumns[0] && flattenColumns[0].fixed,
        [`${prefixCls}-has-fix-right`]:
          flattenColumns[flattenColumns.length - 1] &&
          flattenColumns[flattenColumns.length - 1].fixed === "right",
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
        {title && (
          <Panel className={`${prefixCls}-title`}>{title(mergedData)}</Panel>
        )}
        <div className={`${prefixCls}-container`}>{groupTableNode}</div>
        {footer && (
          <Panel className={`${prefixCls}-footer`}>{footer(mergedData)}</Panel>
        )}
      </MemoTableContent>
    </div>
  );

  if (horizonScroll) {
    fullTable = (
      <ResizeObserver onResize={onFullTableResize}>{fullTable}</ResizeObserver>
    );
  }

  const TableContextValue = React.useMemo(
    () => ({
      prefixCls,
      scrollbarSize,
      fixedInfoList: flattenColumns.map((_, colIndex) =>
        getCellFixedInfo(colIndex, colIndex, flattenColumns, stickyOffsets)
      ),
      isSticky,
    }),
    [prefixCls, scrollbarSize, flattenColumns, stickyOffsets, isSticky]
  );

  const BodyContextValue = React.useMemo(
    () => ({
      ...columnContext,
      rowClassName,
      expandedRowClassName,
      componentWidth,
      fixHeader,
      fixColumn,
      horizonScroll,
      expandIcon: mergedExpandIcon,
      expandableType,
      expandRowByClick,
      expandedRowRender,
      onTriggerExpand,
      expandIconColumnIndex,
      indentSize,
    }),
    [
      columnContext,
      rowClassName,
      expandedRowClassName,
      componentWidth,
      fixHeader,
      fixColumn,
      horizonScroll,
      mergedExpandIcon,
      expandableType,
      expandRowByClick,
      expandedRowRender,
      onTriggerExpand,
      expandIconColumnIndex,
      indentSize,
    ]
  );

  const ResizeContextValue = React.useMemo(
    () => ({ onColumnResize }),
    [onColumnResize]
  );

  return (
    <TableContext.Provider value={TableContextValue}>
      <BodyContext.Provider value={BodyContextValue}>
        <ResizeContext.Provider value={ResizeContextValue}>
          {fullTable}
        </ResizeContext.Provider>
      </BodyContext.Provider>
    </TableContext.Provider>
  );
}

Table.defaultProps = {
  rowKey: "key",
  prefixCls: "rc-table",
  emptyText: () => "No Data",
};

export default Table;
