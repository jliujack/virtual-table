import * as React from 'react';
import classNames from 'classnames';
import { VariableSizeGrid as Grid, areEqual } from 'react-window';
import type { VariableSizeGrid, GridProps, Align } from 'react-window';

import Row, { BodyRowProps } from './BodyRow';
import TableContext from '../../context/TableContext';
import BodyContext from '../../context/BodyContext';
import type {
  GetRowKey,
  Key,
  GetComponentProps,
  DefaultRecordType,
  TableFunc,
} from '../../interface';

export type TableRef = {
  scrollLeft: number;
} & TableFunc &
  HTMLElement;

export interface BodyProps<RecordType> {
  data: readonly { record: RecordType; indent: number }[];
  getRowKey: GetRowKey<RecordType>;
  getRowWithExpandRowHeight: (rowIndex: number) => number;
  setRowHeight: (rowIndex: number, rowHeight: number) => void;
  expandedKeys: Set<Key>;
  onRow?: GetComponentProps<RecordType>;
  rowExpandable?: (record: RecordType) => boolean;
  emptyNode: React.ReactNode;
  childrenColumnName: string;
  editingKey?: number | string;
  onScroll: ({
    currentTarget,
    scrollLeft,
  }: {
    currentTarget: HTMLElement;
    scrollLeft?: number;
  }) => void;
  overscanRowCount?: GridProps['overscanRowCount'];
  frozenDataLength?: number;
  onRowsRendered?: (renderInfo: {
    overscanStartIndex: number;
    overscanStopIndex: number;
    startIndex: number;
    stopIndex: number;
    startRow: RecordType;
    stopRow: RecordType;
  }) => void;
  contextMenuId?: string;
}

function Body<RecordType extends DefaultRecordType>(
  props: BodyProps<RecordType>,
  ref: React.Ref<TableRef>,
) {
  const {
    data,
    getRowKey,
    getRowWithExpandRowHeight,
    setRowHeight,
    expandedKeys,
    onRow,
    rowExpandable,
    emptyNode,
    childrenColumnName,
    onScroll,
    overscanRowCount = 1,
    frozenDataLength = 0,
    editingKey,
    onRowsRendered,
    contextMenuId,
  } = props;

  const { prefixCls, tableSpecialClass, scrollbarSize } = React.useContext(TableContext);
  const tablePrefixCls = `${prefixCls}-tbody`;

  const { width, bodyWidth, bodyHeight, colTotalWidth, verticalScroll, horizonScroll } =
    React.useContext(BodyContext);

  const gridRef = React.useRef<VariableSizeGrid>(null);
  const scrollToTop = (scrollTop: number) => {
    if (gridRef.current) {
      // @ts-ignore
      gridRef.current.scrollTo({ scrollTop });
    }
  };

  const scrollToRow = (rowIndex = 0, align: Align = 'auto') => {
    if (gridRef.current) {
      gridRef.current.scrollToItem({ rowIndex, align });
    }
  };
  const [connectObject] = React.useState<TableRef>(() => {
    // @ts-ignore
    const obj: TableRef = {
      scrollToTop,
      scrollToRow,
    };
    Object.defineProperty(obj, 'scrollLeft', {
      get: () => null,
      set: (scrollLeft: number) => {
        if (gridRef.current) {
          // @ts-ignore
          gridRef.current.scrollTo({ scrollLeft });
        }
      },
    });

    return obj;
  });
  React.useImperativeHandle(ref, () => connectObject);

  // ====================== Width Calc ======================
  const columnWidth = Math.max(colTotalWidth, bodyWidth);

  // ====================== Row Height ======================
  const resetRowHeight = React.useCallback<
    Exclude<BodyRowProps<RecordType>['resetRowHeight'], undefined>
  >(
    (rowIndex, newHeight) => {
      setRowHeight(rowIndex, newHeight);
      gridRef.current?.resetAfterRowIndex(rowIndex, false);
    },
    [setRowHeight],
  );

  // ====================== Overflow Style ======================
  const overFlowStyle: React.CSSProperties = React.useMemo(() => {
    return {
      overflowX: horizonScroll ? 'auto' : 'hidden',
      overflowY: verticalScroll ? 'auto' : 'hidden',
    };
  }, [horizonScroll, verticalScroll]);

  // ====================== Effect ======================
  React.useEffect(() => {
    if (gridRef.current) {
      gridRef.current.resetAfterColumnIndex(0);
    }
  }, [columnWidth]);

  React.useEffect(() => {
    if (gridRef.current) {
      // 这里很重要
      gridRef.current.resetAfterRowIndex(1, true);
    }
  }, [setRowHeight, getRowWithExpandRowHeight]);

  // ====================== Item Key ======================
  // @ts-ignore
  const getItemKey = React.useCallback<GridProps['itemKey']>(
    ({ rowIndex }) => {
      return getRowKey(data[rowIndex].record);
    },
    [data, getRowKey],
  );

  // ====================== Grid Row ======================
  const propsRefs = React.useRef<
    BodyProps<RecordType> & {
      getItemKey: GridProps['itemKey'];
      resetRowHeight: Exclude<BodyRowProps<RecordType>['resetRowHeight'], undefined>;
    }
  >({ ...props, getItemKey, resetRowHeight });
  propsRefs.current = { ...props, getItemKey, resetRowHeight };

  // @ts-ignore
  const GridChildren = React.useCallback<GridProps['children']>(
    (gridProps) => {
      const { rowIndex, style } = gridProps;
      const { record, indent } = propsRefs.current.data[rowIndex];
      const key = propsRefs.current.getRowKey(record, rowIndex);
      return (
        <Row
          key={key}
          record={record}
          recordKey={key}
          rowKey={key}
          expandedKeys={propsRefs.current.expandedKeys}
          onRow={propsRefs.current.onRow}
          editingKey={propsRefs.current.editingKey}
          getRowKey={propsRefs.current.getRowKey}
          rowExpandable={propsRefs.current.rowExpandable}
          resetRowHeight={propsRefs.current.resetRowHeight}
          childrenColumnName={propsRefs.current.childrenColumnName}
          indent={indent}
          style={style}
          index={rowIndex}
          absoluteIndex={rowIndex + (propsRefs.current.frozenDataLength || 0)}
          contextMenuId={propsRefs.current.contextMenuId}
        />
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ====================== react window event ======================
  // @ts-ignore
  const handleItemsRendered = React.useCallback<GridProps<RecordType>['onItemsRendered']>(
    ({
      overscanRowStartIndex,
      overscanRowStopIndex,
      visibleRowStartIndex,
      visibleRowStopIndex,
    }) => {
      if (
        onRowsRendered &&
        visibleRowStartIndex < data.length &&
        visibleRowStopIndex < data.length
      ) {
        onRowsRendered({
          overscanStartIndex: overscanRowStartIndex,
          overscanStopIndex: overscanRowStopIndex,
          startIndex: visibleRowStartIndex,
          stopIndex: visibleRowStopIndex,
          startRow: data[visibleRowStartIndex].record,
          stopRow: data[visibleRowStopIndex].record,
        });
      }
    },
    [data, onRowsRendered],
  );

  return React.useMemo(() => {
    if (!data.length) {
      return <>{emptyNode}</>;
    }

    return (
      <Grid
        ref={gridRef}
        className={classNames(tableSpecialClass, tablePrefixCls)}
        columnCount={1}
        columnWidth={() => columnWidth}
        height={bodyHeight}
        rowCount={data.length}
        rowHeight={getRowWithExpandRowHeight}
        width={width}
        overscanRowCount={overscanRowCount}
        onScroll={({ scrollLeft }) => {
          if (scrollLeft + width > colTotalWidth) {
            let newScrollLeft = colTotalWidth - width;
            if (newScrollLeft < 0) {
              newScrollLeft = 0;
            }
            onScroll({
              currentTarget: connectObject,
              scrollLeft: newScrollLeft,
            });
            return;
          }
          if (scrollLeft < 0) {
            onScroll({ currentTarget: connectObject, scrollLeft: 0 });
          } else {
            onScroll({ currentTarget: connectObject, scrollLeft });
          }
        }}
        onItemsRendered={handleItemsRendered}
        style={{ ...overFlowStyle, willChange: 'unset' }}
        itemKey={getItemKey}
      >
        {GridChildren}
      </Grid>
    );
  }, [
    data.length,
    tableSpecialClass,
    tablePrefixCls,
    bodyHeight,
    getRowWithExpandRowHeight,
    width,
    overscanRowCount,
    overFlowStyle,
    getItemKey,
    GridChildren,
    emptyNode,
    columnWidth,
    colTotalWidth,
    onScroll,
    connectObject,
    handleItemsRendered,
  ]);
}

// https://fettblog.eu/typescript-react-generic-forward-refs/
// @ts-ignore
const RefBody = React.forwardRef(Body) as <T>(
  props: BodyProps<T> & { ref: React.ForwardedRef<TableRef> },
) => ReturnType<typeof Body>;
// @ts-ignore
RefBody.displayName = 'Body';

export default RefBody;
