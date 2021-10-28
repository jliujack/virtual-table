/* eslint-disable max-classes-per-file */
import React from 'react';
import { render, mount } from 'enzyme';
import Table, { TableProps, ColumnType } from '../index';

describe('Table.sort', () => {
  const sorterFn = (a, b) => a.name[0].charCodeAt() - b.name[0].charCodeAt();

  const column = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: sorterFn,
  };

  const data = [
    { key: 0, name: 'Jack' },
    { key: 1, name: 'Lucy' },
    { key: 2, name: 'Tom' },
    { key: 3, name: 'Jerry' },
  ];

  type Record = typeof data[number];

  function createTable(tableProps: TableProps<Record> = {}, columnProps: ColumnType<Record> = {}) {
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

  function renderedNames(wrapper) {
    return wrapper.find('BodyRow').map((row) => row.props().record.name);
  }

  it('renders sort icon correctly', () => {
    const wrapper = render(createTable());
    expect(wrapper.find('.QT-table-thead')).toMatchSnapshot();
  });

  it('default sort order asc', () => {
    const wrapper = mount(
      createTable(
        {},
        {
          defaultSortOrder: 'asc',
        },
      ),
    );

    expect(renderedNames(wrapper)).toEqual(['Jack', 'Jerry', 'Lucy', 'Tom']);
  });
  it('default sort order desc', () => {
    const wrapper = mount(
      createTable(
        {},
        {
          defaultSortOrder: 'desc',
        },
      ),
    );

    expect(renderedNames(wrapper)).toEqual(['Tom', 'Lucy', 'Jack', 'Jerry']);
  });

  it('sort records', () => {
    const wrapper = mount(createTable());

    // asc
    wrapper.find('.QT-table-column-sorters').simulate('click');
    expect(renderedNames(wrapper)).toEqual(['Jack', 'Jerry', 'Lucy', 'Tom']);

    // desc
    wrapper.find('.QT-table-column-sorters').simulate('click');
    expect(renderedNames(wrapper)).toEqual(['Tom', 'Lucy', 'Jack', 'Jerry']);
  });

  describe('can be controlled by sortOrder', () => {
    it('single', () => {
      const wrapper = mount(
        createTable({
          columns: [{ ...column, sortOrder: 'asc' }],
        }),
      );
      expect(renderedNames(wrapper)).toEqual(['Jack', 'Jerry', 'Lucy', 'Tom']);
    });

    it('invalidate mix with single & multiple sorters', () => {
      const wrapper = mount(
        createTable({
          columns: [
            {
              title: 'Name',
              dataIndex: 'name',
              sortOrder: 'asc',
              sorter: {
                multiple: 1,
              },
            },
            {
              title: 'Name',
              dataIndex: 'name',
              sortOrder: 'asc',
              sorter: {},
            },
          ],
        }),
      );

      expect(renderedNames(wrapper)).toEqual(['Jack', 'Lucy', 'Tom', 'Jerry']);
    });
  });

  it('provides sortOrder in the sorterFn', () => {
    let actualSortOrder;
    mount(
      createTable(
        {},
        {
          sortOrder: 'asc',
          sorter: (a, b, sortOrder) => {
            actualSortOrder = sortOrder;
            return sorterFn(a, b);
          },
        },
      ),
    );
    expect(actualSortOrder).toEqual('asc');
  });

  it('can update column sortOrder', () => {
    const wrapper = mount(
      createTable({
        columns: [column],
      }),
    );
    expect(renderedNames(wrapper)).toEqual(['Jack', 'Lucy', 'Tom', 'Jerry']);
    wrapper.setProps({
      columns: [{ ...column, sortOrder: 'asc' }],
    });
    wrapper.update();
    expect(renderedNames(wrapper)).toEqual(['Jack', 'Jerry', 'Lucy', 'Tom']);
  });

  it('fires change event', () => {
    const handleChange = jest.fn();
    const wrapper = mount(createTable({ onChange: handleChange }));

    // ascent
    wrapper.find('.QT-table-column-sorters').simulate('click');
    const sorter1 = handleChange.mock.calls[0][2];
    expect(sorter1.column.dataIndex).toBe('name');
    expect(sorter1.order).toBe('asc');
    expect(sorter1.field).toBe('name');
    expect(sorter1.columnKey).toBe('name');

    wrapper.find('.QT-table-column-sorters').simulate('click');
    const sorter2 = handleChange.mock.calls[1][2];
    expect(sorter2.column.dataIndex).toBe('name');
    expect(sorter2.order).toBe('desc');
    expect(sorter2.field).toBe('name');
    expect(sorter2.columnKey).toBe('name');

    wrapper.find('.QT-table-column-sorters').simulate('click');
    const sorter3 = handleChange.mock.calls[2][2];
    expect(sorter3.column).toEqual({});
    expect(sorter3.order).toBe(undefined);
    expect(sorter3.field).toBe('name');
    expect(sorter3.columnKey).toBe('name');
  });

  // it('hover header show sorter tooltip', () => {
  //   // tooltip has delay
  //   jest.useFakeTimers();
  //   const wrapper = mount(createTable({}));
  //   // default show sorter tooltip
  //   wrapper.find('.QT-table-column-sorters').simulate('mouseenter');
  //   jest.runAllTimers();
  //   wrapper.update();
  //   expect(wrapper.find('.ant-tooltip-open').length).toBeTruthy();
  //   wrapper.find('.QT-table-column-sorters').simulate('mouseout');

  //   // set table props showSorterTooltip is false
  //   wrapper.setProps({ showSorterTooltip: false });
  //   jest.runAllTimers();
  //   wrapper.update();
  //   expect(wrapper.find('.ant-tooltip-open')).toHaveLength(0);
  //   // set table props showSorterTooltip is false, column showSorterTooltip is true
  //   wrapper.setProps({
  //     showSorterTooltip: false,
  //     columns: [{ ...column, showSorterTooltip: true }],
  //   });
  //   wrapper.find('.QT-table-column-sorters').simulate('mouseenter');
  //   jest.runAllTimers();
  //   wrapper.update();
  //   expect(wrapper.find('.ant-tooltip-open').length).toBeTruthy();
  //   wrapper.find('.QT-table-column-sorters').simulate('mouseout');
  //   // set table props showSorterTooltip is true, column showSorterTooltip is false
  //   wrapper.setProps({
  //     showSorterTooltip: true,
  //     columns: [{ ...column, showSorterTooltip: false }],
  //   });
  //   jest.runAllTimers();
  //   wrapper.update();
  //   expect(wrapper.find('.ant-tooltip-open')).toHaveLength(0);
  // });

  it('should show correct tooltip when showSorterTooltip is an object', () => {
    // basically copied from 'hover header show sorter tooltip'
    jest.useFakeTimers();
    const wrapper = mount(
      createTable({ showSorterTooltip: { placement: 'bottom', title: 'static title' } }),
    );
    wrapper.find('.QT-table-column-sorters').simulate('mouseenter');
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find('.ant-tooltip-open').length).toBeTruthy();
    wrapper.find('.QT-table-column-sorters').simulate('mouseout');

    wrapper.setProps({ showSorterTooltip: false });
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find('.ant-tooltip-open')).toHaveLength(0);
    wrapper.setProps({
      showSorterTooltip: false,
      columns: [{ ...column, showSorterTooltip: true }],
    });
    wrapper.find('.QT-table-column-sorters').simulate('mouseenter');
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find('.ant-tooltip-open').length).toBeTruthy();
    wrapper.find('.QT-table-column-sorters').simulate('mouseout');
    wrapper.setProps({
      showSorterTooltip: true,
      columns: [{ ...column, showSorterTooltip: false }],
    });
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find('.ant-tooltip-open')).toHaveLength(0);
  });

  it('works with grouping columns in controlled mode', () => {
    const columns = [
      {
        title: 'group',
        key: 'group',
        children: [
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: sorterFn,
            sortOrder: 'desc',
          },
          {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
          },
        ],
      },
    ];
    const testData = [
      { key: 0, name: 'Jack', age: 11 },
      { key: 1, name: 'Lucy', age: 20 },
      { key: 2, name: 'Tom', age: 21 },
      { key: 3, name: 'Jerry', age: 22 },
    ];
    const wrapper = mount(<Table columns={columns} dataSource={testData} />);

    expect(renderedNames(wrapper)).toEqual(['Tom', 'Lucy', 'Jack', 'Jerry']);
  });

  // https://github.com/ant-design/ant-design/issues/11246#issuecomment-405009167
  it('Allow column title as render props with sortOrder argument', () => {
    const title = ({ sortOrder }) => <div className="custom-title">{sortOrder}</div>;
    const columns = [
      {
        title,
        key: 'group',
        sorter: true,
      },
    ];
    const testData = [
      { key: 0, name: 'Jack', age: 11 },
      { key: 1, name: 'Lucy', age: 20 },
      { key: 2, name: 'Tom', age: 21 },
      { key: 3, name: 'Jerry', age: 22 },
    ];
    const wrapper = mount(<Table columns={columns} dataSource={testData} />);
    expect(wrapper.find('.custom-title').text()).toEqual('');
    wrapper.find('.QT-table-column-sorters').simulate('click');
    expect(wrapper.find('.custom-title').text()).toEqual('asc');
    wrapper.find('.QT-table-column-sorters').simulate('click');
    expect(wrapper.find('.custom-title').text()).toEqual('desc');
  });

  // https://github.com/ant-design/ant-design/pull/12264#discussion_r218053034
  it('should sort from beginning state when toggle from different columns', () => {
    const columns = [
      {
        title: 'name',
        dataIndex: 'name',
        sorter: true,
      },
      {
        title: 'age',
        dataIndex: 'age',
        sorter: true,
      },
    ];
    const testData = [
      { key: 0, name: 'Jack', age: 11 },
      { key: 1, name: 'Lucy', age: 20 },
      { key: 2, name: 'Tom', age: 21 },
      { key: 3, name: 'Jerry', age: 22 },
    ];
    const wrapper = mount(<Table columns={columns} dataSource={testData} />);

    const getNameColumn = () => wrapper.find('.QT-table-column-has-sorters').at(0);
    const getAgeColumn = () => wrapper.find('.QT-table-column-has-sorters').at(1);
    const getNameIcon = (name) => getNameColumn().find(`.QT-table-column-sorter-${name}`).first();
    const getAgeIcon = (name) => getAgeColumn().find(`.QT-table-column-sorter-${name}`).first();

    // sort name
    getNameColumn().simulate('click');
    expect(getNameIcon('up').hasClass('active')).toBeTruthy();
    expect(getAgeIcon('up').hasClass('active')).toBeFalsy();

    // sort age
    getAgeColumn().simulate('click');
    expect(getNameIcon('up').hasClass('active')).toBeFalsy();
    expect(getAgeIcon('up').hasClass('active')).toBeTruthy();
  });

  it('should first sort by desc, then asc, then cancel sort', () => {
    const wrapper = mount(
      createTable({
        sortDirections: ['desc', 'asc'],
      }),
    );

    // desc
    wrapper.find('.QT-table-column-sorters').simulate('click');
    expect(renderedNames(wrapper)).toEqual(['Tom', 'Lucy', 'Jack', 'Jerry']);

    // asc
    wrapper.find('.QT-table-column-sorters').simulate('click');
    expect(renderedNames(wrapper)).toEqual(['Jack', 'Jerry', 'Lucy', 'Tom']);

    // cancel sort
    wrapper.find('.QT-table-column-sorters').simulate('click');
    expect(renderedNames(wrapper)).toEqual(['Jack', 'Lucy', 'Tom', 'Jerry']);
  });

  it('should first sort by desc, then cancel sort', () => {
    const wrapper = mount(
      createTable({
        sortDirections: ['desc'],
      }),
    );

    // desc
    wrapper.find('.QT-table-column-sorters').simulate('click');
    expect(renderedNames(wrapper)).toEqual(['Tom', 'Lucy', 'Jack', 'Jerry']);

    // cancel sort
    wrapper.find('.QT-table-column-sorters').simulate('click');
    expect(renderedNames(wrapper)).toEqual(['Jack', 'Lucy', 'Tom', 'Jerry']);
  });

  it('should first sort by desc, then cancel sort. (column prop)', () => {
    const wrapper = mount(
      createTable(
        {},
        {
          sortDirections: ['desc'],
        },
      ),
    );

    // desc
    wrapper.find('.QT-table-column-sorters').simulate('click');
    expect(renderedNames(wrapper)).toEqual(['Tom', 'Lucy', 'Jack', 'Jerry']);

    // cancel sort
    wrapper.find('.QT-table-column-sorters').simulate('click');
    expect(renderedNames(wrapper)).toEqual(['Jack', 'Lucy', 'Tom', 'Jerry']);
  });

  it('should support onHeaderCell in sort column', () => {
    const onClick = jest.fn();
    const wrapper = mount(
      <Table columns={[{ title: 'title', onHeaderCell: () => ({ onClick }), sorter: true }]} />,
    );
    wrapper.find('.QT-table-column-title').simulate('click');
    expect(onClick).toHaveBeenCalled();
  });

  it('could sort data with children', () => {
    const wrapper = mount(
      createTable(
        {
          expandable: {
            defaultExpandAllRows: true,
          },
          dataSource: [
            {
              key: '1',
              name: 'Brown',
              children: [
                {
                  key: '2',
                  name: 'Zoe',
                },
                {
                  key: '3',
                  name: 'Mike',
                  children: [
                    {
                      key: '3-1',
                      name: 'Petter',
                    },
                    {
                      key: '3-2',
                      name: 'Alex',
                    },
                  ],
                },
                {
                  key: '4',
                  name: 'Green',
                },
              ],
            },
          ],
        },
        {
          defaultSortOrder: 'asc',
        },
      ),
    );

    expect(renderedNames(wrapper)).toEqual(['Brown', 'Green', 'Mike', 'Alex', 'Petter', 'Zoe']);
  });

  // https://github.com/ant-design/ant-design/issues/19443
  it('should not being inifinite loop when using Table.Column with sortOrder', () => {
    class Demo extends React.Component {
      componentDidMount() {
        this.setState({});
      }

      render() {
        return (
          <Table dataSource={[]}>
            <Table.Column title="Age" dataIndex="age" sorter sortOrder="asc" key="age" />
          </Table>
        );
      }
    }
    expect(() => {
      mount(<Demo />);
    }).not.toThrow();
  });

  it('should support defaultOrder in Column', () => {
    const wrapper = mount(
      <Table dataSource={[{ key: '1', age: 1 }]} specialClass="table-sort-default-order">
        <Table.Column title="Age" dataIndex="age" sorter defaultSortOrder="asc" key="age" />
      </Table>,
    );
    expect(wrapper.render()).toMatchSnapshot();
  });

  // https://github.com/ant-design/ant-design/issues/20096
  it('invalidate sorter should not display sorter button', () => {
    const wrapper = mount(
      <Table
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: false,
          },
          {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
            sorter: null,
          },
          {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            sorter: undefined,
          },
        ]}
      />,
    );

    expect(wrapper.find('.QT-table-column-sorter-inner')).toHaveLength(0);
  });

  // https://github.com/ant-design/ant-design/issues/21193
  it('table with sugar column', () => {
    const wrapper = mount(
      <Table>
        <Table.Column
          title="Chinese Score"
          dataIndex="chinese"
          sorter={{
            compare: (a, b) => a.chinese - b.chinese,
            multiple: 3,
          }}
        />
        <Table.Column
          title="Math Score"
          dataIndex="math"
          sorter={{
            compare: (a, b) => a.math - b.math,
            multiple: 2,
          }}
        />
      </Table>,
    );

    wrapper.find('.QT-table-column-title').first().simulate('click');

    expect(wrapper.find('.QT-table-column-sort')).toBeTruthy();
  });

  it('surger should support sorterOrder', () => {
    const wrapper = mount(
      <Table>
        <Table.Column key="name" title="Name" dataIndex="name" sortOrder="asc" sorter />
      </Table>,
    );

    expect(wrapper.find('.QT-table-column-sorter-up').last().hasClass('active')).toBeTruthy();
    expect(wrapper.find('.QT-table-column-sorter-down').last().hasClass('active')).toBeFalsy();
  });

  it('controlled multiple group', () => {
    const groupColumns = [
      {
        title: 'Math Score',
        dataIndex: 'math1',
        sortOrder: 'asc',
        sorter: { multiple: 1 },
        children: [
          {
            title: 'math',
            dataIndex: 'math',
          },
        ],
      },
      {
        title: 'English Score',
        dataIndex: 'english',
        sortOrder: 'desc',
        sorter: { multiple: 2 },
      },
    ];

    const groupData = [
      {
        key: '1',
        name: 'John Brown',
        chinese: 98,
        math: 60,
        english: 70,
      },
    ];

    const wrapper = mount(<Table columns={groupColumns} data={groupData} />);
    wrapper.update();
    expect(
      wrapper
        .find('.QT-table-column-sorter-full')
        .first()
        .find('.QT-table-column-sorter-up')
        .first()
        .hasClass('active'),
    ).toBeTruthy();
    expect(
      wrapper
        .find('.QT-table-column-sorter-full')
        .last()
        .find('.QT-table-column-sorter-down')
        .first()
        .hasClass('active'),
    ).toBeTruthy();
  });

  // it('onChange with correct sorter for multiple', () => {
  //   const groupColumns = [
  //     {
  //       title: 'Math Score',
  //       dataIndex: 'math',
  //       sorter: { multiple: 1 },
  //     },
  //     {
  //       title: 'English Score',
  //       dataIndex: 'english',
  //       sorter: { multiple: 2 },
  //     },
  //   ];

  //   const groupData = [
  //     {
  //       key: '1',
  //       name: 'John Brown',
  //       chinese: 98,
  //       math: 60,
  //       english: 70,
  //     },
  //   ];

  //   const onChange = jest.fn();
  //   const wrapper = mount(<Table columns={groupColumns} data={groupData} onChange={onChange} />);

  //   function clickToMatchExpect(index, sorter) {
  //     wrapper.find('.QT-table-column-sorters').at(index).simulate('click');

  //     expect(onChange).toHaveBeenCalledWith(
  //       expect.anything(),
  //       expect.anything(),
  //       expect.objectContaining(sorter),
  //       expect.anything(),
  //     );

  //     onChange.mockReset();
  //   }

  //   // First
  //   clickToMatchExpect(0, { field: 'math', order: 'asc' });
  //   clickToMatchExpect(0, { field: 'math', order: 'desc' });
  //   clickToMatchExpect(0, { field: 'math', order: undefined });

  //   // Last
  //   clickToMatchExpect(1, { field: 'english', order: 'asc' });
  //   clickToMatchExpect(1, { field: 'english', order: 'desc' });
  //   clickToMatchExpect(1, { field: 'english', order: undefined });
  // });
});
