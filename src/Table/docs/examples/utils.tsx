import React from 'react';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style';
import { TableColumnsType, TableColumnType } from '@qtrade/qtui';

type DataRecord = Record<string, string>;

const generateColumns = (len: number): TableColumnsType<DataRecord> => {
  return new Array(len).fill(0).map((_item, idx) => {
    const col: TableColumnType<DataRecord> = {
      title: `col-${idx}`,
      dataIndex: `col-${idx}`,
      className: `col-${idx}`,
      key: `col-${idx}`,
      width: 100,
      fixed: false,
      ellipsis: true,
      // shouldCellUpdate: (record, prev) => {
      // },
      render: ({ cellData }) => {
        return (
          <Tooltip mouseEnterDelay={0.5} title="tooltip">
            {cellData}
          </Tooltip>
        );
      },
    };

    return col;
  });
};

const generateData = (
  columns: TableColumnsType<DataRecord>,
  len: number,
  rowKeyPrefix: string = 'row-key-',
) => {
  return new Array(len).fill(0).map((item, idx) => {
    const obj: Record<string, string> = { key: `${rowKeyPrefix}${idx}` };
    columns.forEach((col, idx2) => {
      obj[(col as TableColumnType<DataRecord>).dataIndex as string] = `row-${idx}-col-${idx2}`;
    });
    return obj;
  });
};

export { generateColumns, generateData };
