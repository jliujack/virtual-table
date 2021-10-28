import { ColumnsType } from 'components/Table';
import { Key, DataIndex } from '../interface';

const INTERNAL_KEY_PREFIX = 'RC_TABLE_KEY';

function toArray<T>(arr: T | readonly T[]): T[] {
  if (arr === undefined || arr === null) {
    return [];
  }
  return (Array.isArray(arr) ? arr : [arr]) as T[];
}

export function getPathValue<ValueType, ObjectType extends Record<string, unknown>>(
  record: ObjectType,
  path: DataIndex,
): ValueType | null {
  // Skip if path is empty
  if (!path && typeof path !== 'number') {
    return record as unknown as ValueType;
  }

  const pathList = toArray(path);

  let current: ValueType | ObjectType = record;

  for (let i = 0; i < pathList.length; i += 1) {
    if (!current) {
      return null;
    }

    const prop = pathList[i];
    // @ts-ignore
    current = current[prop];
  }

  return current as ValueType;
}

interface GetColumnKeyColumn {
  key?: Key;
  dataIndex?: DataIndex;
}

export function getColumnsKey(columns: readonly GetColumnKeyColumn[]) {
  const columnKeys: React.Key[] = [];
  const keys: Record<React.Key, boolean> = {};

  columns.forEach((column) => {
    const { key, dataIndex } = column || {};

    let mergedKey = key || toArray(dataIndex).join('-') || INTERNAL_KEY_PREFIX;
    while (keys[mergedKey]) {
      mergedKey = `${mergedKey}_next`;
    }
    keys[mergedKey] = true;

    columnKeys.push(mergedKey);
  });

  return columnKeys;
}

export function mergeObject<ReturnObject extends object>(
  ...objects: Partial<ReturnObject>[]
): ReturnObject {
  const merged: Partial<ReturnObject> = {};

  /* eslint-disable no-param-reassign */
  function fillProps(obj: object, clone: object) {
    if (clone) {
      Object.keys(clone).forEach((key) => {
        // @ts-ignore
        const value = clone[key];
        if (value && typeof value === 'object') {
          // @ts-ignore
          obj[key] = obj[key] || {};
          // @ts-ignore
          fillProps(obj[key], value);
        } else {
          // @ts-ignore
          obj[key] = value;
        }
      });
    }
  }
  /* eslint-enable */

  objects.forEach((clone) => {
    fillProps(merged, clone);
  });

  return merged as ReturnObject;
}

export function validateValue<T>(val: T) {
  return val !== null && val !== undefined;
}

type Func<Args extends unknown[], R> = (...args: Args) => R;
export function callOrReturn<Args extends unknown[], R = string>(
  funcOrValue: boolean | number | string | Func<Args, R>,
  ...args: Args
) {
  return typeof funcOrValue === 'function' ? funcOrValue(...args) : (funcOrValue as unknown as R);
}

export const getUniqID = () => {
  return Math.random().toString(36).substring(3, 8);
};

export const getColumnsDeeps = (columns?: ColumnsType<unknown>): number => {
  if (!columns) {
    return 0;
  }

  const columnsDeeps = columns.map((col) => {
    return 1 + getColumnsDeeps(col.children! || undefined);
  });

  return Math.max(...columnsDeeps);
};
