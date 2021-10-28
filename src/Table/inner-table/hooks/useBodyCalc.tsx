import * as React from 'react';

import type { GetRowKey, RowHeight } from '../interface';

type IsScrollProps<RecordType> = {
  data: readonly { record: RecordType; indent: number }[];
  colTotalWidth: number;
  width: number;
  height: number;
  rowHeight: RowHeight<RecordType>;
  scrollbarSize: number;
  getRowKey: GetRowKey<RecordType>;
};

/** Get is Header fixed(vertical scroll), horizonScroll, table body width , body height */
export default function useBodyCalc<RecordType>({
  data,
  colTotalWidth,
  width,
  height,
  rowHeight,
  scrollbarSize,
  getRowKey,
}: IsScrollProps<RecordType>) {
  // ====================== Row Height ======================
  const [heightMap, setHeightMap] = React.useState<Record<React.Key, number>>({});
  const relyRefs = React.useRef({ data });
  relyRefs.current = { data };
  const getRowHeight = React.useCallback(
    (index: number) => {
      if (typeof rowHeight === 'number') {
        return rowHeight;
      }

      return rowHeight(relyRefs.current.data[index].record, index);
    },
    [rowHeight],
  );
  const getRowWithExpandRowHeight = React.useCallback(
    (index: number) => {
      const rowKey = getRowKey(relyRefs.current.data[index].record);
      return (heightMap[rowKey] || 0) + getRowHeight(index);
    },
    [getRowHeight, getRowKey, heightMap],
  );

  const rowTotalHeight = React.useMemo(() => {
    return data.reduce((res, __, index) => {
      const sum = res + getRowWithExpandRowHeight(index);
      return sum;
    }, 0);
  }, [data, getRowWithExpandRowHeight]);

  let verticalScroll = false;
  let horizonScroll = false;
  const bodyHeight = height;
  if (colTotalWidth > width) {
    // bodyHeight -= scrollbarSize;
    horizonScroll = true;
  }
  if (rowTotalHeight > bodyHeight) {
    verticalScroll = true;
  }

  const dataRef = React.useRef(data);
  dataRef.current = data;
  const setRowHeight = React.useCallback(
    (rowIndex: number, extraHeight: number) => {
      setHeightMap((prev) => {
        const newHeightMap = { ...prev };
        const rowKey = getRowKey(dataRef.current[rowIndex].record);
        if (extraHeight === 0 && !newHeightMap[rowKey]) {
          return prev;
        }
        if (newHeightMap[rowKey] !== extraHeight) {
          newHeightMap[rowKey] = extraHeight;
        }

        return newHeightMap;
      });
    },
    [getRowKey],
  );

  return {
    verticalScroll,
    horizonScroll,
    bodyHeight,
    getRowHeight,
    getRowWithExpandRowHeight,
    setRowHeight,
    rowTotalHeight,
  };
}
