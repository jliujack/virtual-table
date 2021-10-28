import { StickyOffsets, FixedType } from '../interface';

export interface FixedInfo {
  fixLeft: number | false;
  fixRight: number | false;
  lastFixLeft: boolean;
  firstFixRight: boolean;
  lastFixRight: boolean;

  isSticky: boolean;
}

export function getCellFixedInfo(
  colStart: number,
  colEnd: number,
  columns: readonly { fixed?: FixedType }[],
  stickyOffsets: StickyOffsets,
): FixedInfo {
  const startColumn = columns[colStart] || {};
  const endColumn = columns[colEnd] || {};

  let fixLeft: number | false = false;
  let fixRight: number | false = false;

  if (startColumn.fixed === 'left') {
    fixLeft = stickyOffsets.left[colStart];
  } else if (endColumn.fixed === 'right') {
    fixRight = stickyOffsets.right[colEnd];
  }

  let lastFixLeft: boolean = false;
  let firstFixRight: boolean = false;
  let lastFixRight: boolean = false;

  const nextColumn = columns[colEnd + 1];
  const prevColumn = columns[colStart - 1];

  if (fixLeft !== false) {
    const nextFixLeft = nextColumn && nextColumn.fixed === 'left';
    lastFixLeft = !nextFixLeft;
  } else if (fixRight !== false) {
    const prevFixRight = prevColumn && prevColumn.fixed === 'right';
    firstFixRight = !prevFixRight;
    lastFixRight = !nextColumn;
  }

  return {
    fixLeft,
    fixRight,
    lastFixLeft,
    firstFixRight,
    lastFixRight,
    isSticky: !!stickyOffsets.isSticky,
  };
}
