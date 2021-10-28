import * as React from 'react';

import { useTimeoutLock } from './useFrame';

// Used for customize scroll
const EMPTY_SCROLL_TARGET = {};

interface ScrollProps {
  tableSpecialClass: string;
  colTotalWidth: number;
  width: number;
  scrollbarSize: number;
  resetScrollBarSize: (barWidth: number) => void;
  rowTotalHeight: number;
  tableHeight: number;
  /**
   * @description 滚动到底事件触发的计算值
   * @default 50
   */
  onEndReachedThreshold: number;
  /**
   * @description 滚动到底事件的回调
   * @default undefined
   */
  onEndReached?: ({ distanceFromEnd }: { distanceFromEnd: number }) => void;
  verticalScroll: boolean;
  horizonScroll: boolean;
}

export default function useScroll({
  tableSpecialClass,
  colTotalWidth,
  width,
  scrollbarSize,
  resetScrollBarSize,
  rowTotalHeight,
  tableHeight,
  onEndReached,
  onEndReachedThreshold,
  verticalScroll,
  horizonScroll,
}: ScrollProps) {
  const fullTableRef = React.useRef<HTMLDivElement>(null);
  const scrollHeaderRef = React.useRef<HTMLDivElement>(null);
  const scrollBodyRef = React.useRef<HTMLDivElement>(null);
  const scrollSummaryRef = React.useRef<HTMLDivElement>(null);
  // todo: stick处理  Sticky
  const stickyRef = React.useRef<{ setScrollLeft: (left: number) => void }>();
  const [pingedLeft, setPingedLeft] = React.useState(false);
  const [pingedRight, setPingedRight] = React.useState(false);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  // ====================== End Reached ======================
  const scrollTopRef = React.useRef(0);
  const maybeCallOnEndReached = React.useCallback(() => {
    if (!onEndReached || !tableHeight || !rowTotalHeight) return;
    const distanceFromEnd = rowTotalHeight - scrollTopRef.current - tableHeight + scrollbarSize;
    if (
      // todo: 处理上次滚动到的行
      // lastScannedRowIndex >= 0 &&
      distanceFromEnd <= onEndReachedThreshold
      // (this._hasDataChangedSinceEndReached || rowTotalHeight !== this._rowTotalHeight)
    ) {
      onEndReached({ distanceFromEnd });
    }
  }, [tableHeight, onEndReached, onEndReachedThreshold, rowTotalHeight, scrollbarSize]);

  // ===================== Effects ======================
  React.useEffect(() => {
    const table = document.body.querySelector(`.${tableSpecialClass}`) as HTMLElement;
    if (table) {
      const { offsetWidth, clientWidth, offsetHeight, clientHeight } = table;
      const widthBarSize = offsetWidth - clientWidth;
      const heightBarSize = offsetHeight - clientHeight;
      resetScrollBarSize(Math.max(widthBarSize, heightBarSize));
    }
    // 依赖表格宽高和内容宽高变化，用以计算滚动条的大小，兼容设置overflow:overLay
  }, [resetScrollBarSize, tableSpecialClass, verticalScroll, horizonScroll, width, tableHeight]);

  // 该hook用以处理列宽变化时， scrollLeft超出导致虚拟化计算出问题
  React.useEffect(() => {
    if (scrollLeft + width > colTotalWidth) {
      let newScrollLeft = colTotalWidth - width;
      newScrollLeft = newScrollLeft < 0 ? 0 : newScrollLeft;
      if (scrollLeft !== newScrollLeft) {
        setScrollLeft(newScrollLeft);
      }
    }
  }, [colTotalWidth, scrollLeft, width]);

  const [setScrollTarget, getScrollTarget] = useTimeoutLock<HTMLElement>();

  function forceScroll(
    scrollLeftParam: number,
    target?: HTMLDivElement | ((left: number) => void) | null,
  ) {
    if (!target) {
      return;
    }
    if (typeof target === 'function') {
      target(scrollLeftParam);
    } else if (target.scrollLeft !== scrollLeftParam) {
      // eslint-disable-next-line no-param-reassign
      target.scrollLeft = scrollLeftParam;
    }
  }

  const onScroll = React.useCallback(
    ({
      currentTarget,
      scrollLeft: scrollLeftParam,
      scrollTop,
    }: {
      currentTarget: HTMLElement;
      scrollLeft?: number;
      scrollTop?: number;
    }) => {
      const mergedScrollLeft =
        typeof scrollLeftParam === 'number' ? scrollLeftParam : currentTarget.scrollLeft;
      if (typeof mergedScrollLeft !== 'number') {
        return;
      }
      setScrollLeft(mergedScrollLeft);
      const compareTarget = currentTarget || EMPTY_SCROLL_TARGET;
      if (!getScrollTarget() || getScrollTarget() === compareTarget) {
        setScrollTarget(compareTarget);

        forceScroll(mergedScrollLeft, scrollHeaderRef.current);
        forceScroll(mergedScrollLeft, scrollBodyRef.current);
        forceScroll(mergedScrollLeft, scrollSummaryRef.current);
        forceScroll(mergedScrollLeft, stickyRef.current?.setScrollLeft);
      }

      if (currentTarget) {
        setPingedLeft(mergedScrollLeft > 0);
        setPingedRight(mergedScrollLeft < colTotalWidth - width);
      }

      if (typeof scrollTop === 'number') {
        scrollTopRef.current = scrollTop;
        maybeCallOnEndReached();
      }
    },
    [colTotalWidth, getScrollTarget, maybeCallOnEndReached, setScrollTarget, width],
  );

  const refs = {
    fullTableRef,
    scrollHeaderRef,
    scrollBodyRef,
    scrollSummaryRef,
    stickyRef,
  };

  return {
    refs,
    pingedLeft,
    pingedRight,
    scrollLeft,
    onScroll,
  };
}
