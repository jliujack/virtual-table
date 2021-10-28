import * as React from 'react';
import { RowEventHandlersProps, RowEventProps } from '../../interface';

type ElementEventHandlers = Record<string, (event: React.MouseEvent) => void>;

export default function useEventHandler<RecordType>(
  rowEventHandlers: RowEventHandlersProps<RecordType>,
  record: RecordType,
  index: number,
  onRowHover: (data: RowEventProps<RecordType>) => void,
  onRowSelect: (data: RowEventProps<RecordType>) => void,
  rowKey: React.Key,
) {
  const handlers = React.useMemo(() => {
    const eventHandlers: ElementEventHandlers = {};
    const rowData = record;
    const rowIndex = index;
    Object.keys(rowEventHandlers).forEach((eventKey: keyof typeof rowEventHandlers) => {
      const callback = rowEventHandlers[eventKey];
      if (typeof callback === 'function') {
        eventHandlers[eventKey] = (event: React.MouseEvent) => {
          callback({ rowData, rowIndex, rowKey, event });
        };
      }
    });

    if (onRowHover) {
      const mouseEnterHandler = eventHandlers.onMouseEnter;
      eventHandlers.onMouseEnter = (event) => {
        onRowHover({
          hovered: true,
          rowData,
          rowIndex,
          rowKey,
          event,
        });
        if (mouseEnterHandler) {
          mouseEnterHandler(event);
        }
      };

      const mouseLeaveHandler = eventHandlers.onMouseLeave;
      eventHandlers.onMouseLeave = (event) => {
        onRowHover({
          hovered: false,
          rowData,
          rowIndex,
          rowKey,
          event,
        });

        if (mouseLeaveHandler) {
          mouseLeaveHandler(event);
        }
      };
    }

    if (onRowSelect) {
      const onClickHandler = eventHandlers.onClick;
      eventHandlers.onClick = (event) => {
        onRowSelect({
          rowData,
          rowIndex,
          rowKey,
          event,
        });
        if (onClickHandler) {
          onClickHandler(event);
        }
      };
    }

    return eventHandlers;
  }, [rowEventHandlers, record, index, onRowHover, onRowSelect, rowKey]);

  return handlers;
}
