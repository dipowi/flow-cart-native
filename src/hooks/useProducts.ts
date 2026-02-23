import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProductCount, fetchProductById, fetchDiscoveryQueue, fetchStoreSettings, fetchProducts } from "@/data/products";
import { useState, useCallback, useMemo, useRef } from "react";
import type { Product } from "@/data/products";

const PAGE_SIZE = 4;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * True server-side pagination hook.
 * - First load fetches only 4 products (.range(0,3))
 * - Subsequent loads APPEND via .range(from, to)
 * - Never replaces existing items in state
 */
export function useProductFeed() {
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const fetchingRef = useRef(false);

  const countQuery = useQuery({
    queryKey: ["products-count"],
    queryFn: fetchProductCount,
    staleTime: 60_000,
  });

  // Initial load - only first 4 products
  const initialQuery = useQuery({
    queryKey: ["products-initial"],
    queryFn: async () => {
      const data = await fetchProducts(0, PAGE_SIZE - 1);
      setItems(data);
      setPage(1);
      return data;
    },
    staleTime: 30_000,
  });

  const settingsQuery = useQuery({
    queryKey: ["store-settings"],
    queryFn: fetchStoreSettings,
    staleTime: 60_000,
  });

  const totalCount = countQuery.data ?? 0;
  const isRandom = settingsQuery.data?.isHomepageRandom ?? false;

  const visibleItems = useMemo(() => {
    if (!isRandom) return items;
    const pinned = items.filter(p => p.isPinned);
    const unpinned = items.filter(p => !p.isPinned);
    return [...pinned, ...shuffleArray(unpinned)];
  }, [items, isRandom]);

  const hasMore = items.length < totalCount;

  const loadMore = useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;
    fetchingRef.current = true;
    setIsLoadingMore(true);
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const newData = await fetchProducts(from, to);
      // APPEND, never replace
      setItems(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
    } finally {
      fetchingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [page, hasMore]);

  return {
    visibleItems,
    hasMore,
    loadMore,
    isLoading: initialQuery.isLoading,
    isLoadingMore,
  };
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useDiscoveryQueue(productId: string | undefined, tags: string[]) {
  return useQuery({
    queryKey: ["discovery", productId],
    queryFn: () => fetchDiscoveryQueue(productId!, tags),
    enabled: !!productId,
    staleTime: 30_000,
  });
}

export function useStoreSettings() {
  return useQuery({
    queryKey: ["store-settings"],
    queryFn: fetchStoreSettings,
    staleTime: 60_000,
  });
}
