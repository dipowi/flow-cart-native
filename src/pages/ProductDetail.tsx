import { useParams, Link, useLocation } from "react-router-dom";
import { MessageCircle, Send, ExternalLink } from "lucide-react";
import { getCheckoutUrl, type Product } from "@/data/products";
import { useProductBySlug, useDiscoveryQueue, useStoreSettings } from "@/hooks/useProducts";
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
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const passedProduct = (location.state as { product?: Product })?.product;
  const { data: fetchedProduct, isLoading } = useProductBySlug(passedProduct ? undefined : slug);
  const product = passedProduct ?? fetchedProduct ?? null;
  const { data: storeSettings } = useStoreSettings();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

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
      <div className="mx-auto max-w-[960px] px-4 pb-12">
        {/* Split-Pane: 1 col mobile, 2 col desktop */}
        <article className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {/* Left Column — Visuals */}
          <div className="w-full">
            <div className="md:sticky md:top-6">
              <ImageCarousel images={product.images} alt={product.title} className="shadow-sm rounded-2xl" priority={true} />
            </div>
          </div>

          {/* Right Column — Details & Action */}
          <div className="flex flex-col gap-1 text-left items-start">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-snug">
              {product.title}
            </h1>

            {product.originalPrice ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg text-muted-foreground font-medium line-through">{product.originalPrice}</span>
                <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-md">-{product.discountPercentage}</span>
              </div>
            ) : null}
            <p className={`${product.originalPrice ? 'mt-1' : 'mt-3'} text-3xl md:text-4xl font-extrabold text-primary`}>
              {product.price}
            </p>

            <div className="w-full border-t border-border my-5 pt-5">
              <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-lg font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              <CheckoutIcon type={checkoutType} />
              Beli Sekarang
            </a>
          </div>
        </article>

        {/* Related Products — with elegant divider */}
        <section className="mt-20 pt-8 border-t border-border">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Produk Lainnya</h2>
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
