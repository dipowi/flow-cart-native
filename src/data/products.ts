import { supabase } from "@/integrations/supabase/client";

export interface StoreSettings {
  id: string;
  globalCheckoutType: "whatsapp" | "telegram" | "link";
  globalCheckoutTarget: string;
  globalCheckoutMessage: string | null;
  isHomepageRandom: boolean;
  storeName: string;
  storeDescription: string;
  logoUrl: string | null;
  headerAlignment: "left" | "center" | "right";
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  price: string;
  originalPrice?: string | null;
  discountPercentage?: string | null;
  images: string[];
  description: string;
  tags: string[];
  isPinned: boolean;
  orderIndex: number;
  isActive: boolean;
  isSoldOut: boolean;
  checkout: {
    type: "whatsapp" | "telegram" | "link";
    target: string;
    message?: string | null;
  } | null;
}

/** Map a DB row to our frontend Product shape */
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
    isActive: row.is_active ?? true,
    isSoldOut: row.is_sold_out ?? false,
    checkout: hasCustomCheckout
      ? {
          type: row.checkout_type as "whatsapp" | "telegram" | "link",
          target: row.checkout_target as string,
          message: row.checkout_message,
        }
      : null,
  };
}

/** Fetch paginated products for the storefront feed */
export async function fetchProducts(from: number, to: number): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("is_pinned", { ascending: false })
    .order("order_index", { ascending: true })
    .range(from, to);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/** Fetch a single product by UUID */
export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

/** Fetch a single product by slug */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

/** Fetch total product count */
export async function fetchProductCount(): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);
  if (error) throw error;
  return count ?? 0;
}

/** Fetch related products (same tags, excluding current) */
export async function fetchRelatedProducts(currentId: string, tags: string[]): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .neq("id", currentId)
    .eq("is_active", true)
    .overlaps("tags", tags)
    .order("is_pinned", { ascending: false })
    .order("order_index", { ascending: true })
    .limit(8);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/** Fetch discovery queue: related first, then the rest */
export async function fetchDiscoveryQueue(currentId: string, tags: string[]): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .neq("id", currentId)
    .eq("is_active", true)
    .order("is_pinned", { ascending: false })
    .order("order_index", { ascending: true });
  if (error) throw error;
  const all = (data ?? []).map(mapRow);
  const tagSet = new Set(tags);
  const related = all.filter(p => p.tags.some(t => tagSet.has(t)));
  const rest = all.filter(p => !p.tags.some(t => tagSet.has(t)));
  return [...related, ...rest];
}

/** Fetch store settings */
export async function fetchStoreSettings(): Promise<StoreSettings | null> {
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    globalCheckoutType: data.global_checkout_type as StoreSettings["globalCheckoutType"],
    globalCheckoutTarget: data.global_checkout_target,
    globalCheckoutMessage: data.global_checkout_message,
    isHomepageRandom: data.is_homepage_random ?? false,
    storeName: (data as any).store_name ?? "",
    storeDescription: (data as any).store_description ?? "",
    logoUrl: (data as any).logo_url ?? null,
    headerAlignment: ((data as any).header_alignment ?? "left") as StoreSettings["headerAlignment"],
  };
}

/** Resolve checkout URL using product-specific or global settings */
export function getCheckoutUrl(product: Product, globalSettings?: StoreSettings | null): string {
  const checkout = product.checkout ?? (globalSettings ? {
    type: globalSettings.globalCheckoutType,
    target: globalSettings.globalCheckoutTarget,
    message: globalSettings.globalCheckoutMessage,
  } : null);

  if (!checkout || !checkout.target) return "#";

  const { title } = product;
  switch (checkout.type) {
    case "whatsapp": {
      const msg = encodeURIComponent(checkout.message || `Halo admin, saya ingin membeli ${title}`);
      return `https://wa.me/${checkout.target}?text=${msg}`;
    }
    case "telegram": {
      const msg = encodeURIComponent(checkout.message || `Halo, saya ingin membeli ${title}`);
      return `https://t.me/${checkout.target}?text=${msg}`;
    }
    case "link":
      return checkout.target || "#";
    default:
      return "#";
  }
}
