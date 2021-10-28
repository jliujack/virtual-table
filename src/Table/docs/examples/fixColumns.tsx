import React from 'react';
import { Table } from '@qtrade/qtui';
import '../../style';

import { generateColumns, generateData } from './utils';

const columns = generateColumns(30);
columns[0].fixed = 'left';
columns[0].align = 'center';
columns[0].render = ({ cellData }) => ({
  props: { colSpan: 2 },
  children: <span>{cellData}</span>,
});
columns[1].fixed = 'left';
columns[10].fixed = 'right';

const data = generateData(columns, 1000);

columns[3].children = [columns[11], columns[12]];
columns[3].align = 'center';

columns.length = 11;

const Demo = () => (
  <div>
    <h2>固定列</h2>
    <Table
      // expandedRowRender={(record) => <p>extra: {record.a}</p>}
      // expandedRowClassName={(record, i) => `ex-row-${i}`}
      dataSource={data}
      className="table"
      columns={columns}
      width={700}
      height={400}
      bordered
    />
  </div>
);

export default Demo;
