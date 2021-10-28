import * as React from 'react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

import type {
  ColumnsType,
  ColumnType,
  ColumnTitleProps,
  ColumnGroupType,
  ResizableConfig,
} from '../interface';
import { renderColumnTitle, getColumnKey } from '../util';

interface AdditionalProps {
  width: number;
  onResize: ResizableConfig['onColumnResize'];
}

function ResizableWithState(props: {
  children: (resizing: boolean, setResizing: (val: boolean) => void) => React.ReactNode;
}): React.ReactElement {
  const [resizing, setResizing] = React.useState(false);
  return props.children(resizing, setResizing) as React.ReactElement;
}

function injectResizer<RecordType>(
  prefixCls: string,
  columns: ColumnsType<RecordType>,
  options: {
    minColumnWidth: number;
    onColumnResize: ResizableConfig['onColumnResize'];
  },
): ColumnsType<RecordType> {
  return (columns || []).map((column, index) => {
    let newColumn: ColumnsType<RecordType>[number] = column;
    const { minColumnWidth, onColumnResize } = options;
    const columnKey = getColumnKey(column, `column-${index}`);
    // 如果列未变化 保持其引用并返回， 这时候我们认为子列不会变化
    const lastColumnInfo = injectResizer.lastColumnsKeyMap.get(columnKey);
    if (lastColumnInfo && column === lastColumnInfo.before) {
      return lastColumnInfo.after as ColumnGroupType<RecordType> | ColumnType<RecordType>;
    }
    if (newColumn.resizable) {
      newColumn = {
        ...newColumn,
        title: (renderProps: ColumnTitleProps<RecordType> & AdditionalProps) => {
          const innerResizeHandler = (_: unknown, { size }: { size: { width: number } }) => {
            if (typeof onColumnResize === 'function') {
              onColumnResize({ [columnKey]: size.width });
            }
          };
          return (
            <ResizableWithState>
              {(resizing, setResizing) => (
                <Resizable
                  width={column.width!}
                  height={0}
                  onResize={innerResizeHandler}
                  onResizeStart={() => setResizing(true)}
                  onResizeStop={() => setResizing(false)}
                  handle={
                    <div className={`${prefixCls}-resize-bar ${resizing ? 'is-resizing' : ''}`} />
                  }
                  minConstraints={[minColumnWidth, 10]}
                  maxConstraints={[1000, 200]}
                >
                  <div style={{ width: '100%', position: 'static' }}>
                    {renderColumnTitle(column.title, renderProps)}
                  </div>
                </Resizable>
              )}
            </ResizableWithState>
          );
        },
      };
    }

    if ((newColumn as ColumnGroupType<RecordType>).children) {
      const childCols = (newColumn as ColumnGroupType<RecordType>).children;
      (newColumn as ColumnGroupType<RecordType>).children = injectResizer(prefixCls, childCols, {
        ...options,
        onColumnResize,
      });
    }
    injectResizer.lastColumnsKeyMap.set(columnKey, { before: column, after: newColumn });

    return newColumn;
  });
}

injectResizer.lastColumnsKeyMap = new Map<React.Key, { before: unknown; after: unknown }>();

export default function useResizable<RecordType>({
  prefixCls,
  onColumnResize,
  minColumnWidth,
}: ResizableConfig) {
  const options = React.useMemo(
    () => ({
      minColumnWidth,
      onColumnResize,
    }),
    [minColumnWidth, onColumnResize],
  );

  const transformColumns = React.useCallback(
    (innerColumns: ColumnsType<RecordType>) => {
      return injectResizer(prefixCls, innerColumns, options);
    },
    [options, prefixCls],
  );
  return [transformColumns];
}
