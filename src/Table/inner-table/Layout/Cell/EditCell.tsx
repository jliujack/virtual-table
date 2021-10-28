import * as React from 'react';

import type { DataIndex, DefaultRecordType, ColumnType, GetRowKey } from '../../interface';
import { getPathValue } from '../../utils/valueUtil';

interface EditCellProps<RecordType extends DefaultRecordType> {
  record: RecordType;
  dataIndex: DataIndex;
  editRender: ColumnType<RecordType>['editRender'];
  getRowKey: GetRowKey<RecordType>;
  editingKey?: number | string;
}

function EditCell<RecordType extends DefaultRecordType>({
  dataIndex,
  record,
  editRender,
  getRowKey,
  editingKey,
}: EditCellProps<RecordType>) {
  const [editing, setEditing] = React.useState<boolean>(false);
  const [currentValue, setCurrentValue] = React.useState<any>('');

  let showEdit: boolean;
  let input: HTMLElement;

  // 有editingKey为受控编辑
  const isControlledEdit = !!editingKey;

  const cellData = getPathValue<Record<string, unknown> | React.ReactNode, RecordType>(
    record,
    dataIndex,
  );

  React.useEffect(() => {
    setCurrentValue(cellData);
  }, [cellData]);

  // 改行是否正在编辑
  const key = getRowKey(record);
  const isEditingKey = editingKey === key;

  /** 非受控模式方法 * */
  const handleClick = () => {
    setEditing(true);
    setTimeout(() => {
      if (input) {
        input.focus();
      }
    }, 0);
  };

  const exitEdit = () => {
    setEditing(false);
  };

  const handleChange = (value: any) => {
    setCurrentValue(value);
  };
  /** end * */

  const editProps = {
    defaultValue: cellData,
    value: cellData,
    cellData,
    saveRef: (_node: HTMLElement) => {},
    rowData: record,
    handleChange: (_value: any) => {},
    exitEdit: () => {},
  };
  const extraAttributes = {
    onClick: () => {},
  };

  if (isControlledEdit) {
    // 受控模式
    editProps.defaultValue = cellData;
    showEdit = isEditingKey;
  } else {
    showEdit = editing;
    extraAttributes.onClick = handleClick;

    editProps.value = currentValue;
    editProps.handleChange = handleChange;
    // eslint-disable-next-line no-return-assign
    editProps.saveRef = (node) => (input = node);
    editProps.exitEdit = exitEdit;
  }

  const editView = editRender && editRender(editProps);

  return (
    <div className="editCell" {...extraAttributes}>
      {showEdit ? editView : <div>{cellData}</div>}
    </div>
  );
}

export default EditCell;
