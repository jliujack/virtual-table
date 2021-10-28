import React, { useState } from 'react';
import { Table } from '@qtrade/qtui';
import { Button } from 'antd';

import { generateColumns, generateData } from './utils';
import '../../style';

const { AutoResizer } = Table;

const initColumns = generateColumns(30);
initColumns[0].fixed = 'left';
initColumns[0].align = 'center';
initColumns[0].render = ({ cellData, rowIndex }) => ({
  props: { colSpan: 2, rowSpan: rowIndex % 2 ? 0 : 2 },
  children: <span>{cellData}</span>,
});
initColumns[1].fixed = 'left';
initColumns[1].render = () => ({
  props: { colSpan: 0 },
});
initColumns[2].fixed = 'right';

const data = generateData(initColumns, 1000);

initColumns[3].children = [initColumns[11], initColumns[12]];
initColumns[3].align = 'center';
initColumns[4].align = 'center';
initColumns.length = 20;

const Demo = () => {
  const [columns, setColumns] = useState(initColumns);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
      <h2>横向虚拟化与固定列</h2>
      <Button
        onClick={() => {
          setColumns((pre) => pre.slice(0, 10));
        }}
      >
        减少Columns
      </Button>
      <Button
        onClick={() => {
          setColumns(initColumns);
        }}
      >
        reset Columns
      </Button>
      <div style={{ flex: 1 }}>
        <AutoResizer>
          {({ width, height }) => {
            return (
              <Table
                // expandedRowRender={(record) => <p>extra: {record.a}</p>}
                // expandedRowClassName={(record, i) => `ex-row-${i}`}
                dataSource={data.slice(0, 14)}
                className="table"
                columns={columns}
                width={width}
                height={height}
                bordered
                enableHorizontalVirtual
              />
            );
          }}
        </AutoResizer>
      </div>
    </div>
  );
};

export default Demo;
