import React, { useState, useCallback } from 'react';
import { Table, TableProps } from '@qtrade/qtui';
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

  const contextMenu = React.useMemo<TableProps<any>['contextMenu']>(() => {
    return {
      menu: ({ rowData }) => {
        const menu = [
          {
            content: '修改',
            key: 'modify',
          },
          {
            content: '复制',
            key: 'copy',
          },
          {
            key: 'delete',
            getProps: () => ({ disabled: false }), // 右键删除disable判断条件修改
            render: () => {
              const deleteText = '删除';

              return deleteText;
            },
          },
          {
            content: '备注',
            key: 'remark',
          },
          {
            key: 'stopBid',
            getProps: () => ({
              disabled: true,
            }),
            render: () => {
              const text = '截标';

              return text;
            },
          },
          {
            content: '推迟发行',
            key: 'delayIssue',
            getProps: () => ({
              disabled: false,
            }),
          },
          {
            content: '取消发行',
            key: 'cancelIssue',
            getProps: () => ({
              disabled: true,
            }),
          },
          {
            content: '发行失败',
            key: 'issueFail',
            getProps: () => ({
              disabled: false,
            }),
          },
        ];

        return menu;
      },
      onClick: (key, rowData) => {
        console.log('liujie log:', { key, rowData });
      },
    };
  }, []);

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
        contextMenu={contextMenu}
        bordered
        enableHorizontalVirtual
      />
    </div>
  );
};

export default Demo;
