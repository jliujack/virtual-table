import * as React from 'react';
import TableContext from '../../context/TableContext';
import Summary from './Summary';
import SummaryContext, { FlattenColumns } from './SummaryContext';
import type { StickyOffsets } from '../../interface';

export interface FooterProps<RecordType> {
  children: React.ReactNode;
  stickyOffsets: StickyOffsets;
  flattenColumns: FlattenColumns<RecordType>;
}

function Footer<RecordType>({ children, stickyOffsets, flattenColumns }: FooterProps<RecordType>) {
  const tableContext = React.useContext(TableContext);
  const { prefixCls } = tableContext;

  const lastColumnIndex = flattenColumns.length - 1;
  const scrollColumn = flattenColumns[lastColumnIndex];

  const summaryContext = React.useMemo(
    () => ({
      stickyOffsets,
      flattenColumns,
      scrollColumnIndex: scrollColumn?.scrollbar ? lastColumnIndex : undefined,
    }),
    [scrollColumn, flattenColumns, lastColumnIndex, stickyOffsets],
  );

  return (
    <SummaryContext.Provider value={summaryContext}>
      <tfoot className={`${prefixCls}-summary`}>{children}</tfoot>
    </SummaryContext.Provider>
  );
}

export default Footer;

export const FooterComponents = Summary;
