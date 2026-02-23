import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchProductCount, fetchProductById, fetchDiscoveryQueue, fetchStoreSettings } from "@/data/products";
import { useState, useCallback } from "react";

const PAGE_SIZE = 4;

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

  const totalCount = countQuery.data ?? 0;
  const visibleItems = productsQuery.data ?? [];
  const hasMore = visibleItems.length < totalCount;

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
