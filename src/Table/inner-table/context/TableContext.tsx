import * as React from 'react';
import { FixedInfo } from '../utils/fixUtil';

export interface TableContextProps {
  // Table context
  prefixCls: string;

  tableSpecialClass: string;

  scrollbarSize: number;

  fixedInfoMap: Map<React.Key, FixedInfo>;

  enableHorizontalVirtual: boolean | number;

  isSticky: boolean;

  intervalRowBg: boolean;
}

// @ts-ignore
const TableContext = React.createContext<TableContextProps>(null);

export default TableContext;
