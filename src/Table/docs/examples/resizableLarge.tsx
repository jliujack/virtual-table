import React, { useState } from 'react';
import { Table } from '@qtrade/qtui';
import { generateColumns, generateData } from './utils';
import '../../style';

const initColumns = generateColumns(30).map((col) => ({ ...col, resizable: true }));
initColumns[0].fixed = 'left';
initColumns[0].align = 'center';
initColumns[0].render = ({ cellData, rowIndex }) => ({
  props: { colSpan: 2, rowSpan: rowIndex % 2 ? 0 : 2 },
  children: <span>{cellData}</span>,
});
initColumns[1].fixed = 'left';
initColumns[10].fixed = 'right';

const data = generateData(initColumns, 1000);

initColumns[3].children = [initColumns[11], initColumns[12]];
initColumns[3].align = 'center';
initColumns[3].resizable = false;

initColumns.length = 15;
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
      <div>表格宽度小于所有列的宽度和</div>
      <div>列可拖动的最小宽度设为80， 默认100， 最大宽度不可设置，默认1000</div>
      <Table
        width={700}
        height={400}
        columns={columns}
        dataSource={data}
        onChange={onChange}
        onColumnResize={handleColumnResize}
        minColumnWidth={80}
        rowSelection={{}}
      />
    </div>
  );
};

export default Demo;
