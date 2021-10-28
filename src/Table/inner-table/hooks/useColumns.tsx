/**
 * Todo:
 * -
 *  to fixed
 */

import * as React from 'react';
import warning from 'rc-util/lib/warning';
import toArray from 'rc-util/lib/Children/toArray';
import type {
  ColumnsType,
  ColumnType,
  FixedType,
  Key,
  GetRowKey,
  TriggerEventHandler,
  RenderExpandIcon,
  ColumnGroupType,
} from '../interface';
import { getColumnsKey } from '../utils/valueUtil';

export function convertChildrenToColumns<RecordType>(
  children: React.ReactNode,
): ColumnsType<RecordType> {
  return toArray(children)
    .filter((node) => React.isValidElement(node))
    .map(({ key, props }: React.ReactElement) => {
      const { children: nodeChildren, ...restProps } = props;
      const column = {
        key,
        ...restProps,
      };

      if (nodeChildren) {
        column.children = convertChildrenToColumns(nodeChildren);
      }

      return column;
    });
}

const defaultWidth = 100;

/** resort columns to fixLeft->normal->fixRight */
function handleFix<RecordType>(columns: ColumnsType<RecordType>) {
  let normalArr: ColumnsType<RecordType> = [];
  let fixLeftArr: ColumnsType<RecordType> = [];
  let fixRightArr: ColumnsType<RecordType> = [];

  columns.forEach((col) => {
    // eslint-disable-next-line no-param-reassign
    col.fixed = col.fixed || col.frozen;
    if (col.fixed === 'left' || col.fixed === true) {
      fixLeftArr = [...fixLeftArr, col];
    } else if (col.fixed === 'right') {
      fixRightArr = [...fixRightArr, col];
    } else {
      normalArr = [...normalArr, col];
    }
  });

  return [...fixLeftArr, ...normalArr, ...fixRightArr];
}

/** get flatted columns with same */
function getFlattedColumns<RecordType>(columns: ColumnsType<RecordType>) {
  const flattedColumns = columns.reduce((list, column) => {
    const subColumns = (column as ColumnGroupType<RecordType>).children;
    let ret: ColumnType<RecordType>[];
    if (subColumns) {
      ret = [...list, ...getFlattedColumns(subColumns)];
    } else {
      ret = [...list, column];
    }

    return ret;
  }, [] as ColumnType<RecordType>[]);

  return flattedColumns;
}

/** resize columns' width while columns' total width < bodyWidth */
function autoResizeWidth<RecordType>(columns: ColumnsType<RecordType>, bodyWidth: number) {
  const flattedColumns: ColumnType<RecordType>[] = getFlattedColumns(columns);

  const totalWidth = flattedColumns.reduce(
    (sum, column) => sum + (column.width || defaultWidth),
    0,
  );
  if (bodyWidth > totalWidth) {
    const autoResizeCols = flattedColumns.filter((col) => col.autoSize !== false);
    const addedWidth = Math.floor((bodyWidth - totalWidth) / autoResizeCols.length);
    const remainder = bodyWidth - totalWidth - addedWidth * autoResizeCols.length;
    autoResizeCols.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.width = item.width || defaultWidth;
      // eslint-disable-next-line no-param-reassign
      item.width += addedWidth;
    });
    for (let i = 0; i < autoResizeCols.length; i += 1) {
      if (!autoResizeCols[i].fixed) {
        autoResizeCols[i].width! += remainder;
        break;
      }
    }
  }

  return columns;
}

function flatColumns<RecordType>(
  columns: ColumnsType<RecordType>,
  left: number,
): { leftDistance: number; newColumns: ColumnType<RecordType>[] } {
  let leftDistance = left;

  const newColumns = columns.reduce((list, column) => {
    const { fixed, width = defaultWidth } = column;

    // eslint-disable-next-line no-param-reassign
    column.left = leftDistance;
    // Convert `fixed='true'` to `fixed='left'` instead
    const parsedFixed = fixed === true ? 'left' : fixed;

    let ret: ColumnType<RecordType>[];
    const subColumns = (column as ColumnGroupType<RecordType>).children;
    if (subColumns && subColumns.length > 0) {
      const retObj = flatColumns(subColumns, leftDistance);
      ret = [
        ...list,
        ...retObj.newColumns.map((subColum) => Object.assign(subColum, { fixed: parsedFixed })),
      ];
      leftDistance = retObj.leftDistance;
    } else {
      ret = [...list, Object.assign(column, { fixed: parsedFixed, width })];
      leftDistance += width;
    }
    return ret;
  }, [] as ColumnType<RecordType>[]);

  return {
    leftDistance,
    newColumns,
  };
}

function warningFixed(flattenColumns: readonly { fixed?: FixedType }[]) {
  let allFixLeft = true;
  for (let i = 0; i < flattenColumns.length; i += 1) {
    const col = flattenColumns[i];
    if (allFixLeft && col.fixed !== 'left') {
      allFixLeft = false;
    } else if (!allFixLeft && col.fixed === 'left') {
      warning(false, `Index ${i - 1} of \`columns\` missing \`fixed='left'\` prop.`);
      break;
    }
  }

  let allFixRight = true;
  for (let i = flattenColumns.length - 1; i >= 0; i -= 1) {
    const col = flattenColumns[i];
    if (allFixRight && col.fixed !== 'right') {
      allFixRight = false;
    } else if (!allFixRight && col.fixed === 'right') {
      warning(false, `Index ${i + 1} of \`columns\` missing \`fixed='right'\` prop.`);
      break;
    }
  }
}

/**
 * Parse `columns` & `children` into `columns`.
 */
function useColumns<RecordType>(
  {
    prefixCls = '',
    columns,
    children,
    expandable,
    expandedKeys,
    getRowKey,
    onTriggerExpand,
    expandIcon,
    rowExpandable,
    expandIconColumnIndex,
    expandRowByClick,
    columnWidth,
    fixed,
    bodyWidth,
  }: {
    prefixCls?: string;
    columns?: ColumnsType<RecordType>;
    children?: React.ReactNode;
    expandable: boolean;
    expandedKeys: Set<Key>;
    getRowKey: GetRowKey<RecordType>;
    onTriggerExpand: TriggerEventHandler<RecordType>;
    expandIcon: RenderExpandIcon<RecordType>;
    rowExpandable?: (record: RecordType) => boolean;
    expandIconColumnIndex?: number;
    expandRowByClick?: boolean;
    columnWidth?: number;
    fixed?: FixedType;
    bodyWidth: number;
  },
  transformColumns?: (columns: ColumnsType<RecordType>) => ColumnsType<RecordType>,
): {
  columns: ColumnsType<RecordType>;
  flattenColumns: readonly ColumnType<RecordType>[];
  colsWidths: Map<React.Key, number>;
} {
  const baseColumns = React.useMemo<ColumnsType<RecordType>>(
    () => columns || convertChildrenToColumns(children),
    [columns, children],
  );

  // Add expand column
  const withExpandColumns = React.useMemo<ColumnsType<RecordType>>(() => {
    if (expandable) {
      const expandColIndex = expandIconColumnIndex || 0;
      const prevColumn = baseColumns[expandColIndex];

      let fixedColumn: FixedType | undefined;
      if ((fixed === 'left' || fixed) && !expandIconColumnIndex) {
        fixedColumn = 'left';
      } else if ((fixed === 'right' || fixed) && expandIconColumnIndex === baseColumns.length) {
        fixedColumn = 'right';
      } else {
        fixedColumn = prevColumn ? prevColumn.fixed : undefined;
      }

      const expandColumn: ColumnType<RecordType> = {
        key: 'expand-cell',
        title: '',
        fixed: fixedColumn,
        className: `${prefixCls}-row-expand-icon-cell`,
        width: columnWidth,
        render: ({ rowData, rowIndex }) => {
          const rowKey = getRowKey(rowData, rowIndex);
          const expanded = expandedKeys.has(rowKey);
          const recordExpandable = rowExpandable ? rowExpandable(rowData) : true;

          const icon = expandIcon({
            prefixCls,
            expanded,
            expandable: recordExpandable,
            record: rowData,
            onExpand: onTriggerExpand,
          });

          if (expandRowByClick) {
            return <span onClick={(e) => e.stopPropagation()}>{icon}</span>;
          }
          return icon;
        },
      };

      // Insert expand column in the target position
      const cloneColumns = baseColumns.slice();
      if (expandColIndex >= 0) {
        cloneColumns.splice(expandColIndex, 0, expandColumn);
      }
      return cloneColumns;
    }
    return baseColumns;
  }, [
    expandable,
    baseColumns,
    expandIconColumnIndex,
    fixed,
    prefixCls,
    columnWidth,
    getRowKey,
    expandedKeys,
    rowExpandable,
    expandIcon,
    onTriggerExpand,
    expandRowByClick,
  ]);

  const mergedColumns = React.useMemo(() => {
    let finalColumns = withExpandColumns;
    if (transformColumns) {
      finalColumns = transformColumns(finalColumns);
    }

    // Always provides at least one column for table display
    if (!finalColumns.length) {
      finalColumns = [
        {
          render: () => null,
        },
      ];
    }
    return autoResizeWidth(handleFix(finalColumns), bodyWidth);
  }, [bodyWidth, transformColumns, withExpandColumns]);

  const withDefaultWidthColumns = React.useMemo(() => {
    return mergedColumns.map((item) => {
      // eslint-disable-next-line no-param-reassign
      item.width = item.width || defaultWidth;
      return item;
    });
  }, [mergedColumns]);

  const flattenColumns = React.useMemo(() => {
    const { newColumns } = flatColumns(withDefaultWidthColumns, 0);
    for (let index = 0; index < newColumns.length - 1; index += 1) {
      const col = newColumns[index];
      col.next = newColumns[index + 1];
    }
    return newColumns;
  }, [withDefaultWidthColumns]);

  // Only check out of production since it's waste for each render
  if (process.env.NODE_ENV !== 'production') {
    warningFixed(flattenColumns);
  }

  // ====================== colsWidths ======================
  const colsWidths = new Map<React.Key, number>();
  const keys = getColumnsKey(flattenColumns);
  flattenColumns.forEach((col, idx) => {
    colsWidths.set(keys[idx], col.width || defaultWidth);
  });

  // 调试代码， 用于判断column是否改变
  // const lastFlattenColumns = React.useRef<unknown[]>([]);
  // React.useEffect(() => {
  //   flattenColumns.forEach((item, index) => {
  //     console.log('liujie log:', `column-${index} :`, item === lastFlattenColumns.current[index]);
  //   });
  //   console.log('liujie log:', 'last:', lastFlattenColumns.current, 'new:', flattenColumns);
  //   lastFlattenColumns.current = flattenColumns;
  // }, [flattenColumns]);

  return { columns: withDefaultWidthColumns, flattenColumns, colsWidths };
}

export default useColumns;
