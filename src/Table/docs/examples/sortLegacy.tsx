import React from 'react';
import { Table } from '@qtrade/qtui';
import '../../style';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
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
    sorter: true,
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

const Demo = () => {
  const [sortedInfo, setSortedInfo] = React.useState([]);

  const onChange = React.useCallback((pagination, filters, sorter, extra) => {
    setSortedInfo(sorter);
  }, []);

  return (
    <div>
      <h2>排序</h2>
      <b>建议通过antd形式实现排序功能。</b>
      <p>
        使用sortedInfo属性+onChange实现受控排序，sortedInfo为数组时是多列排序，否则为单列排序
        <br />
        Tip:使用该模式的多列排序会无视列的multiple配置，根据用户点击顺序为优先级来进行多列排序）
      </p>
      <Table
        width={700}
        height={400}
        columns={columns}
        sortedInfo={sortedInfo}
        dataSource={data}
        onChange={onChange}
      />
    </div>
  );
};

export default Demo;
