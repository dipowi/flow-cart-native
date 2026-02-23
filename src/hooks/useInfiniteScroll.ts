import { useEffect, useRef, useState, useCallback } from "react";

const ITEMS_PER_PAGE = 4;

export function useInfiniteScroll<T>(allItems: T[], pageSize = ITEMS_PER_PAGE) {
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const visibleItems = allItems.slice(0, page * pageSize);
  const hasMore = visibleItems.length < allItems.length;

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "100px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  // Reset page when source data changes
  useEffect(() => {
    setPage(1);
  }, [allItems]);

  return { visibleItems, hasMore, sentinelRef };
}
