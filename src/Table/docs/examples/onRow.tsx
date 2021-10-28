import React, { useState } from 'react';
import { Table } from '@qtrade/qtui';
import '../../style';

const initColumns = [
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
    title: 'Address',
    dataIndex: 'address',
    width: 100,
  },
  {
    title: 'School',
    dataIndex: 'school',
    width: 300,
  },
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

const Demo = () => {
  const [columns, setColumns] = useState(initColumns);

  const handleColumnResize = React.useCallback((newColumns) => {
    setColumns(newColumns);
  }, []);

  const onRow = React.useCallback((record, index) => {
    return {
      onClick: (event: React.MouseEvent) => {
        console.log('row click', record, index, event);
      },
      onDoubleClick: (event: React.MouseEvent) => {
        console.log('double click', record, index, event);
      },
    };
  }, []);

  return (
    <div>
      <h2>行事件</h2>
      <Table
        width={700}
        height={400}
        columns={columns}
        dataSource={data}
        onColumnResize={handleColumnResize}
        onRow={onRow}
      />
    </div>
  );
};

export default Demo;
