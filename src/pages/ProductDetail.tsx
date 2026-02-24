import { useParams, Link, useLocation } from "react-router-dom";
import { MessageCircle, Send, ExternalLink } from "lucide-react";
import { getCheckoutUrl, type Product } from "@/data/products";
import { useProductBySlug, useDiscoveryQueue, useStoreSettings } from "@/hooks/useProducts";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ProductCard from "@/components/ProductCard";
import ImageCarousel from "@/components/ImageCarousel";
import { useEffect, useState, useRef } from "react";

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

  const descriptionRef = useRef<HTMLDivElement>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const handleToggleDescription = () => {
    if (isDescExpanded) {
      setIsDescExpanded(false);
      setTimeout(() => {
        descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      setIsDescExpanded(true);
    }
  };

  useEffect(() => {
    setIsDescExpanded(false);
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
        <article className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* Left Column — Sticky Visuals */}
          <div className="w-full md:sticky md:top-24 md:self-start">
            <ImageCarousel images={product.images} alt={product.title} className="shadow-sm rounded-2xl" priority={true} />
          </div>

          {/* Right Column — Details & Action */}
          <div className="flex flex-col justify-start items-start h-full pt-2 md:pt-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight md:leading-snug tracking-tight line-clamp-3 min-h-[2.5rem] md:min-h-[3rem]">
              {product.title}
            </h1>

            {product.originalPrice ? (
              <div className="mt-2 md:mt-4 flex items-center gap-2">
                <span className="text-xl text-muted-foreground font-medium line-through">{product.originalPrice}</span>
                <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-md">-{product.discountPercentage}</span>
              </div>
            ) : null}
            <p className={`${product.originalPrice ? 'mt-1' : 'mt-2 md:mt-4'} text-4xl md:text-5xl font-black tracking-tight`} style={{ color: 'hsl(25, 95%, 53%)' }}>
              {product.price}
            </p>

            <div ref={descriptionRef} className="w-full border-t border-border my-5 pt-5 scroll-mt-24">
              <div className="relative">
                <div className={`text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap overflow-hidden transition-all duration-300 ${isDescExpanded ? 'max-h-[2000px]' : 'max-h-32'}`}>
                  {product.description}
                </div>
                {!isDescExpanded && (
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background to-transparent" />
                )}
              </div>
              <button
                onClick={handleToggleDescription}
                className="text-sm font-semibold mt-2 transition-colors hover:opacity-80"
                style={{ color: 'hsl(25, 95%, 53%)' }}
              >
                {isDescExpanded ? 'Tutup Deskripsi' : 'Baca Selengkapnya...'}
              </button>
            </div>

            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl md:rounded-2xl px-5 py-4 text-lg md:text-xl font-bold tracking-wide text-white transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(to right, hsl(25, 95%, 53%), hsl(20, 90%, 48%))',
                boxShadow: '0 10px 25px -5px hsla(25, 95%, 53%, 0.25)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 15px 30px -5px hsla(25, 95%, 53%, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 10px 25px -5px hsla(25, 95%, 53%, 0.25)'; }}
            >
              <CheckoutIcon type={checkoutType} />
              Beli Sekarang
            </a>
            <div className="flex items-center justify-center gap-2 mt-4 w-full text-xs font-medium text-muted-foreground">
              <span>🔒 Transaksi Aman & Langsung</span>
              <span>•</span>
              <span>⚡ Respon Cepat</span>
            </div>
          </div>
        </article>

        {/* Seamless feed — no title, no divider */}
        <section className="mt-16">
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
