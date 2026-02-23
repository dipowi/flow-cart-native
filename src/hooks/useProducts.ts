import { useQuery } from "@tanstack/react-query";
import { fetchProductById, fetchProductBySlug, fetchDiscoveryQueue, fetchStoreSettings } from "@/data/products";
import { useState, useCallback, useEffect, useRef } from "react";
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
    slug: row.slug ?? "",
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
 * Two-Stage Hybrid Fetch:
 * Stage 1: Fetch top 4 products instantly (strict DB order, respects pins).
 * Stage 2: Background-fetch remaining products, shuffle if random is on.
 * Scroll: Slice from pending array — zero network calls, zero flicker.
 */
export function useProductFeed() {
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pendingRef = useRef<Product[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function stage1() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("order_index", { ascending: true })
        .limit(CHUNK);

      if (cancelled || error) return;
      setVisibleProducts((data ?? []).map(mapRow));
      setIsLoading(false);

      // Stage 2: background fetch rest + settings
      const [restRes, settingsRes] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .order("is_pinned", { ascending: false })
          .order("order_index", { ascending: true })
          .range(CHUNK, 1000),
        supabase.from("store_settings").select("*").limit(1).maybeSingle(),
      ]);

      if (cancelled) return;
      const rest = (restRes.data ?? []).map(mapRow);
      const isRandom = settingsRes.data?.is_homepage_random ?? false;

      const pinned = rest.filter(p => p.isPinned);
      const unpinned = rest.filter(p => !p.isPinned);
      const processed = [...pinned, ...(isRandom ? shuffleArray(unpinned) : unpinned)];

      pendingRef.current = processed;
      setPendingProducts(processed);
    }

    stage1();
    return () => { cancelled = true; };
  }, []);

  const hasMore = pendingProducts.length > 0;

  const loadMore = useCallback(() => {
    const next = pendingRef.current.slice(0, CHUNK);
    const remaining = pendingRef.current.slice(CHUNK);
    pendingRef.current = remaining;
    setVisibleProducts(prev => [...prev, ...next]);
    setPendingProducts(remaining);
  }, []);

  return {
    items: visibleProducts,
    hasMore,
    loadMore,
    isLoading,
    isLoadingMore: false,
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

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["product-slug", slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
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
