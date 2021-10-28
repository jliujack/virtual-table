import React from 'react';
import { Table } from '@qtrade/qtui';

import { generateColumns, generateData } from './utils';
import '../../style';

const columns = generateColumns(10);
const data = generateData(columns, 200);
const frozenData = generateData(columns, 3);

// columns[0].frozen = true;

export default () => (
  <div>
    <h2>固定行</h2>
    <React.Profiler
      id="table"
      onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime, interaction) => {
        console.log(id, phase, actualDuration, baseDuration, startTime, commitTime, interaction);
      }}
    >
      <Table
        // expandedRowRender={(record) => <p>extra: {record.a}</p>}
        // expandedRowClassName={(record, i) => `ex-row-${i}`}
        dataSource={data}
        className="table"
        columns={columns}
        width={700}
        frozenData={frozenData}
        height={400}
        bordered
      />
    </React.Profiler>
  </div>
);
