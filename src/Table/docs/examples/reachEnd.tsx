import React from 'react';
import { Table } from '@qtrade/qtui';

import { generateColumns, generateData } from './utils';
import '../../style';

const columns = generateColumns(30);
columns[0].fixed = 'left';
columns[0].align = 'center';
columns[1].fixed = 'left';
columns[10].fixed = 'right';

const data = generateData(columns, 50);

columns[3].children = [columns[11], columns[12]];
columns[3].align = 'center';

columns.length = 11;

const Demo = () => {
  const onEndReached = React.useCallback(() => {
    console.log('liujie log:', 'end reached');
  }, []);

  return (
    <div>
      <h2>滚动触底事件</h2>
      <Table
        // expandedRowRender={(record) => <p>extra: {record.a}</p>}
        // expandedRowClassName={(record, i) => `ex-row-${i}`}
        dataSource={data}
        className="table"
        columns={columns}
        width={700}
        height={500}
        bordered
        overscanRowCount={5}
        onEndReached={onEndReached}
        enableHorizontalVirtual
      />
    </div>
  );
};

export default Demo;
