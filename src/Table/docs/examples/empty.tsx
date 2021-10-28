import React from 'react';
import { Table } from '@qtrade/qtui';
import '../../style';

import { generateColumns, generateData } from './utils';

const columns = generateColumns(30);
columns[0].fixed = 'left';

const data = generateData(columns, 1000);

const Demo = () => (
  <div>
    <h2>空数据</h2>
    <b>宽高由width与height决定</b>
    <Table
      // expandedRowRender={(record) => <p>extra: {record.a}</p>}
      // expandedRowClassName={(record, i) => `ex-row-${i}`}
      dataSource={[]}
      className="table"
      columns={columns}
      width={700}
      height={400}
      enableHorizontalVirtual
    />
  </div>
);

export default Demo;
