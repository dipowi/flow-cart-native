import { useProductFeed } from "@/hooks/useProducts";
import { useStoreSettings } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
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

function DynamicHeader() {
  const { data: settings } = useStoreSettings();

  const name = settings?.storeName ?? "Toko Cokotq";
  const desc = settings?.storeDescription ?? "Belanja mudah, harga bersahabat";
  const logoUrl = settings?.logoUrl;
  const align = settings?.headerAlignment ?? "left";

  const alignClasses = {
    left: "flex flex-row items-center justify-start gap-3 md:gap-4",
    center: "flex flex-row items-center justify-center gap-3 md:gap-4",
    right: "flex flex-row items-center justify-end gap-3 md:gap-4",
  };

  const textAlignClasses = {
    left: "flex flex-col items-start text-left",
    center: "flex flex-col items-center text-center",
    right: "flex flex-col items-end text-right",
  };

  return (
    <header className="mb-6 px-4 py-4 -mx-4 border-b border-border">
      <div className={alignClasses[align]}>
        {logoUrl && (
          <img src={logoUrl} alt={name} className="h-10 w-auto object-contain flex-shrink-0" />
        )}
        <div className={textAlignClasses[align]}>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight leading-tight">{name}</h1>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
    </header>
  );
}

export default function Index() {
  const { items, hasMore, loadMore, isLoading } = useProductFeed();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
        <DynamicHeader />

        <main className="grid grid-cols-2 gap-3">
          {isLoading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {!isLoading && items.map((product) => (
            <ProductCard key={product.id} product={product} index={0} />
          ))}

          {hasMore && <div ref={sentinelRef} className="col-span-2 h-1" />}

          {!hasMore && items.length > 0 && !isLoading && (
            <p className="col-span-2 w-full py-8 text-center text-sm text-muted-foreground mx-auto">
              Semua produk sudah ditampilkan ✨
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
