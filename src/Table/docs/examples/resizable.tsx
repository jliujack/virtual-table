import React, { useState } from 'react';
import { Table } from '@qtrade/qtui';
import '../../style';

const initColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    width: 200,
    resizable: true,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    defaultSortOrder: 'desc',
    resizable: true,
    width: 200,
    sorter: (a, b) => a.age - b.age,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    width: 100,
  },
  // {
  //   title: 'School',
  //   dataIndex: 'school',
  //   width: 300,
  // },
];

const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    school: 'central south',
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    school: 'central south',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    school: 'central south',
  },
  {
    key: '4',
    name: 'Jim Red',
    age: 32,
    address: 'London No. 2 Lake Park',
    school: 'central south',
  },
];

function onChange(pagination, filters, sorter, extra) {
  console.log('params', pagination, filters, sorter, extra);
}

const Demo = () => {
  const [columns, setColumns] = useState(initColumns);

  const handleColumnResize = React.useCallback((newColumns) => {
    setColumns(newColumns);
  }, []);

  return (
    <div>
      <h2>列宽可拖动</h2>
      <div>总长度是否可变取决于列宽总长度是否大于给定的表格width</div>
      <Table
        width={700}
        height={400}
        columns={columns}
        dataSource={data}
        onChange={onChange}
        onColumnResize={handleColumnResize}
      />
    </div>
  );
};

export default Demo;
