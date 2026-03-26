'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number; // pull distance to trigger refresh (px)
}

interface UsePullToRefreshReturn {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  pullY: number;       // current pull distance (0 ~ threshold)
  progress: number;   // 0 ~ 1
  refreshing: boolean;
}

export function usePullToRefresh({ onRefresh, threshold = 70 }: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const scrollRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const pullYRef = useRef(0);
  const isPullingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const el = scrollRef.current;
    if (!el || el.scrollTop > 0) return;
    startYRef.current = e.touches[0].clientY;
    isPullingRef.current = true;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPullingRef.current) return;
    const el = scrollRef.current;
    if (!el || el.scrollTop > 0) {
      isPullingRef.current = false;
      setPullY(0);
      return;
    }
    const dy = e.touches[0].clientY - startYRef.current;
    if (dy <= 0) {
      setPullY(0);
      return;
    }
    // Rubber-band: slow down pull beyond threshold
    const clamped = Math.min(dy * 0.5, threshold);
    pullYRef.current = clamped;
    setPullY(clamped);
    if (clamped > 0) {
      e.preventDefault();
    }
  }, [threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;
    const pulled = pullYRef.current;
    setPullY(0);
    pullYRef.current = 0;
    if (pulled >= threshold * 0.85) {
      setRefreshing(true);
      try {
        await onRefreshRef.current();
      } finally {
        setRefreshing(false);
      }
    }
  }, [threshold]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    scrollRef,
    pullY,
    progress: Math.min(pullY / threshold, 1),
    refreshing,
  };
}
