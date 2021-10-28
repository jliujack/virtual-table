import * as React from 'react';

export interface ScrollContextProps {
  scrollLeft: number;
}

// @ts-ignore
const ScrollContext = React.createContext<ScrollContextProps>(null);

export default ScrollContext;
