import * as React from 'react';
import uniqueId from 'lodash/uniqueId';

import ContextMenu, { ContextMenuProps } from '../../../ContextMenu/ContextMenu';

export default function useContextMenu(options?: ContextMenuProps['options']) {
  // ====================== Context Menu ======================
  const [contextMenuId] = React.useState(uniqueId());
  const contextMenuNode = React.useMemo(() => {
    if (options) {
      return (
        <ContextMenu
          options={options}
          key={contextMenuId}
          theme="dark"
          contextMenuID={contextMenuId}
        />
      );
    }

    return null;
  }, [options, contextMenuId]);

  return { contextMenuId: options ? contextMenuId : undefined, contextMenuNode };
}
