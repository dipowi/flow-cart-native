import { useProductFeed } from "@/hooks/useProducts";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ProductCard from "@/components/ProductCard";
import { Store } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Index() {
  const { visibleItems, hasMore, loadMore, isLoading } = useProductFeed();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "100px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[730px] px-4 pb-12">
        <header className="mb-6 px-4 py-4 -mx-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-card-foreground leading-tight">Toko Cokotq</h1>
              <p className="text-xs text-muted-foreground">Belanja mudah, harga bersahabat</p>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-2 gap-3">
          {visibleItems.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}

          {hasMore && <div ref={sentinelRef} className="col-span-2 h-1" />}

          {!hasMore && visibleItems.length > 0 && (
            <p className="col-span-2 w-full py-8 text-center text-sm text-muted-foreground mx-auto">
              Semua produk sudah ditampilkan ✨
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
