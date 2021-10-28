import * as React from 'react';

import Row from './BodyRow';

import type { GetRowKey, GetComponentProps, DefaultRecordType } from '../../interface';
import BodyContext from '../../context/BodyContext';
import TableContext from '../../context/TableContext';

export interface FixedRowsProps<RecordType> {
  frozenData: readonly RecordType[];
  getRowKey: GetRowKey<RecordType>;
  onRow?: GetComponentProps<RecordType>;
}

function FixedRows<RecordType extends DefaultRecordType>(props: FixedRowsProps<RecordType>) {
  const { frozenData, getRowKey, onRow } = props;
  const { prefixCls } = React.useContext(TableContext);
  const { rowHeight, colTotalWidth, bodyWidth } = React.useContext(BodyContext);
  const width = Math.max(colTotalWidth, bodyWidth);

  return (
    <>
      {frozenData.map((__, rowIndex) => {
        const record = frozenData[rowIndex];
        const key = getRowKey(record, rowIndex);
        return (
          <Row
            className={`${prefixCls}-row-frozen`}
            key={key}
            record={record}
            recordKey={key}
            rowKey={key}
            // @ts-ignore
            onRow={onRow}
            // @ts-ignore
            getRowKey={getRowKey}
            rowExpandable={() => false}
            style={{ height: rowHeight, width, position: 'relative' }}
            index={rowIndex}
          />
        );
      })}
    </>
  );
}

export default FixedRows;
