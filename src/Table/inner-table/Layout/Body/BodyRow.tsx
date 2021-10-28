import * as React from 'react';
import classNames from 'classnames';

import MenuProvider from '../../../../ContextMenu/MenuProvider';
import Cell from '../Cell';
import TableContext from '../../context/TableContext';
import BodyContext from '../../context/BodyContext';
import ScrollContext from '../../context/ScrollContext';
import { getColumnsKey, callOrReturn } from '../../utils/valueUtil';
import type { Key, GetRowKey, DefaultRecordType, GetComponentProps } from '../../interface';
import { getPrefixClass } from '../../utils/className';
import useVirtualColumnsFilter from '../../hooks/useVirtualColumnsFilter';
import useExpandRowRender, { ExpandRowRenderProps } from '../../hooks/useExpandRowRender';
import useRowFlag from './useRowFlag';
import useEventHandler from './useEventHandler';
import { noop } from 'lodash';
import { areEqual } from 'react-window';

const STABLE_OBJECT = {};

export interface BodyRowProps<RecordType> {
  record: RecordType;
  /** 行序号 */
  index: number;
  absoluteIndex: number;
  className?: string;
  style?: React.CSSProperties;
  recordKey: Key;
  expandedKeys?: Set<Key>;
  rowExpandable?: (record: RecordType) => boolean;
  onRow?: GetComponentProps<RecordType>;
  resetRowHeight?: (rowIndex: number, newHeight: number) => void;
  indent?: number;
  rowKey: React.Key;
  getRowKey: GetRowKey<RecordType>;
  childrenColumnName?: string;
  editingKey?: number | string;
  contextMenuId?: string;
}

function BodyRow<RecordType extends DefaultRecordType>(props: BodyRowProps<RecordType>) {
  const {
    className,
    style,
    record,
    index,
    absoluteIndex,
    rowKey,
    rowExpandable,
    onRow,
    resetRowHeight = noop,
    expandedKeys,
    indent = 0,
    getRowKey,
    childrenColumnName,
    editingKey,
    contextMenuId,
  } = props;
  const { prefixCls, fixedInfoMap, intervalRowBg } = React.useContext(TableContext);
  const {
    expandableType,
    expandRowByClick,
    onTriggerExpand,
    rowClassName,
    expandedRowClassName,
    indentSize,
    expandIcon,
    expandedRowRender,
    expandIconColumnIndex,
    getRowHeight,
    rowEventHandlers,
    onRowSelect,
    onRowHover,
    rowFlag,
  } = React.useContext(BodyContext);
  const { scrollLeft } = React.useContext(ScrollContext);

  const rowFlagClassName = useRowFlag({ rowFlag, rowData: record, rowIndex: index, prefixCls });

  const expanded = (expandedKeys && expandedKeys.has(props.recordKey)) || false;

  const rowSupportExpand = expandableType === 'row' && (!rowExpandable || rowExpandable(record));
  // Only when row is not expandable and `children` exist in record
  const nestExpandable = expandableType === 'nest';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasNestChildren = childrenColumnName && record && (record as any)[childrenColumnName];
  const mergedExpandable = rowSupportExpand || nestExpandable;

  // ======================== Expandable =========================
  const onExpandRef = React.useRef(onTriggerExpand);
  onExpandRef.current = onTriggerExpand;

  const onInternalTriggerExpand = React.useCallback(
    (...args: Parameters<typeof onTriggerExpand>) => {
      onExpandRef.current(...args);
    },
    [],
  );

  const getRenderNode = React.useCallback<ExpandRowRenderProps['getRenderNode']>(
    (ref) => {
      const calcExpandedRowClassName =
        expandedRowClassName && expandedRowClassName({ rowData: record, index, indent });
      return (
        <div className={calcExpandedRowClassName} style={{ position: 'relative' }} ref={ref}>
          {expandedRowRender && expandedRowRender(record, index, indent, !!expanded)}
        </div>
      );
    },
    [expanded, expandedRowClassName, expandedRowRender, indent, index, record],
  );

  const resetHeight = React.useCallback(
    (height: number) => {
      resetRowHeight(index, height);
    },
    [index, resetRowHeight],
  );

  // 使用Ref 优化性能
  const getRenderNodeRef = React.useRef(getRenderNode);
  getRenderNodeRef.current = getRenderNode;
  const renderProps = React.useMemo(() => {
    return { expanded, getRenderNode: getRenderNodeRef.current, resetHeight, rowSupportExpand };
  }, [expanded, resetHeight, rowSupportExpand]);

  const { node } = useExpandRowRender(renderProps);

  // =========================== onRow ===========================
  let additionalProps: React.HTMLAttributes<HTMLElement> = React.useMemo(() => ({}), []);
  if (onRow) {
    additionalProps = onRow(record, index);
  }

  const elementEventHandlers = useEventHandler<RecordType>(
    rowEventHandlers || STABLE_OBJECT,
    record,
    index,
    onRowHover,
    onRowSelect,
    rowKey,
  );

  const onClick: React.MouseEventHandler<HTMLElement> = React.useCallback(
    (event, ...args) => {
      if (expandRowByClick && mergedExpandable) {
        onInternalTriggerExpand(record, event);
      }

      if (additionalProps && additionalProps.onClick) {
        additionalProps.onClick(event, ...args);
      }

      if (rowEventHandlers && rowEventHandlers.onClick) {
        rowEventHandlers.onClick({
          rowData: record,
          rowIndex: index,
          rowKey,
          event,
        });
      }

      if (onRowSelect) {
        onRowSelect({
          rowData: record,
          rowIndex: index,
          rowKey,
          event,
        });
      }
    },
    [
      additionalProps,
      expandRowByClick,
      index,
      mergedExpandable,
      onInternalTriggerExpand,
      onRowSelect,
      record,
      rowEventHandlers,
      rowKey,
    ],
  );

  // =================== virtual render columns ==================
  const filterColumns = useVirtualColumnsFilter(scrollLeft);

  // ========================= Base  row =========================
  const computeRowClassName: string = callOrReturn(rowClassName, {
    rowData: record,
    index,
    indent,
  });

  const columnsKey = React.useMemo(() => {
    return getColumnsKey(filterColumns);
  }, [filterColumns]);

  const baseRowNode = React.useMemo(
    () => (
      <div
        {...elementEventHandlers}
        {...additionalProps}
        data-row-key={rowKey}
        className={classNames(
          `${prefixCls}-row`,
          `${prefixCls}-row-level-${indent}`,
          computeRowClassName,
          additionalProps && additionalProps.className,
          {
            [`${prefixCls}-row--interval`]: intervalRowBg && index % 2,
          },
          rowFlagClassName,
          className,
        )}
        style={{ height: getRowHeight(index) }}
        onClick={onClick}
      >
        {filterColumns.map((column, colIndex) => {
          const { render, dataIndex, className: _className, editRender } = column;

          const columnClassName =
            typeof _className === 'function' ? _className({ rowData: record }) : _className;

          const key = columnsKey[colIndex];
          const fixedInfo = fixedInfoMap.get(key);

          // ============= Used for nest expandable =============
          let appendCellNode: React.ReactNode;

          if (colIndex === (expandIconColumnIndex || 0) && nestExpandable) {
            appendCellNode = (
              <>
                <span
                  style={{ paddingLeft: `${indentSize * indent}px` }}
                  className={`${prefixCls}-row-indent indent-level-${indent}`}
                />
                {expandIcon({
                  prefixCls,
                  expanded,
                  expandable: hasNestChildren,
                  record,
                  onExpand: onInternalTriggerExpand,
                })}
              </>
            );
          }

          let additionalCellProps: React.HTMLAttributes<HTMLElement> = STABLE_OBJECT;
          if (column.onCell) {
            additionalCellProps = column.onCell(record, index);
          }

          const { fixLeft, fixRight } = fixedInfo || {};
          const isFixedCell = typeof fixLeft === 'number' || typeof fixRight === 'number';

          // 是否在该单元格显示左上角flag， 如 NEW、中标、 截标、 REF
          let withFlag = false;
          if (filterColumns[0].key === '__selection__') {
            withFlag = colIndex === 1 && !fixRight;
          } else {
            withFlag = colIndex === 0 && !fixRight;
          }
          if (column.key !== filterColumns[colIndex].key) {
            withFlag = false;
          }

          const cellClassName = {
            [getPrefixClass(prefixCls, 'row-cell--with-flag')]: withFlag,
          };

          return (
            <Cell
              className={classNames(columnClassName, cellClassName)}
              ellipsis={column.ellipsis}
              align={column.align}
              prefixCls={prefixCls}
              key={key}
              record={record}
              index={index}
              absoluteIndex={absoluteIndex}
              // @ts-ignore
              getRowKey={getRowKey}
              editingKey={editingKey}
              dataIndex={dataIndex}
              render={render}
              editRender={editRender}
              shouldCellUpdate={column.shouldCellUpdate}
              expanded={!!appendCellNode && expanded}
              {...fixedInfo}
              appendNode={appendCellNode}
              additionalProps={additionalCellProps}
              column={column}
              rowType="body"
              scrollLeft={isFixedCell ? scrollLeft : 0}
            />
          );
        })}
      </div>
    ),
    [
      absoluteIndex,
      additionalProps,
      className,
      columnsKey,
      computeRowClassName,
      editingKey,
      elementEventHandlers,
      expandIcon,
      expandIconColumnIndex,
      expanded,
      filterColumns,
      fixedInfoMap,
      getRowKey,
      hasNestChildren,
      indent,
      indentSize,
      index,
      intervalRowBg,
      nestExpandable,
      onClick,
      onInternalTriggerExpand,
      prefixCls,
      record,
      rowFlagClassName,
      getRowHeight,
      rowKey,
      scrollLeft,
    ],
  );

  const contextProps = React.useMemo(() => ({ rowData: record }), [record]);

  const rowWithContextMenu = React.useMemo(() => {
    if (contextMenuId) {
      return (
        <MenuProvider id={contextMenuId} data={contextProps}>
          {baseRowNode}
        </MenuProvider>
      );
    }

    return baseRowNode;
  }, [baseRowNode, contextMenuId, contextProps]);

  return (
    <div
      className={`${prefixCls}-row-wrapper`}
      style={{
        ...style,
        ...(additionalProps ? additionalProps.style : null),
      }}
    >
      {rowWithContextMenu}
      {node}
    </div>
  );
}

export default React.memo(BodyRow, areEqual);
