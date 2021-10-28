import React, { useState, useEffect } from 'react';
import { Table, TableNext } from '@qtrade/qtui';
import { Switch, Button, Table as QtTable } from 'antd';
import '../../style';

import { generateColumns, generateData } from '../examples/utils';

const columns = generateColumns(30);
// columns[0].frozen = 'left';
// columns[0].align = 'center';
// columns[1].frozen = 'left';
// columns[10].frozen = 'right';

const initData = generateData(columns, 100);
// for (let index = 0; index < initData.length; index += 1) {
//   const element = initData[index];
//   element.children = generateData(columns, 10, `row-key-children-${index}-`);
// }
columns.length = 10;

let row = 0;
let col = 0;
const Demo = () => {
  const [data, setData] = useState(initData);
  const [isDataChange, setIsDataChange] = useState(false);

  useEffect(() => {
    if (!isDataChange) {
      return;
    }
    const changeData = () => {
      setData((pre) => {
        const newData = [...pre];
        newData[row] = { ...newData[row], [`col-${col}`]: 'changed' };
        if (col > 9) {
          row += 1;
          col = 0;
        } else {
          col += 1;
        }

        return newData;
      });
    };

    const timer = window.setInterval(changeData, 1);

    // eslint-disable-next-line consistent-return
    return () => {
      clearInterval(timer);
    };
  }, [isDataChange]);
  return (
    <div>
      <h4>操作：</h4>
      <div>
        数据依次修改：
        <Switch checked={isDataChange} onChange={(checked) => setIsDataChange(checked)} />
        <Button
          onClick={() => {
            setData((pre) => [...pre.slice(0, 2)]);
          }}
        >
          修改数据长度
        </Button>
        <Button
          onClick={() => {
            setData((pre) => [...pre]);
          }}
        >
          修改数据
        </Button>
      </div>
      <h2>新表格</h2>
      <Table
        rowClassName={(record, i) => `row-${i}`}
        // expandedRowRender={(record) => <p>extra: {record.a}</p>}
        // expandedRowClassName={(record, i) => `ex-row-${i}`}
        dataSource={data}
        className="table"
        columns={columns}
        width={700}
        height={400}
        bordered
        // expandable={{
        //   defaultExpandAllRows: true,
        // }}
        // onRowsRendered={() => {
        //   console.log('liujie log:', 'rowRendered');
        // }}
      />
      <h2>旧表格</h2>
      <TableNext
        rowClassName={(record, i) => `row-${i}`}
        rowKey="key"
        // expandedRowRender={(record) => <p>extra: {record.a}</p>}
        // expandedRowClassName={(record, i) => `ex-row-${i}`}
        dataSource={data}
        className="table"
        columns={columns}
        width={700}
        height={400}
        bordered
      />
      {/* <h2>antd</h2>
      <QtTable
        rowClassName={(record, i) => `row-${i}`}
        rowKey="key"
        // expandedRowRender={(record) => <p>extra: {record.a}</p>}
        // expandedRowClassName={(record, i) => `ex-row-${i}`}
        dataSource={data}
        className="table"
        pagination={false}
        columns={columns}
        width={700}
        height={400}
        bordered
      /> */}
    </div>
  );
};

export default Demo;
