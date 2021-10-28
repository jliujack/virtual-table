import * as React from 'react';
import classNames from 'classnames';
import type {
  DataIndex,
  ColumnType,
  RenderedCell,
  CellType,
  DefaultRecordType,
  AlignType,
  CellEllipsisType,
  ColumnGroupType,
  CellRenderProps,
  GetRowKey,
  IgnoreFunc,
} from '../../interface';
import BodyContext from '../../context/BodyContext';
import TableContext from '../../context/TableContext';
import { callOrReturn, getPathValue, validateValue } from '../../utils/valueUtil';
import EditCell from './EditCell';

const STABLE_OBJECT = {};

enum Z_INDEX {
  FIXED = 10,
  CELL_MERGE = 20,
  MERGE_FIXED = 30,
}

function isRenderCell<RecordType>(
  data: React.ReactNode | RenderedCell<RecordType>,
): data is RenderedCell<RecordType> {
  if (data && typeof data === 'object' && !Array.isArray(data) && !React.isValidElement(data))
    return true;

  return false;
}

function getColumnHeaderWidth<RecordType extends DefaultRecordType>(
  scrollbarSize: number,
  column?: ColumnType<RecordType> | ColumnGroupType<RecordType>,
  verticalScroll?: boolean,
  isLastHeaderCell?: boolean,
) {
  let width = 0;
  if (!column) {
    return 0;
  }
  let cols = [column];
  while (cols.length) {
    const col = cols.shift();
    const subColumns = (col as ColumnGroupType<RecordType>).children;
    if (subColumns) {
      cols = [...cols, ...subColumns];
    } else if (col) {
      width += (col as ColumnType<RecordType>).width!;
    }
  }

  if (verticalScroll && isLastHeaderCell) {
    return width + scrollbarSize;
  }
  return width;
}

function getColumnCellWidth<RecordType extends DefaultRecordType>(
  column: ColumnType<RecordType> | undefined,
  colSpan: number,
): number {
  const width = 0;
  if (!column || !column.width || !colSpan) {
    return 0;
  }

  return width + column.width + getColumnCellWidth(column.next, colSpan - 1);
}

export interface CellProps<RecordType> {
  prefixCls?: string;
  className?: string;
  record?: RecordType;
  /** `record` index. Not `column` index. is flatted index, !!注意nest方式展开行时后续的index会变!! */
  index?: number;
  /** `record` absolute index. Not `column` index. is flatted index, !!注意nest方式展开行时后续的index会变!! */
  absoluteIndex?: number;
  dataIndex?: DataIndex;
  render?: ColumnType<RecordType>['render'];
  editRender?: ColumnType<RecordType>['editRender'];
  children?: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  ellipsis?: CellEllipsisType;
  align?: AlignType;
  column?: ColumnType<RecordType>;
  isEditingKey?: boolean;
  getRowKey?: GetRowKey<RecordType>;
  editingKey?: number | string;

  shouldCellUpdate?: (record: RecordType, prevRecord: RecordType) => boolean;

  // Fixed
  fixLeft?: number | false;
  fixRight?: number | false;
  lastFixLeft?: boolean;
  firstFixRight?: boolean;
  lastFixRight?: boolean;
  // for header, 为了表头最后一个单元格能增加上滚动条的宽度
  isLastHeaderCell?: boolean;

  // Additional
  /** @private Used for `expandable` with nest tree */
  appendNode?: React.ReactNode;
  additionalProps?: React.HTMLAttributes<HTMLElement>;
  /** @private Fixed for user use `shouldCellUpdate` which block the render */
  expanded?: boolean;

  rowType?: 'header' | 'body' | 'footer';

  isSticky?: boolean;

  scrollLeft?: number;
}

function Cell<RecordType extends DefaultRecordType>({
  prefixCls,
  className,
  record,
  index,
  absoluteIndex,
  dataIndex,
  render,
  children,
  colSpan,
  rowSpan,
  fixLeft,
  fixRight,
  lastFixLeft,
  firstFixRight,
  lastFixRight = false,
  isLastHeaderCell,
  appendNode,
  additionalProps = STABLE_OBJECT,
  ellipsis,
  align,
  column = STABLE_OBJECT,
  rowType,
  isSticky,
  scrollLeft = 0,
  editRender,
  getRowKey,
  editingKey,
  expanded,
}: CellProps<RecordType>): React.ReactElement | null {
  const { width = 0, left = 0 } = column || {};

  const cellPrefixCls = `${prefixCls}-cell`;
  const {
    colTotalWidth,
    width: tableWidth,
    verticalScroll,
    headerHeight,
    // flattenColumns, // cell对其依赖会导致很大的性能问题。
    getRowHeight,
  } = React.useContext(BodyContext);
  const { scrollbarSize } = React.useContext(TableContext);

  const value = getPathValue<Record<string, unknown> | React.ReactNode, RecordType>(
    record!,
    dataIndex!,
  );

  // ==================== Child Node ====================
  //  = React.useMemo(() => ({}), []);
  const [childNodeMemo, cellPropsMemo] = React.useMemo(() => {
    let childNode: React.ReactNode;
    let cellProps: CellType<RecordType> = {};
    if (validateValue(children)) {
      childNode = children;
    } else {
      // Customize render node
      childNode = value;
      if (render) {
        const renderCellProps: CellRenderProps<RecordType> = {
          cellData: value,
          // columns: flattenColumns as ColumnType<RecordType>[], // 会引起性能问题
          column: column as ColumnType<RecordType>,
          // columnIndex: flattenColumns.findIndex((col) => col.dataIndex === column?.dataIndex), // 会引起性能问题
          dataIndex: column?.dataIndex,
          rowData: record!,
          rowIndex: index!,
          rowAbsoluteIndex: absoluteIndex,
          // todo: 添加其他字段
        };
        const renderData = render(renderCellProps);

        if (isRenderCell(renderData)) {
          childNode = renderData.children;
          cellProps = renderData.props;
        } else {
          childNode = renderData;
        }
      }
    }

    // Not crash if final `childNode` is not validate ReactNode
    if (
      typeof childNode === 'object' &&
      !Array.isArray(childNode) &&
      !React.isValidElement(childNode)
    ) {
      childNode = null;
    }

    if (ellipsis && (lastFixLeft || firstFixRight)) {
      childNode = <span className={`${cellPrefixCls}-content`}>{childNode}</span>;
    }

    return [childNode, cellProps];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    absoluteIndex,
    cellPrefixCls,
    children,
    column,
    ellipsis,
    firstFixRight,
    // flattenColumns,
    index,
    lastFixLeft,
    record,
    render,
    value,
    // 行展开收起时重新渲染单元格
    expanded,
  ]);

  const {
    colSpan: cellColSpan,
    rowSpan: cellRowSpan,
    style: cellStyle,
    className: cellClassName,
    restCellProps,
  } = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { colSpan, rowSpan, style, className, ...restCellProps } = cellPropsMemo || {};
    return { colSpan, rowSpan, style, className, restCellProps };
  }, [cellPropsMemo]);
  const mergedColSpan = cellColSpan !== undefined ? cellColSpan : colSpan || 1;
  const mergedRowSpan = cellRowSpan !== undefined ? cellRowSpan : rowSpan || 1;

  // ====================== Fixed =======================
  const isFixLeft = typeof fixLeft === 'number';
  const isFixRight = typeof fixRight === 'number';
  const fixStyle = React.useMemo(() => {
    const cFixStyle: React.CSSProperties = {};
    if (isFixLeft) {
      cFixStyle.left = left + scrollLeft;
      cFixStyle.zIndex = Z_INDEX.FIXED;
    }
    if (isFixRight) {
      const right = colTotalWidth - left - width;
      cFixStyle.left = tableWidth - right - width + scrollLeft;
      cFixStyle.zIndex = Z_INDEX.FIXED;
    }

    if (!isFixLeft && !isFixRight) {
      return STABLE_OBJECT as React.CSSProperties;
    }

    return cFixStyle;
  }, [colTotalWidth, isFixLeft, isFixRight, left, scrollLeft, tableWidth, width]);

  // ====================== Align =======================
  const alignStyle = React.useMemo(() => {
    const cAlignStyle: React.CSSProperties = {};
    const alignMap = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-right',
    };
    if (align) {
      cAlignStyle.textAlign = align;
      cAlignStyle.justifyContent = alignMap[align];
    }

    return cAlignStyle;
  }, [align]);

  // ================ render style ==============
  const cellRef = React.useRef<HTMLDivElement>(null);
  const placeStyle = React.useMemo(() => {
    const cPlaceStyle: React.CSSProperties = {};
    cPlaceStyle.position = 'absolute';

    cPlaceStyle.left = left;
    return cPlaceStyle;
  }, [left]);

  // ====================== Span ======================
  const cellWidth =
    rowType === 'header'
      ? getColumnHeaderWidth(scrollbarSize, column, verticalScroll, isLastHeaderCell)
      : getColumnCellWidth(column, mergedColSpan);

  const cellSizeStyle = React.useMemo(() => {
    const cCellSizeStyle: React.CSSProperties = {};
    const cellHeight = rowType === 'body' ? getRowHeight(index!) : headerHeight;
    if (mergedColSpan > 1) {
      if (rowType === 'header') {
        cCellSizeStyle.width = cellWidth;
      }
      if (rowType === 'body') {
        cCellSizeStyle.width = cellWidth;
      }
      cCellSizeStyle.zIndex = Z_INDEX.CELL_MERGE;
    } else {
      if (rowType === 'header') {
        cCellSizeStyle.width = column.width! + (isLastHeaderCell ? scrollbarSize : 0);
      }
      if (rowType === 'body') {
        cCellSizeStyle.width = column.width!;
      }
    }
    if (mergedRowSpan > 1) {
      if (rowType === 'header') {
        cCellSizeStyle.height = headerHeight * mergedRowSpan;
      }
      if (rowType === 'body') {
        cCellSizeStyle.height = 0;
        for (let i = 0; i < mergedRowSpan; i += 1) {
          cCellSizeStyle.height += getRowHeight(index! + i);
        }
      }
      cCellSizeStyle.zIndex = Z_INDEX.CELL_MERGE;
    } else {
      cCellSizeStyle.height = cellHeight;
    }

    return cCellSizeStyle;
    // column可能保持引用不变，所以要依赖width
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    column,
    column.width,
    getRowHeight,
    headerHeight,
    index,
    isLastHeaderCell,
    mergedColSpan,
    mergedRowSpan,
    rowType,
    scrollbarSize,
    verticalScroll,
    cellWidth,
  ]);

  // ====================== 处理单元格既有合并又有固定 ======================
  const cellZIndex = React.useMemo(() => {
    const cCellZIndex: React.CSSProperties = {};
    if (fixStyle.zIndex && cellSizeStyle.zIndex) {
      cCellZIndex.zIndex = Z_INDEX.MERGE_FIXED;
    }
    return cCellZIndex;
  }, [cellSizeStyle.zIndex, fixStyle.zIndex]);

  // ====================== Render ======================
  let title: string = '';
  const ellipsisConfig: CellEllipsisType = ellipsis === true ? { showTitle: true } : ellipsis || {};
  if (ellipsisConfig && (ellipsisConfig.showTitle || rowType === 'header')) {
    if (typeof childNodeMemo === 'string' || typeof childNodeMemo === 'number') {
      title = childNodeMemo.toString();
    } else if (
      React.isValidElement(childNodeMemo) &&
      typeof childNodeMemo.props.children === 'string'
    ) {
      title = childNodeMemo.props.children;
    }
  }

  const ignoreArgs = React.useMemo<Parameters<IgnoreFunc<RecordType>>[number]>(() => {
    return {
      cellData: value,
      column,
      rowData: record!,
      rowIndex: index!,
      rowAbsoluteIndex: absoluteIndex!,
    };
  }, [absoluteIndex, column, index, record, value]);

  const componentProps = React.useMemo(() => {
    return {
      title,
      ...restCellProps,
      ...additionalProps,
      colSpan: mergedColSpan && mergedColSpan !== 1 ? mergedColSpan : null,
      rowSpan: mergedRowSpan && mergedRowSpan !== 1 ? mergedRowSpan : null,
      className: classNames(
        cellPrefixCls,
        className,
        {
          [`${cellPrefixCls}-fix-left`]: isFixLeft,
          [`${cellPrefixCls}-fix-left-last`]: lastFixLeft,
          [`${cellPrefixCls}-fix-right`]: isFixRight,
          [`${cellPrefixCls}-fix-right-first`]: firstFixRight,
          [`${cellPrefixCls}-ellipsis`]: ellipsis,
          [`${cellPrefixCls}-with-append`]: appendNode,
          [`${cellPrefixCls}-fix-sticky`]: (isFixLeft || isFixRight) && isSticky,
          [`${cellPrefixCls}-with-ignore-disable`]: callOrReturn<
            Parameters<IgnoreFunc<RecordType>>,
            boolean
          >(column.ignoreDisable || false, ignoreArgs),
          [`${cellPrefixCls}-with-ignore-stop-bid`]: callOrReturn<
            Parameters<IgnoreFunc<RecordType>>,
            boolean
          >(column.ignoreStopBid || false, ignoreArgs),
          [`${cellPrefixCls}-with-ignore-ref`]: callOrReturn<
            Parameters<IgnoreFunc<RecordType>>,
            boolean
          >(column.ignoreRef || false, ignoreArgs),
        },
        additionalProps.className,
        cellClassName,
      ),
      style: {
        ...additionalProps.style,
        ...alignStyle,
        ...placeStyle,
        ...fixStyle, // fix处理了left 优先级高于placeStyle
        ...cellSizeStyle,
        ...cellStyle,
        ...cellZIndex,
      },
      ref: null,
    };
  }, [
    additionalProps,
    alignStyle,
    appendNode,
    cellClassName,
    cellPrefixCls,
    cellSizeStyle,
    cellStyle,
    className,
    column.ignoreDisable,
    column.ignoreRef,
    column.ignoreStopBid,
    ellipsis,
    firstFixRight,
    fixStyle,
    ignoreArgs,
    isFixLeft,
    isFixRight,
    isSticky,
    lastFixLeft,
    mergedColSpan,
    mergedRowSpan,
    placeStyle,
    restCellProps,
    title,
    cellZIndex,
  ]);

  return React.useMemo(() => {
    // ===================== No Span ======================
    if (mergedColSpan === 0 || mergedRowSpan === 0) {
      return null;
    }

    const cellHasEdit = !!editRender;

    return (
      <div {...componentProps} ref={cellRef}>
        {appendNode}
        {cellHasEdit ? (
          <EditCell
            editRender={editRender}
            dataIndex={dataIndex!}
            record={record!}
            getRowKey={getRowKey!}
            editingKey={editingKey}
          />
        ) : (
          childNodeMemo
        )}
      </div>
    );
  }, [
    appendNode,
    childNodeMemo,
    componentProps,
    dataIndex,
    editRender,
    editingKey,
    getRowKey,
    mergedColSpan,
    mergedRowSpan,
    record,
  ]);
}

// const InnerMemoCell = React.memo(Cell);
// InnerMemoCell.displayName = 'Cell';

const MemoCell = React.memo(
  Cell,
  (prev: CellProps<DefaultRecordType>, next: CellProps<DefaultRecordType>) => {
    if (next.shouldCellUpdate) {
      return (
        // Additional handle of expanded logic
        prev.expanded === next.expanded &&
        // User control update logic
        !next.shouldCellUpdate(next.record!, prev.record!)
      );
    }

    return false;
  },
);

export default MemoCell;
