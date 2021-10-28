import React from 'react';
import { Table } from '@qtrade/qtui';
import '../../style';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    filters: [
      {
        text: 'Joe',
        value: 'Joe',
      },
      {
        text: 'Jim',
        value: 'Jim',
      },
      {
        text: 'Submenu',
        value: 'Submenu',
        children: [
          {
            text: 'Green',
            value: 'Green',
          },
          {
            text: 'Black',
            value: 'Black',
          },
        ],
      },
    ],
    sorter: (a, b) => a.name.length - b.name.length,
    sortDirections: ['desc'],
  },
  {
    title: 'Age',
    dataIndex: 'age',
    defaultSortOrder: 'desc',
    sorter: (a, b) => a.age - b.age,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    filters: [
      {
        text: 'London',
        value: 'London',
      },
      {
        text: 'New York',
        value: 'New York',
      },
    ],
  },
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '4',
    name: 'Jim Red',
    age: 32,
    address: 'London No. 2 Lake Park',
  },
];

function onChange(pagination, filters, sorter, extra) {
  console.log('params', pagination, filters, sorter, extra);
}

const Demo = () => (
  <div>
    <h2>排序</h2>
    <div>可以使用antd的方式控制排序，另外兼容实现了sortedInfo受控prop(优先级更高)</div>
    <Table
      width={700}
      height={400}
      columns={columns}
      dataSource={data}
      onChange={onChange}
      showSorterTooltip
    />
  </div>
);

export default Demo;
