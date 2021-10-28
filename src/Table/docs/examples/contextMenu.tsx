import React, { useState, useCallback } from 'react';
import { Table } from '@qtrade/qtui';
import { generateColumns, generateData } from './utils';
import '../../style';

const columns = generateColumns(20);

const data = generateData(columns, 1000);

function onChange(pagination, filters, sorter, extra) {
  console.log('params', pagination, filters, sorter, extra);
}

const Demo = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const onSelectChange = useCallback((keys) => {
    setSelectedRowKeys(keys);
  }, []);
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div>
      <h2>右键菜单</h2>
      <Table
        width={700}
        height={400}
        columns={columns}
        rowSelection={rowSelection}
        showSelectionColumnProps={{ frozen: 'left', align: 'center' }}
        dataSource={data}
        onChange={onChange}
        contextMenu={{
          menu: [
            {
              key: 'copy',
              content: '复制',
            },
          ],
          onClick: (key, record) => {
            switch (key) {
              case 'copy':
                console.log('liujie log:', 'copy', record);
                break;
              default:
                console.log('liujie log:', 'error');
            }
          },
        }}
        bordered
        enableHorizontalVirtual
      />
    </div>
  );
};

export default Demo;
