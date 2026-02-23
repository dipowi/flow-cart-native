import { useParams, Link } from "react-router-dom";
import { MessageCircle, Send, ExternalLink } from "lucide-react";
import { getCheckoutUrl } from "@/data/products";
import { useProduct, useDiscoveryQueue, useStoreSettings } from "@/hooks/useProducts";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ProductCard from "@/components/ProductCard";
import ImageCarousel from "@/components/ImageCarousel";
import { useEffect } from "react";

function CheckoutIcon({ type }: { type: string }) {
  switch (type) {
    case "whatsapp": return <MessageCircle className="h-5 w-5" />;
    case "telegram": return <Send className="h-5 w-5" />;
    default: return <ExternalLink className="h-5 w-5" />;
  }
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id);
  const { data: storeSettings } = useStoreSettings();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const { data: discoveryItems = [] } = useDiscoveryQueue(
    product?.id,
    product?.tags ?? []
  );

  const { visibleItems, hasMore, sentinelRef } = useInfiniteScroll(discoveryItems, 4);

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-foreground">Produk tidak ditemukan</p>
          <Link to="/" className="text-primary font-medium hover:underline">← Kembali</Link>
        </div>
      </div>
    );
  }

  const checkoutUrl = getCheckoutUrl(product, storeSettings);
  const checkoutType = product.checkout?.type ?? storeSettings?.globalCheckoutType ?? "link";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[730px] px-4 pb-12">
        <article className="pt-6 space-y-4">
          <div className="flex justify-center">
            <div className="w-full max-w-[380px]">
              <ImageCarousel images={product.images} alt={product.title} className="shadow-sm" />
            </div>
          </div>

          <div className="w-full mt-8 px-5 md:px-8 flex flex-col gap-5 text-left">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-snug">{product.title}</h1>
              {product.originalPrice ? (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium line-through">{product.originalPrice}</span>
                  <span className="text-[10px] md:text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-md">-{product.discountPercentage}</span>
                </div>
              ) : null}
              <p className={`${product.originalPrice ? 'mt-1' : 'mt-2'} text-2xl font-extrabold text-primary`}>{product.price}</p>
            </div>

            <div className="border-t border-border pt-5 mt-2">
              <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 mt-2 text-lg font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              <CheckoutIcon type={checkoutType} />
              Beli Sekarang
            </a>
          </div>
        </article>

        <section className="mt-8">
          <div className="grid grid-cols-2 gap-3">
            {visibleItems.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
            {hasMore && <div ref={sentinelRef} className="col-span-2 h-1" />}
          </div>
        </section>
      </div>
    </div>
  );
}
