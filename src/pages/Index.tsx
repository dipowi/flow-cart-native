import { useProductFeed } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { Store } from "lucide-react";
import { useEffect, useRef } from "react";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card card-shadow">
      <div className="aspect-square animate-pulse bg-muted rounded-t-2xl" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 animate-pulse bg-muted rounded" />
        <div className="h-4 w-1/2 animate-pulse bg-muted rounded" />
        <div className="h-5 w-2/5 animate-pulse bg-muted rounded" />
      </div>
    </div>
  );
}

export default function Index() {
  const { visibleItems, hasMore, loadMore, isLoading } = useProductFeed();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Intersection observer for infinite scroll - appends data
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
          {/* Instant App Shell: show 4 skeletons while loading */}
          {isLoading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {/* Actual products - using product.id as key for stable DOM */}
          {!isLoading && visibleItems.map((product) => (
            <ProductCard key={product.id} product={product} index={0} />
          ))}

          {hasMore && <div ref={sentinelRef} className="col-span-2 h-1" />}

          {!hasMore && visibleItems.length > 0 && !isLoading && (
            <p className="col-span-2 w-full py-8 text-center text-sm text-muted-foreground mx-auto">
              Semua produk sudah ditampilkan ✨
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
