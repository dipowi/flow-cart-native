import { useEffect, useRef, useState, useCallback } from "react";

export function useInfiniteScroll<T>(allItems: T[], pageSize = 5) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const visibleItems = allItems.slice(0, visibleCount);
  const hasMore = visibleCount < allItems.length;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setVisibleCount(prev => Math.min(prev + pageSize, allItems.length));
  }, [hasMore, pageSize, allItems.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  // Reset when items change
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [allItems, pageSize]);

  return { visibleItems, hasMore, sentinelRef };
}
