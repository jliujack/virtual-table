import React from 'react';
import { Table } from '@qtrade/qtui';

import { generateColumns, generateData } from './utils';
import '../../style';

const columns = generateColumns(30);
columns[0].fixed = 'left';
columns[0].align = 'center';
columns[0].render = ({ rowIndex }) => ({
  props: {
    colSpan: 2,
    style: { zIndex: 2 },
    rowSpan: rowIndex % 5 === 0 ? 5 : 0,
  },
  children: (
    <div
      style={{
        wordBreak: 'break-all',
        whiteSpace: 'break-spaces',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 8,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        height: '100%',
        padding: '8px 0',
      }}
    >
      我绝不承认两颗真心的结合 有任何障碍。这样的爱不是真爱 若是遇有变节的机会就改变，
      或是被强势剥离就屈服：哦，那不是爱！爱是坚定的烽火， 凝视着狂涛而不动摇；
      爱是向导迷航船只的明星， 高度可测，实价无量。 爱不受时光影响，即使红唇粉颊
      终会被岁月的镰刀砍伐； 爱不随分分秒秒、日日月月改变， 爱不畏时间磨炼，直到末日尽头。
      如果有人可证明我所解不实， 我从未写过，而无人曾真爱过
    </div>
  ),
});
columns[1].fixed = 'left';
columns[1].render = () => ({
  props: { colSpan: 0 },
  children: null,
});
columns[10].fixed = 'right';

const data = generateData(columns, 1000);

columns[3].children = [columns[11], columns[12]];
columns[3].align = 'center';

columns.length = 11;

const Demo = () => (
  <div>
    <h2>横向虚拟化与固定列</h2>
    <Table
      // expandedRowRender={(record) => <p>extra: {record.a}</p>}
      // expandedRowClassName={(record, i) => `ex-row-${i}`}
      dataSource={data}
      className="table"
      columns={columns}
      width={700}
      height={700}
      bordered
      overscanRowCount={5}
      enableHorizontalVirtual
    />
  </div>
);

export default Demo;
