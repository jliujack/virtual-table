import React from 'react';
import { Table } from '@qtrade/qtui';
import '../../style';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    defaultSortOrder: 'desc',
    width: 200,
  },
  {
    title: 'School',
    dataIndex: 'school',
    width: 300,
  },
];

const data = [
  {
    key: 0,
    name: '普通',
    age: 31,
    count: 5,
    school: 'QTrade 大学',
    address:
      '西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号0西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号0',
  },
  {
    key: 1,
    name: '新增',
    age: 32,
    count: 1,
    school: 'QTrade 大学',

    address: 'New York No. 1 Lake Park',
  },
  {
    key: 2,
    name: '已中标',
    age: 42,
    count: 3,
    school: 'QTrade 大学',

    address: 'London No. 1 Lake Park',
  },
  {
    key: 3,
    name: '已截标',
    age: 43,
    count: 3,
    school: 'QTrade 大学',

    address: '西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号0',
  },
  {
    key: 4,
    name: '报价过期',
    age: 31,
    count: 2,
    school: 'QTrade 大学',

    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 5,
    name: '完成',
    age: 31,
    count: 3,
    school: 'QTrade 大学',

    address:
      '西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号0西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号0',
  },
  {
    key: 6,
    name: '置顶型高亮',
    age: 43,
    school: 'QTrade 大学',

    count: 4,
    address: '西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号0',
  },
  {
    key: 7,
    name: 'disable',
    age: 31,
    count: 3,
    school: 'QTrade 大学',

    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: 8,
    name: '新增型高亮',
    age: 31,
    school: 'QTrade 大学',

    count: 5,
    address:
      '西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号0西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号0',
  },
  {
    key: 8,
    name: '群聊',
    age: 31,
    count: 5,
    school: 'QTrade 大学',

    address:
      '西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号0西湖区湖底公园1号西湖区湖底公园1号西湖区湖底公园1号0',
  },
];

const Demo = () => (
  <div>
    <h2>rowFlag：行标志</h2>
    <Table
      width={700}
      height={400}
      columns={columns}
      dataSource={data}
      rowFlag={{
        rowNew: ({ rowData, rowIndex }) => {
          return rowIndex === 1;
        },
        rowWinBid: ({ rowData, rowIndex }) => {
          return rowIndex === 2;
        },
        rowStopBid: ({ rowData, rowIndex }) => {
          return rowIndex === 3;
        },
        rowRef: ({ rowData, rowIndex }) => {
          return rowIndex === 4;
        },
        rowComplete: ({ rowData, rowIndex }) => {
          return rowIndex === 5;
        },
        rowTopped: ({ rowData, rowIndex }) => {
          return rowIndex === 6;
        },
        rowDisable: ({ rowData, rowIndex }) => {
          return rowIndex === 7;
        },
        rowHighlight: ({ rowData, rowIndex }) => {
          return rowIndex === 8;
        },
        rowGroupChat: ({ rowData, rowIndex }) => {
          return rowIndex === 9;
        },
      }}
    />
  </div>
);

export default Demo;
