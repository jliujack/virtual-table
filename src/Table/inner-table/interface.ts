import type * as React from 'react';
import { Align } from 'react-window';

export type Key = React.Key;

export type FixedType = 'left' | 'right' | boolean;

export type DefaultRecordType = Record<string, unknown>;

export type ScrollType = { x?: number | true | string; y?: number | string };

type RowHeightFunc<T> = (record: T, index: number) => number;
export type RowHeight<T> = number | RowHeightFunc<T>;

// ==================== Row =====================
export type RowClassName<RecordType> = ({
  rowData,
  index,
  indent,
}: {
  rowData: RecordType;
  index: number;
  indent: number;
}) => string;

// =================== Column ===================
export interface CellType<RecordType> {
  key?: Key;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  column?: ColumnsType<RecordType>[number];
  colSpan?: number;
  rowSpan?: number;

  /** Only used for table header */
  hasSubColumns?: boolean;
  colStart?: number;
  colEnd?: number;
  isLastCell?: boolean;
}

export interface RenderedCell<RecordType> {
  props: CellType<RecordType>;
  children?: React.ReactNode;
}

export type DataIndex = string | number | readonly (string | number)[];

export type CellEllipsisType = { showTitle?: boolean } | boolean;

interface ColumnSharedType<RecordType> {
  title?: React.ReactNode;
  key?: Key;
  className?: string;
  fixed?: FixedType;
  /**
   * @deprecated
   * @description please use fixed instead frozen
   */
  frozen?: FixedType;
  onHeaderCell?: GetComponentProps<ColumnsType<RecordType>[number]>;
  ellipsis?: CellEllipsisType;
  align?: AlignType;
}

export interface ColumnGroupType<RecordType> extends ColumnSharedType<RecordType> {
  children: ColumnsType<RecordType>;
  left?: number;
  width?: number;
}

export type AlignType = 'left' | 'center' | 'right';

/** cell render props */
export interface CellRenderProps<RecordType> {
  isControlledEdit?: boolean;
  cellData: unknown;
  // columns?: ColumnType<RecordType>[];
  column?: ColumnType<RecordType>;
  // columnIndex?: number;
  dataIndex?: DataIndex;
  rowData: RecordType;
  rowIndex: number;
  rowAbsoluteIndex?: number;
  highLightText?: string;
  rowClass?: string;
}

export type IgnoreFunc<T> = (arg: {
  cellData: unknown;
  column: ColumnType<T>;
  rowData: T;
  rowIndex: number;
  rowAbsoluteIndex: number;
}) => boolean;

export interface ColumnType<RecordType> extends Omit<ColumnSharedType<RecordType>, 'className'> {
  /** column merge */
  colSpan?: number;
  dataIndex?: DataIndex;
  render?: (cellProps: CellRenderProps<RecordType>) => React.ReactNode | RenderedCell<RecordType>;
  editRender?: (value: EditRenderParam<RecordType>) => React.ReactNode;
  shouldCellUpdate?: (record: RecordType, prevRecord: RecordType) => boolean;
  rowSpan?: number;
  width?: number;
  onCell?: GetComponentProps<RecordType>;
  /** used for horizontal virtual render  */
  left?: number;
  next?: ColumnType<RecordType>;
  /** @default true */
  autoSize?: boolean;
  /**
   * @description 是否列宽可拖动
   * @default false
   */
  resizable?: boolean;
  ignoreDisable?: boolean | IgnoreFunc<RecordType>;
  ignoreStopBid?: boolean | IgnoreFunc<RecordType>;
  ignoreRef?: boolean | IgnoreFunc<RecordType>;
  className?: string | ((props: { rowData: RecordType }) => string | undefined);
}

export type ColumnsType<RecordType = unknown> = (
  | ColumnGroupType<RecordType>
  | ColumnType<RecordType>
)[];

export type GetRowKey<RecordType> = (record: RecordType, index?: number) => Key;

// ================= Fix Column =================
export interface StickyOffsets {
  left: readonly number[];
  right: readonly number[];
  isSticky?: boolean;
}

// ================= Customized =================
export type GetComponentProps<DataType> = (
  data: DataType,
  index?: number,
) => React.HTMLAttributes<HTMLElement>;

// =================== Expand ===================
export type ExpandableType = false | 'row' | 'nest';

export type ExpandedRowRender<ValueType> = (
  record: ValueType,
  index: number,
  indent: number,
  expanded: boolean,
) => React.ReactNode;

export interface RenderExpandIconProps<RecordType> {
  prefixCls: string;
  expanded: boolean;
  record: RecordType;
  expandable: boolean;
  onExpand: TriggerEventHandler<RecordType>;
}

export type RenderExpandIcon<RecordType> = (
  props: RenderExpandIconProps<RecordType>,
) => React.ReactNode;

export interface ExpandableConfig<RecordType> {
  expandedRowKeys?: readonly Key[];
  defaultExpandedRowKeys?: readonly Key[];
  expandedRowRender?: ExpandedRowRender<RecordType>;
  expandRowByClick?: boolean;
  expandIcon?: RenderExpandIcon<RecordType>;
  onExpand?: (expanded: boolean, record: RecordType, newExpandedRowKeys: Key[]) => void;
  onExpandedRowsChange?: (expandedKeys: readonly Key[]) => void;
  defaultExpandAllRows?: boolean;
  indentSize?: number;
  expandIconColumnIndex?: number;
  expandedRowClassName?: RowClassName<RecordType>;
  childrenColumnName?: string;
  rowExpandable?: (record: RecordType) => boolean;
  columnWidth?: number;
  fixed?: FixedType;
}

// =================== Render ===================
export type PanelRender<RecordType> = (data: readonly RecordType[]) => React.ReactNode;

// =================== Events ===================
export type TriggerEventHandler<RecordType> = (
  record: RecordType,
  event: React.MouseEvent<HTMLElement>,
) => void;

// =================== Sticky ===================
export interface TableSticky {
  offsetHeader?: number;
  offsetSummary?: number;
  offsetScroll?: number;
  getContainer?: () => Window | HTMLElement;
}

// =================== editRender ===============
export interface EditRenderParam<RecordType> {
  defaultValue: any;
  cellData: any;
  saveRef: (node: HTMLElement) => void;
  rowData: RecordType;
  handleChange: (value: any) => void;
  exitEdit: () => void;
}

// ====================== row event type ======================
export interface RowEventProps<T> {
  rowData: T;
  rowIndex: number;
  rowKey: Key;
  event: React.MouseEvent;
  hovered?: boolean;
}

export interface RowEventHandlersProps<T> {
  [key: string]: (data: RowEventProps<T>) => void;
}

export interface RowFlagDataProps<RecordType = DefaultRecordType> {
  columns?: ColumnType<RecordType>;
  rowData: RecordType;
  rowIndex: number;
}

export interface RowFlagProps {
  [key: string]: (data: RowFlagDataProps) => boolean;
}

// ====================== 暴露出去的方法 ======================
// 对外暴露的表格控制方法
export type TableFunc = {
  scrollToTop: (scrollTop: number) => void;
  scrollToRow: (rowIndex: number, align: Align) => void;
};
