import { products } from "@/data/products";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ProductCard from "@/components/ProductCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Store } from "lucide-react";

export default function Index() {
  const { visibleItems, isLoading, hasMore, sentinelRef } = useInfiniteScroll(products, 4);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[730px] px-4 pb-12">
        {/* Header */}
        <header className="sticky top-0 z-30 -mx-4 mb-6 bg-card/80 px-4 py-4 backdrop-blur-xl border-b border-border">
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

        {/* Product Feed */}
        <main className="grid grid-cols-2 gap-3">
          {visibleItems.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}

          {isLoading && <LoadingSpinner />}

          {hasMore && <div ref={sentinelRef} className="h-1" />}

          {!hasMore && !isLoading && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Semua produk sudah ditampilkan ✨
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
