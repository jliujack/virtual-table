import * as React from "react";
import { FixedInfo } from "../utils/fixUtil";

export interface TableContextProps {
  // Table context
  prefixCls: string;

  scrollbarSize: number;

  fixedInfoList: readonly FixedInfo[];

  isSticky: boolean;
}

const TableContext = React.createContext<TableContextProps>(null);

export default TableContext;
