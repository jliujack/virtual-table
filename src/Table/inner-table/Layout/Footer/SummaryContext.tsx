import * as React from 'react';

import { ColumnType, StickyOffsets } from '../../interface';

// ====================== Footer ======================
export type FlattenColumns<RecordType> = readonly (ColumnType<RecordType> & {
  scrollbar?: boolean;
})[];

const SummaryContext = React.createContext<{
  stickyOffsets?: StickyOffsets;
  scrollColumnIndex?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flattenColumns?: FlattenColumns<any>;
}>({});

export default SummaryContext;
