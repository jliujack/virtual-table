import React from 'react';
import { Switch } from 'antd';
import 'antd/es/switch/style';
import { Table } from '@qtrade/qtui';
import '../../style';

import { generateColumns, generateData } from './utils';

const columns = generateColumns(30);
columns[0].fixed = 'left';

const data = generateData(columns, 1000);

const Demo = () => {
  const [loading, setLoading] = React.useState(false);
  return (
    <div>
      <h2>loading</h2>
      <p>
        <b>可以传布尔值也可以是Spin组件的props</b>
      </p>
      <Switch checked={loading} onChange={(checked) => setLoading(checked)} />
      <Table
        // expandedRowRender={(record) => <p>extra: {record.a}</p>}
        // expandedRowClassName={(record, i) => `ex-row-${i}`}
        dataSource={data}
        className="table"
        columns={columns}
        width={700}
        height={400}
        loading={loading}
        enableHorizontalVirtual
      />
    </div>
  );
};

export default Demo;
