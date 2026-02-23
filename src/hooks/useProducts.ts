import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProductCount, fetchProductById, fetchDiscoveryQueue, fetchStoreSettings } from "@/data/products";
import { useState, useCallback, useMemo } from "react";

const PAGE_SIZE = 4;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useProductFeed() {
  const [page, setPage] = useState(1);

  const countQuery = useQuery({
    queryKey: ["products-count"],
    queryFn: fetchProductCount,
    staleTime: 60_000,
  });

  const productsQuery = useQuery({
    queryKey: ["products", page],
    queryFn: () => fetchProducts(0, page * PAGE_SIZE - 1),
    staleTime: 30_000,
  });

  const settingsQuery = useQuery({
    queryKey: ["store-settings"],
    queryFn: fetchStoreSettings,
    staleTime: 60_000,
  });

  const totalCount = countQuery.data ?? 0;
  const rawItems = productsQuery.data ?? [];
  const isRandom = settingsQuery.data?.isHomepageRandom ?? false;

  const visibleItems = useMemo(() => {
    if (!isRandom) return rawItems;
    const pinned = rawItems.filter(p => p.isPinned);
    const unpinned = rawItems.filter(p => !p.isPinned);
    return [...pinned, ...shuffleArray(unpinned)];
  }, [rawItems, isRandom]);

  const hasMore = rawItems.length < totalCount;

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  return { visibleItems, hasMore, loadMore, isLoading: productsQuery.isLoading };
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
