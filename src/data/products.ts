import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice?: string | null;
  discountPercentage?: string | null;
  image: string;
  description: string;
  tags: string[];
  checkout: {
    type: "whatsapp" | "telegram" | "link";
    target: string;
    message?: string | null;
  };
}

/** Map a DB row to our frontend Product shape */
function mapRow(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    originalPrice: row.original_price,
    discountPercentage: row.discount_percentage,
    image: row.image_url,
    description: row.description,
    tags: row.tags ?? [],
    checkout: {
      type: row.checkout_type as Product["checkout"]["type"],
      target: row.checkout_target,
      message: row.checkout_message,
    },
  };
}

/** Fetch paginated products for the storefront feed */
export async function fetchProducts(from: number, to: number): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
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

/** Fetch total product count */
export async function fetchProductCount(): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

/** Fetch related products (same tags, excluding current) */
export async function fetchRelatedProducts(currentId: string, tags: string[]): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .neq("id", currentId)
    .overlaps("tags", tags)
    .order("sort_order", { ascending: true })
    .limit(8);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/** Fetch discovery queue: related first, then the rest */
export async function fetchDiscoveryQueue(currentId: string, tags: string[]): Promise<Product[]> {
  // Fetch all others
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .neq("id", currentId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  const all = (data ?? []).map(mapRow);
  const tagSet = new Set(tags);
  const related = all.filter(p => p.tags.some(t => tagSet.has(t)));
  const rest = all.filter(p => !p.tags.some(t => tagSet.has(t)));
  return [...related, ...rest];
}

export function getCheckoutUrl(product: Product): string {
  const { checkout, title } = product;
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
