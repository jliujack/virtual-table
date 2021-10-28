import * as React from 'react';
import type {
  ColumnsType,
  CellType,
  StickyOffsets,
  ColumnType,
  GetComponentProps,
  ColumnGroupType,
} from '../../interface';
import HeaderRow from './HeaderRow';

import TableContext from '../../context/TableContext';
import BodyContext from '../../context/BodyContext';

function parseHeaderRows<RecordType>(
  rootColumns: ColumnsType<RecordType>,
): CellType<RecordType>[][] {
  const rows: CellType<RecordType>[][] = [];

  function fillRowCells(
    columns: ColumnsType<RecordType>,
    colIndex: number,
    rowIndex: number = 0,
    isLastCell: boolean = false,
  ): number[] {
    // Init rows
    rows[rowIndex] = rows[rowIndex] || [];

    let currentColIndex = colIndex;
    const colSpans: number[] = columns.filter(Boolean).map((column, index) => {
      const cell: CellType<RecordType> = {
        key: column.key,
        className: column.className || '',
        children: column.title,
        column,
        colStart: currentColIndex,
        isLastCell: isLastCell && index === columns.length - 1,
      };

      if (rowIndex === 0 && index === columns.length - 1) {
        cell.isLastCell = true;
      }

      let colSpan: number = 1;

      const subColumns = (column as ColumnGroupType<RecordType>).children;
      if (subColumns && subColumns.length > 0) {
        colSpan = fillRowCells(subColumns, currentColIndex, rowIndex + 1, cell.isLastCell).reduce(
          (total, count) => total + count,
          0,
        );
        cell.hasSubColumns = true;
      }

      if ('colSpan' in column) {
        // @ts-ignore
        ({ colSpan } = column);
      }

      if ('rowSpan' in column) {
        cell.rowSpan = column.rowSpan;
      }

      cell.colSpan = colSpan;
      cell.colEnd = cell.colStart! + colSpan - 1;
      rows[rowIndex].push(cell);

      currentColIndex += colSpan;

      return colSpan;
    });

    return colSpans;
  }

  // Generate `rows` cell data
  fillRowCells(rootColumns, 0);

  // Handle `rowSpan`
  const rowCount = rows.length;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    rows[rowIndex].forEach((cell) => {
      if (!('rowSpan' in cell) && !cell.hasSubColumns) {
        // eslint-disable-next-line no-param-reassign
        cell.rowSpan = rowCount - rowIndex;
      }
    });
  }

  return rows;
}

export interface HeaderProps<RecordType> {
  columns: ColumnsType<RecordType>;
  frozenData?: readonly RecordType[];
  flattenColumns: readonly ColumnType<RecordType>[];
  stickyOffsets: StickyOffsets;
  onHeaderRow: GetComponentProps<readonly ColumnType<RecordType>[]>;
  fixedRow?: JSX.Element | null;
}

function Header<RecordType>({
  stickyOffsets,
  columns,
  flattenColumns,
  onHeaderRow,
  fixedRow,
}: HeaderProps<RecordType>): React.ReactElement {
  const { prefixCls, scrollbarSize } = React.useContext(TableContext);
  const { colTotalWidth, headerHeight, width, horizonScroll } = React.useContext(BodyContext);
  const rows: CellType<RecordType>[][] = React.useMemo(() => parseHeaderRows(columns), [columns]);

  const headerStyle = {
    width: Math.max(colTotalWidth, width) + (horizonScroll ? scrollbarSize : 0),
    height: headerHeight * rows.length,
  };
  return (
    <>
      <div className={`${prefixCls}-thead`} style={headerStyle}>
        {rows.map((row, rowIndex) => {
          const rowNode = (
            <HeaderRow
              key={rowIndex}
              flattenColumns={flattenColumns}
              cells={row}
              stickyOffsets={stickyOffsets}
              onHeaderRow={onHeaderRow}
              index={rowIndex}
            />
          );

          return rowNode;
        })}
      </div>
      {/* 固定行dom */}
      {fixedRow}
    </>
  );
}

export default Header;
