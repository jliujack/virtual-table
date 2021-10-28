import React from 'react';
import { render, mount } from 'enzyme';
import Table, { TableProps } from '../index';

describe('Table.bordered', () => {
  const column = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  };

  const data = [
    { key: 0, name: 'Jack' },
    { key: 1, name: 'Lucy' },
    { key: 2, name: 'Tom' },
    { key: 3, name: 'Jerry' },
  ];

  type Record = typeof data[number];

  function createTable(tableProps: TableProps<Record> = {}, columnProps = {}) {
    return (
      <Table
        columns={[
          {
            ...column,
            ...columnProps,
          },
        ]}
        dataSource={data}
        specialClass="bordered-spec"
        {...tableProps}
      />
    );
  }

  it('renders border correctly', () => {
    const wrapper = render(createTable());
    expect(wrapper.find('.QT-table-bordered')).toMatchSnapshot();
  });

  it('react bordered prop change correctly', () => {
    const wrapper = mount<TableProps<Record>>(createTable({ bordered: false }));
    expect(wrapper.find('.QT-table-bordered')).toHaveLength(0);
    wrapper.setProps({ bordered: true });
    expect(wrapper.find('.QT-table-bordered')).toBeTruthy();
  });
});
