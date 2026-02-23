import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProductCount, fetchProductById, fetchDiscoveryQueue, fetchStoreSettings, fetchProducts } from "@/data/products";
import { useState, useCallback, useRef } from "react";
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
/**
 * Pre-render shuffle: separates pinned from unpinned,
 * shuffles unpinned if random is enabled, then merges.
 * Data enters state already in final order — zero flicker.
 */
function preRenderSort(products: Product[], isRandom: boolean): Product[] {
  const pinned = products.filter(p => p.isPinned);
  const unpinned = products.filter(p => !p.isPinned);
  return [...pinned, ...(isRandom ? shuffleArray(unpinned) : unpinned)];
}

export function useProductFeed() {
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const fetchingRef = useRef(false);
  const isRandomRef = useRef(false);

  const countQuery = useQuery({
    queryKey: ["products-count"],
    queryFn: fetchProductCount,
    staleTime: 60_000,
  });

  // Fetch settings FIRST so we know if random is on before rendering products
  const settingsQuery = useQuery({
    queryKey: ["store-settings"],
    queryFn: fetchStoreSettings,
    staleTime: 60_000,
  });

  // Keep ref in sync so callbacks always see latest value
  isRandomRef.current = settingsQuery.data?.isHomepageRandom ?? false;

  // Initial load — waits for settings, then fetches & pre-shuffles
  const initialQuery = useQuery({
    queryKey: ["products-initial"],
    queryFn: async () => {
      const [data, settings] = await Promise.all([
        fetchProducts(0, PAGE_SIZE - 1),
        fetchStoreSettings(),
      ]);
      const isRandom = settings?.isHomepageRandom ?? false;
      isRandomRef.current = isRandom;
      const sorted = preRenderSort(data, isRandom);
      setItems(sorted);
      setPage(1);
      return sorted;
    },
    staleTime: 30_000,
  });

  const totalCount = countQuery.data ?? 0;
  const hasMore = items.length < totalCount;

  const loadMore = useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;
    fetchingRef.current = true;
    setIsLoadingMore(true);
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const newData = await fetchProducts(from, to);
      // Pre-sort new batch, then APPEND — never replace
      const sorted = preRenderSort(newData, isRandomRef.current);
      setItems(prev => [...prev, ...sorted]);
      setPage(prev => prev + 1);
    } finally {
      fetchingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [page, hasMore]);

  return {
    items,
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
