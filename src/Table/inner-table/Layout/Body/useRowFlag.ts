import { useMemo } from 'react';
import { RowFlagProps, DefaultRecordType } from '../../interface';
import { callOrReturn } from '../../utils/valueUtil';
import { getPrefixClass } from '../../utils/className';

export default ({
  rowFlag,
  rowData,
  rowIndex,
  prefixCls,
}: {
  rowFlag?: RowFlagProps;
  rowData: DefaultRecordType;
  rowIndex: number;
  prefixCls: string;
}) => {
  const className = useMemo(() => {
    const {
      rowDisable,
      rowNew,
      rowWinBid,
      rowStopBid,
      rowFreeze,
      rowRef,
      rowGroupChat,
      rowHighlight,
      rowComplete,
      rowTip,
      rowTopped,
      rowDelayIssue,
      rowCancelIssue,
      rowIssueFail,
      rowHadIpo,
      rowHadAllocation,
      rowWaitAllocation,
      rowModify,
      rowWithdraw,
      rowReject,
      rowError,
    } = rowFlag || {};
    return {
      [getPrefixClass(prefixCls, 'row--disabled')]: callOrReturn(rowDisable, { rowData, rowIndex }),
      [getPrefixClass(prefixCls, 'row--new')]: callOrReturn(rowNew, { rowData, rowIndex }),
      [getPrefixClass(prefixCls, 'row--highlight')]: callOrReturn(rowHighlight, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--win-bid')]: callOrReturn(rowWinBid, { rowData, rowIndex }),
      [getPrefixClass(prefixCls, 'row--stop-bid')]: callOrReturn(rowStopBid, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--freeze')]: callOrReturn(rowFreeze, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--ref')]: callOrReturn(rowRef, { rowData, rowIndex }),
      [getPrefixClass(prefixCls, 'row--complete')]: callOrReturn(rowComplete, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--tip')]: callOrReturn(rowTip, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--topped')]: callOrReturn(rowTopped, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--group-chat')]: callOrReturn(rowGroupChat, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--delay-issue')]: callOrReturn(rowDelayIssue, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--cancel-issue')]: callOrReturn(rowCancelIssue, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--issue-fail')]: callOrReturn(rowIssueFail, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--had-ipo')]: callOrReturn(rowHadIpo, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--had-allocation')]: callOrReturn(rowHadAllocation, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--modify')]: callOrReturn(rowModify, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--wait-allocation')]: callOrReturn(rowWaitAllocation, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--modify')]: callOrReturn(rowModify, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--withdraw')]: callOrReturn(rowWithdraw, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--reject')]: callOrReturn(rowReject, {
        rowData,
        rowIndex,
      }),
      [getPrefixClass(prefixCls, 'row--error')]: callOrReturn(rowError, {
        rowData,
        rowIndex,
      }),
    };
  }, [prefixCls, rowData, rowFlag, rowIndex]);

  return className;
};
