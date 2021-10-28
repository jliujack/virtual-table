import React, { useState } from 'react';
import { Table } from '@qtrade/qtui';
import '../../style';

interface RowInterface {
  key: string;
  name: string;
  age: number;
  address: string;
  school: string;
}

interface RowEventInterface {
  rowData: RowInterface;
  rowIndex: number;
  rowKey: string;
  event: React.MouseEvent;
  hovered?: boolean;
}

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

  const rowEventHandlers = React.useMemo(() => {
    return {
      onClick: ({ rowData, rowIndex, rowKey, event }: RowEventInterface) => {
        console.log('row click', rowData, rowIndex, rowKey, event);
      },
      onDoubleClick: ({ rowData, rowIndex, rowKey, event }: RowEventInterface) => {
        console.log('double click', rowData, rowIndex, rowKey, event);
      },
    };
  }, []);

  return (
    <div>
      <h2>1.0 版本 API，已废弃，使用 onRow </h2>
      <Table
        width={700}
        height={400}
        columns={columns}
        dataSource={data}
        onColumnResize={handleColumnResize}
        rowEventHandlers={rowEventHandlers}
        onRowSelect={({ rowData, rowIndex, rowKey, event }: RowEventInterface) => {
          console.log('row select', rowData, rowIndex, rowKey, event);
        }}
        onRowHover={({ rowData, rowIndex, rowKey, event, hovered }: RowEventInterface) => {
          console.log('row hover', rowData, rowIndex, rowKey, event, hovered);
        }}
      />
    </div>
  );
};

export default Demo;
