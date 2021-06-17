import * as React from "react";
import classNames from "classnames";
import { VariableSizeGrid as Grid } from "react-window";
import TableContext from "../context/TableContext";
import BodyContext from "../context/BodyContext";
import type {
  GetRowKey,
  Key,
  GetComponentProps,
  DefaultRecordType,
} from "../interface";
import useFlattenRecords from "../hooks/useFlattenRecords";

export interface BodyProps<RecordType> {
  data: readonly RecordType[];
  getRowKey: GetRowKey<RecordType>;
  measureColumnWidth: boolean;
  expandedKeys: Set<Key>;
  onRow: GetComponentProps<RecordType>;
  rowExpandable: (record: RecordType) => boolean;
  emptyNode: React.ReactNode;
  childrenColumnName: string;
  onScroll: ({
    currentTarget,
    scrollLeft,
  }: {
    currentTarget: HTMLElement;
    scrollLeft?: number;
  }) => void;
}

function Body<RecordType extends DefaultRecordType>(
  {
    data,
    getRowKey,
    measureColumnWidth,
    expandedKeys,
    onRow,
    rowExpandable,
    emptyNode,
    childrenColumnName,
    onScroll,
  }: BodyProps<RecordType>,
  ref: React.Ref<any>
) {
  const { scrollbarSize } = React.useContext(TableContext);

  const { flattenColumns } = React.useContext(BodyContext);

  const flattenData: { record: RecordType; indent: number }[] =
    useFlattenRecords<RecordType>(
      data,
      childrenColumnName,
      expandedKeys,
      getRowKey
    );

  const gridRef = React.useRef<any>();
  const [connectObject] = React.useState<any>(() => {
    const obj = {};
    Object.defineProperty(obj, "scrollLeft", {
      get: () => null,
      set: (scrollLeft: number) => {
        if (gridRef.current) {
          gridRef.current.scrollTo({ scrollLeft });
        }
      },
    });

    return obj;
  });
  React.useImperativeHandle(ref, () => connectObject);

  return React.useMemo(() => {
    return (
      <Grid
        ref={gridRef}
        className='virtual-grid'
        columnCount={flattenColumns.length}
        columnWidth={(index) => {
          const { width = 0 } = flattenColumns[index];
          const numWidth = +width;
          return index === flattenColumns.length - 1
            ? numWidth - scrollbarSize - 1
            : numWidth;
        }}
        height={300}
        rowCount={flattenData.length}
        rowHeight={() => 50}
        width={301}
        onScroll={({ scrollLeft }) => {
          onScroll({ currentTarget: connectObject, scrollLeft });
        }}
      >
        {({ columnIndex, rowIndex, style }) => (
          <div
            className={classNames("virtual-cell", {
              "virtual-cell-last": columnIndex === flattenColumns.length - 1,
            })}
            style={style}
          >
            r{rowIndex}, c{columnIndex}
          </div>
        )}
      </Grid>
    );
  }, [
    connectObject,
    flattenColumns,
    flattenData.length,
    onScroll,
    scrollbarSize,
  ]);
}

const RefBody = React.forwardRef<any, BodyProps<any>>(Body);
RefBody.displayName = "Body";

export default RefBody;
