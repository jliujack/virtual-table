import * as React from 'react';
import {
  RowHeight,
  ColumnType,
  ColumnsType,
  RenderExpandIcon,
  ExpandableType,
  RowClassName,
  TriggerEventHandler,
  ExpandedRowRender,
  GetComponentProps,
  RowEventHandlersProps,
  RowEventProps,
  RowFlagProps,
} from '../interface';

export interface BodyContextProps<RecordType> {
  rowClassName: string | RowClassName<RecordType>;
  expandedRowClassName?: RowClassName<RecordType>;

  columns: ColumnsType<RecordType>;
  flattenColumns: readonly ColumnType<RecordType>[];

  componentWidth: number;
  verticalScroll: boolean;
  fixColumn: boolean;
  horizonScroll: boolean;

  indentSize: number;
  expandableType?: ExpandableType;
  expandRowByClick?: boolean;
  expandedRowRender?: ExpandedRowRender<RecordType>;
  expandIcon: RenderExpandIcon<RecordType>;
  onTriggerExpand: TriggerEventHandler<RecordType>;
  expandIconColumnIndex?: number;
  width: number;
  height: number;
  rowHeight: RowHeight<RecordType>;
  getRowHeight: (index: number) => number;
  headerHeight: number;
  bodyWidth: number;
  bodyHeight: number;
  colTotalWidth: number;
  rowTotalHeight: number;
  onRow?: GetComponentProps<RecordType>;
  rowEventHandlers?: RowEventHandlersProps<RecordType>;
  onRowHover: (data: RowEventProps<RecordType>) => void;
  onRowSelect: (data: RowEventProps<RecordType>) => void;
  rowFlag?: RowFlagProps;
}

// @ts-ignore
const BodyContext = React.createContext<BodyContextProps<any>>(null);

export default BodyContext;
