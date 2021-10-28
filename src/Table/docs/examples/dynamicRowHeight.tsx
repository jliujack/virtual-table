import React, { useState, useCallback } from 'react';
import { Table, TableProps } from '@qtrade/qtui';
import { InputNumber } from 'antd';

import { generateColumns, generateData } from './utils';
import '../../style';

const columns = generateColumns(30);
columns[0].fixed = 'left';
columns[0].align = 'center';
columns[0].render = ({ cellData, rowIndex }) => ({
  props: { colSpan: 2, rowSpan: rowIndex % 2 ? 0 : 2 },
  children: <span>{cellData}</span>,
});
columns[1].fixed = 'left';
columns[1].render = () => ({
  props: { colSpan: 0 },
});
columns[10].fixed = 'right';

const data = generateData(columns, 1000);

columns[3].children = [columns[11], columns[12]];
columns[3].align = 'center';

columns.length = 11;

const Demo = () => {
  const [step, setStep] = useState(2);

  type RequiredTableProps = Required<TableProps<unknown>>;

  const getRowClassName = useCallback<Exclude<RequiredTableProps['rowClassName'], string>>(
    ({ index }) => `row-${index}`,
    [],
  );

  const getRowHeight = useCallback<Exclude<RequiredTableProps['rowHeight'], number>>(
    (rowData, index) => {
      return (index % 10) * step + 32;
    },
    [step],
  );
  return (
    <div>
      <h2>动态行高</h2>
      <div>设置步进值</div>
      <InputNumber value={step} onChange={(val) => setStep(val)} />
      <Table
        rowClassName={getRowClassName}
        // expandedRowRender={(record) => <p>extra: {record.a}</p>}
        // expandedRowClassName={(record, i) => `ex-row-${i}`}
        dataSource={data}
        className="table"
        columns={columns}
        width={700}
        height={400}
        bordered
        rowHeight={getRowHeight}
      />
    </div>
  );
};

export default Demo;
