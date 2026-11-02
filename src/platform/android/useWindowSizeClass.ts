import { useState, useEffect } from 'react';

export type WindowSizeClass = 'compact' | 'medium' | 'expanded';

export interface AdaptiveLayoutInfo {
  width: number;
  height: number;
  sizeClass: WindowSizeClass;
  isCompact: boolean;
  isMedium: boolean;
  isExpanded: boolean;
  isLandscape: boolean;
  isTabletOrFoldable: boolean;
}

function calculateLayoutInfo(): AdaptiveLayoutInfo {
  if (typeof window === 'undefined') {
    return {
      width: 390,
      height: 844,
      sizeClass: 'compact',
      isCompact: true,
      isMedium: false,
      isExpanded: false,
      isLandscape: false,
      isTabletOrFoldable: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isLandscape = width > height;

  let sizeClass: WindowSizeClass = 'compact';
  if (width >= 840) {
    sizeClass = 'expanded';
  } else if (width >= 600) {
    sizeClass = 'medium';
  }

  return {
    width,
    height,
    sizeClass,
    isCompact: sizeClass === 'compact',
    isMedium: sizeClass === 'medium',
    isExpanded: sizeClass === 'expanded',
    isLandscape,
    isTabletOrFoldable: sizeClass !== 'compact',
  };
}

export function useWindowSizeClass(): AdaptiveLayoutInfo {
  const [layoutInfo, setLayoutInfo] = useState<AdaptiveLayoutInfo>(calculateLayoutInfo);

  useEffect(() => {
    const handleResize = () => {
      setLayoutInfo(calculateLayoutInfo());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return layoutInfo;
}
