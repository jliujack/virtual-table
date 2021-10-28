import React, { useState } from 'react';
import { Table } from '@qtrade/qtui';
import { Button, Input } from 'antd';
import '../../style';

const generateColumns = (len: number): any => {
  return new Array(len).fill(0).map((_item, idx) => ({
    title: `col-${idx}`,
    dataIndex: `col-${idx}`,
    className: `col-${idx}`,
    key: `col-${idx}`,
    width: 100,
    fixed: false,
  }));
};

const generateData = (columns, len) => {
  return new Array(len).fill(0).map((item, idx) => {
    const obj = { key: `row-key-${idx}` };
    columns.forEach((col, idx2) => {
      obj[col.dataIndex] = `row-${idx}-col-${idx2}`;
    });

    return obj;
  });
};

const columns = generateColumns(10);
const data = generateData(columns, 200);

// columns[0].frozen = true;

export default () => {
  const [editingKey, setEditingKey] = useState('');
  return (
    <div>
      <h2>受控编辑</h2>
      <React.Profiler
        id="table"
        onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime, interaction) => {
          console.log(id, phase, actualDuration, baseDuration, startTime, commitTime, interaction);
        }}
      >
        <Table
          rowKey="index"
          rowClassName={(record, i) => `row-${i}`}
          dataSource={[
            {
              editinput: '1111',
              index: '1',
            },
            {
              editinput: '2222',
              index: '2',
            },
          ]}
          className="table"
          columns={[
            {
              title: '编辑输入框',
              dataIndex: 'editinput',
              width: 100,
              render: () => {
                return <span>测试span</span>;
              },
              editRender: () => {
                return <Input style={{ color: 'black' }} />;
              },
            },
            {
              title: '操作',
              dataIndex: 'action',
              width: 100,
              render: ({ cellData, rowData }) => {
                return (
                  <Button
                    style={{ color: 'black' }}
                    onClick={() => {
                      setEditingKey(rowData.index);
                    }}
                  >
                    编辑
                  </Button>
                );
              },
            },
          ]}
          editingKey={editingKey}
          width={700}
          height={400}
          bordered
        />
      </React.Profiler>
      <h2>非受控编辑</h2>
      <Table
        rowKey="index"
        dataSource={[
          {
            editinput: '1111',
            index: '1',
          },
          {
            editinput: '2222',
            index: '2',
          },
        ]}
        className="table"
        columns={[
          {
            title: '编辑输入框',
            dataIndex: 'editinput',
            width: 100,
            render: () => {
              return <span>测试span</span>;
            },
            editRender: ({ exitEdit }) => {
              return <Input onBlur={exitEdit} style={{ color: 'black' }} />;
            },
          },
        ]}
        width={700}
        height={400}
        bordered
      />
    </div>
  );
};
