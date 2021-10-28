export const INTERNAL_COL_DEFINE = 'RC_TABLE_INTERNAL_COL_DEFINE';

/**
 * Returns only data- and aria- key/value pairs
 * @param {object} props
 */
export function getDataAndAriaProps(props: object) {
  /* eslint-disable no-param-reassign */
  return Object.keys(props).reduce((memo: Record<string, unknown>, key) => {
    if (key.substr(0, 5) === 'data-' || key.substr(0, 5) === 'aria-') {
      // @ts-ignore
      memo[key] = props[key];
    }
    return memo;
  }, {});
  /* eslint-enable */
}
