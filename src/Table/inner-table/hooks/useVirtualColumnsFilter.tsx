/**
 * Todo:
 *  - handle nest column filter
 *
 *
 * Deprecated:
 *  -
 */

import * as React from 'react';

import TableContext from '../context/TableContext';
import BodyContext from '../context/BodyContext';

export default function useVirtualColumnsFilter(scrollLeft: number) {
  const { enableHorizontalVirtual } = React.useContext(TableContext);
  const { bodyWidth, flattenColumns } = React.useContext(BodyContext);

  // =================== virtual render columns ==================
  const filterColumns = React.useMemo(() => {
    let mergeHorizontalVirtual = 0;
    if (typeof enableHorizontalVirtual === 'number') {
      mergeHorizontalVirtual = enableHorizontalVirtual;
    }

    if (enableHorizontalVirtual) {
      return flattenColumns.filter((column) => {
        const { width = 0, left = 0 } = column;
        if (
          left + width + mergeHorizontalVirtual >= scrollLeft &&
          left - mergeHorizontalVirtual < scrollLeft + bodyWidth
        ) {
          return true;
        }
        if (column.fixed) {
          return true;
        }

        return false;
      });
    }
    return flattenColumns;
  }, [bodyWidth, enableHorizontalVirtual, flattenColumns, scrollLeft]);

  return filterColumns;
}
