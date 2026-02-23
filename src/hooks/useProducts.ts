import { useQuery } from "@tanstack/react-query";
import { fetchProductById, fetchDiscoveryQueue, fetchStoreSettings } from "@/data/products";
import { useState, useCallback, useEffect } from "react";
import type { Product } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mapRow(row: any): Product {
  const hasCustomCheckout = !!(row.checkout_type && row.checkout_target);
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    originalPrice: row.original_price,
    discountPercentage: row.discount_percentage,
    images: row.image_urls ?? [],
    description: row.description,
    tags: row.tags ?? [],
    isPinned: row.is_pinned ?? false,
    orderIndex: row.order_index ?? 0,
    checkout: hasCustomCheckout
      ? { type: row.checkout_type, target: row.checkout_target, message: row.checkout_message }
      : null,
  };
}

const CHUNK = 4;

/**
 * Master Array Slicing architecture:
 * 1. Fetch ALL products + settings ONCE on mount
 * 2. Sort pinned first, shuffle unpinned if random is on
 * 3. Store in master array, never re-fetch or re-shuffle
 * 4. Lazy load via array.slice(0, visibleCount)
 */
export function useProductFeed() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(CHUNK);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const [productsRes, settingsRes] = await Promise.all([
        supabase.from("products").select("*").order("is_pinned", { ascending: false }).order("order_index", { ascending: true }),
        supabase.from("store_settings").select("*").limit(1).maybeSingle(),
      ]);

      if (cancelled) return;
      if (productsRes.error) throw productsRes.error;

      const all = (productsRes.data ?? []).map(mapRow);
      const isRandom = settingsRes.data?.is_homepage_random ?? false;

      const pinned = all.filter(p => p.isPinned);
      const unpinned = all.filter(p => !p.isPinned);
      const finalArray = [...pinned, ...(isRandom ? shuffleArray(unpinned) : unpinned)];

      setAllProducts(finalArray);
      setIsLoading(false);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const items = allProducts.slice(0, visibleCount);
  const hasMore = visibleCount < allProducts.length;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + CHUNK);
  }, []);

  return { items, hasMore, loadMore, isLoading, isLoadingMore: false };
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
