import React, { useState, useCallback } from 'react';
import { Table } from '@qtrade/qtui';
import { Button } from 'antd';
import '../../style';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: ({ cellData }) => <a>{cellData}</a>,
  },
  {
    title: 'Cash Assets',
    className: 'column-money',
    dataIndex: 'money',
    align: 'right',
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
];

const initData = [
  {
    key: '1',
    name: 'John Brown',
    money: '￥300,000.00',
    address: 'New York No. 1 Lake Park',
    children: [
      {
        key: '1-1',
        name: 'John jie',
        money: '￥300,000.00',
        address: 'New York No. 1 Lake Park',
      },
      {
        key: '1-2',
        name: 'John fu',
        money: '￥300,000.00',
        address: 'New York No. 1 Lake Park',
      },
      {
        key: '1-3',
        name: 'John feng',
        money: '￥300,000.00',
        address: 'New York No. 1 Lake Park',
      },
    ],
  },
  {
    key: '2',
    name: 'Jim Green',
    money: '￥1,256,000.00',
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '4',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '5',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '6',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '7',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '8',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '9',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '10',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '11',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '12',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '13',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '14',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '15',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '16',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '17',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
  {
    key: '18',
    name: 'Joe Black',
    money: '￥120,000.00',
    address: 'Sidney No. 1 Lake Park',
  },
];

function onChange(pagination, filters, sorter, extra) {
  console.log('params', pagination, filters, sorter, extra);
}

const Demo = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [data, setData] = useState(initData);
  const onSelectChange = useCallback((keys) => {
    setSelectedRowKeys(keys);
  }, []);
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    checkStrictly: false,
  };

  return (
    <div>
      <h2>expand</h2>
      <Button
        onClick={() => {
          setData((pre) => [...pre]);
        }}
      >
        重新渲染
      </Button>
      <Table
        width={700}
        height={400}
        expandable={{
          expandIconColumnIndex: 1,
        }}
        columns={columns}
        rowSelection={rowSelection}
        dataSource={data}
        onChange={onChange}
        bordered
      />
    </div>
  );
};

export default Demo;
