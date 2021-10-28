import React from 'react';
import { Table, TableProps, TableRefInfo } from '@qtrade/qtui';
import { Button, Input } from 'antd';
import '../../style';

import { generateColumns, generateData } from './utils';

const { Search } = Input;
const columns = generateColumns(30);
columns[0].fixed = 'left';
columns[0].align = 'center';
columns[0].render = ({ cellData }) => ({
  props: { colSpan: 2 },
  children: <span>{cellData}</span>,
});
columns[1].fixed = 'left';
columns[10].fixed = 'right';

const data = generateData(columns, 1000);

columns[3].children = [columns[11], columns[12]];
columns[3].align = 'center';

columns.length = 11;

const Demo = () => {
  const ref = React.useRef<TableRefInfo>({});
  const backTop = React.useCallback(() => {
    ref.current.scrollToTop(0);
  }, []);
  const toItem = React.useCallback((rowIndex) => {
    ref.current.scrollToRow(+rowIndex, 'auto');
  }, []);
  type p = Parameters<Exclude<TableProps<unknown>['onRowsRendered'], undefined>>[number];
  const [renderInfo, setRenderInfo] = React.useState<p | string>('');
  return (
    <div>
      <h2>表格的行为</h2>
      <p>为了部分场景，我们提供了表格的部分行为能力如下</p>
      <Button onClick={backTop}>回到顶部</Button>
      <br />
      <Search
        placeholder="input row index"
        allowClear
        enterButton="到指定行"
        size="large"
        onSearch={toItem}
        style={{ width: 400, margin: '12px 0' }}
      />

      <Table
        // expandedRowRender={(record) => <p>extra: {record.a}</p>}
        // expandedRowClassName={(record, i) => `ex-row-${i}`}
        dataSource={data}
        className="table"
        columns={columns}
        width={700}
        height={400}
        bordered
        forwardedRef={ref}
        onRowsRendered={(renderInfo1) => {
          // eslint-disable-next-line no-param-reassign
          renderInfo1.startRow = { tip: '内容太多 已被重置' };
          // eslint-disable-next-line no-param-reassign
          renderInfo1.stopRow = { tip: '内容太多 已被重置' };
          setRenderInfo(renderInfo1);
          // 这里可以做很多事情， 如数据的预加载， 具体案例可看表格预加载实现。
        }}
      />

      <p>
        <b>渲染区域信息：</b>
        {JSON.stringify(renderInfo)}
      </p>
    </div>
  );
};

export default Demo;
