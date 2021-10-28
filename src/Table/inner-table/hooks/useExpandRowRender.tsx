import * as React from 'react';
import { useElementSize } from './useElementSize';

export interface ExpandRowRenderProps {
  expanded?: boolean;
  getRenderNode: (ref: (instance: HTMLElement | null) => void) => React.ReactNode;
  resetHeight: (height: number) => void;
  rowSupportExpand: boolean;
}

export default function useExpandRowRender({
  expanded,
  getRenderNode,
  resetHeight,
  rowSupportExpand,
}: ExpandRowRenderProps) {
  const ref = useElementSize((size, __, elem) => {
    if (elem) {
      resetHeight(size?.height ?? 0);
    } else {
      resetHeight(0);
    }
  });

  const expandedNode = React.useMemo(() => {
    if (expanded && rowSupportExpand) {
      return getRenderNode(ref);
    }

    return null;
  }, [expanded, getRenderNode, ref, rowSupportExpand]);

  React.useEffect(() => {
    if (!expanded) {
      resetHeight(0);
    }
  }, [expanded, resetHeight]);

  return {
    node: expandedNode,
  };
}
