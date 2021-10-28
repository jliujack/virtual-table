import * as React from 'react';

import Cell from '../Cell';
import { CellType, StickyOffsets, ColumnType, GetComponentProps } from '../../interface';
import TableContext from '../../context/TableContext';
import { getCellFixedInfo } from '../../utils/fixUtil';
import { getColumnsKey } from '../../utils/valueUtil';
import BodyContext from '../../context/BodyContext';
import ScrollContext from '../../context/ScrollContext';

export interface RowProps<RecordType> {
  cells: readonly CellType<RecordType>[];
  stickyOffsets: StickyOffsets;
  flattenColumns: readonly ColumnType<RecordType>[];
  onHeaderRow: GetComponentProps<readonly ColumnType<RecordType>[]>;
  index: number;
}

function HeaderRow<RecordType>({
  cells,
  stickyOffsets,
  flattenColumns,
  onHeaderRow,
  index,
}: RowProps<RecordType>) {
  const { prefixCls } = React.useContext(TableContext);
  const { headerHeight } = React.useContext(BodyContext);
  const { scrollLeft } = React.useContext(ScrollContext);
  const headerRowPrefixCls = `${prefixCls}-header-row`;

  let rowProps: React.HTMLAttributes<HTMLElement> = {};
  if (onHeaderRow) {
    rowProps = onHeaderRow(
      cells.map((cell) => cell.column!),
      index,
    );
  }

  const columnsKey = getColumnsKey(cells.map((cell) => cell.column!));

  // ====================== style ======================
  const headerRowStyle = {
    height: headerHeight,
  };

  return (
    <div {...rowProps} className={headerRowPrefixCls} style={{ ...headerRowStyle }}>
      {cells.map((cell: CellType<RecordType>, cellIndex) => {
        const { column = {} } = cell;
        const fixedInfo = getCellFixedInfo(
          cell.colStart!,
          cell.colEnd!,
          flattenColumns,
          stickyOffsets,
        );

        let additionalProps: React.HTMLAttributes<HTMLElement> = {};
        if (column && column.onHeaderCell) {
          additionalProps = cell.column!.onHeaderCell!(column);
        }

        return (
          // @ts-ignore
          <Cell
            {...cell}
            ellipsis={column.ellipsis}
            align={column.align}
            prefixCls={prefixCls}
            key={columnsKey[cellIndex]}
            {...fixedInfo}
            additionalProps={additionalProps}
            rowType="header"
            scrollLeft={scrollLeft}
            isLastHeaderCell={cell.isLastCell}
          />
        );
      })}
    </div>
  );
}

HeaderRow.displayName = 'HeaderRow';

export default HeaderRow;
