import { useRef, useState, useCallback } from 'react';

const THRESHOLD = 70;

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const startY = useRef(0);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<HTMLElement | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((scrollRef.current?.scrollTop ?? 0) !== 0) return;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if ((scrollRef.current?.scrollTop ?? 0) !== 0) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setPullY(Math.min(delta, THRESHOLD * 1.5));
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (pullY >= THRESHOLD) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPullY(0);
  }, [pullY, onRefresh]);

  const progress = Math.min(pullY / THRESHOLD, 1);

  return { scrollRef, pullY, progress, refreshing, onTouchStart, onTouchMove, onTouchEnd };
}
