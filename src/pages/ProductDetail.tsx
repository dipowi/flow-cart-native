import { useParams, Link, useLocation } from "react-router-dom";
import { MessageCircle, Send, ExternalLink, ShieldCheck, Zap } from "lucide-react";
import { getCheckoutUrl, type Product } from "@/data/products";
import { useProductBySlug, useDiscoveryQueue, useStoreSettings } from "@/hooks/useProducts";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ProductCard from "@/components/ProductCard";
import ImageCarousel from "@/components/ImageCarousel";
import { useEffect, useState, useRef, useCallback } from "react";

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
  const textRef = useRef<HTMLDivElement>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const topCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    if (topCtaRef.current) {
      observer.observe(topCtaRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleToggleDescription = useCallback(() => {
    if (isDescExpanded) {
      setIsDescExpanded(false);
      setTimeout(() => {
        descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      setIsDescExpanded(true);
    }
  }, [isDescExpanded]);

  useEffect(() => {
    setIsDescExpanded(false);
    setShowReadMore(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    if (textRef.current) {
      const isOverflowing = textRef.current.scrollHeight > textRef.current.clientHeight;
      setShowReadMore(isOverflowing);
    }
  }, [product?.description, isDescExpanded]);

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
      <div className="mx-auto max-w-[960px] px-4 pb-28 md:pb-32">
        {/* Split-Pane: 1 col mobile, 2 col desktop */}
        <article className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* Left Column — Sticky Visuals */}
          <div className="w-full mt-0 pt-0 md:sticky md:top-24 md:self-start">
            <ImageCarousel images={product.images} alt={product.title} className="shadow-sm rounded-2xl" priority={true} />
          </div>

          {/* Right Column — Details & Action */}
          <div className="flex flex-col justify-start items-start h-full mt-0 pt-0">
            <h1 className="mt-0 pt-0 text-2xl md:text-3xl font-extrabold text-foreground leading-tight tracking-tight line-clamp-2 min-h-[3.5rem] md:min-h-[4.5rem] flex items-start">
              {product.title}
            </h1>

            {/* Unified Pricing Block — Inline Baseline Anchor */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-4 mb-6">
              <span className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: 'hsl(25, 95%, 53%)' }}>
                {product.price}
              </span>

              {product.originalPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-lg md:text-xl text-muted-foreground line-through font-medium">
                    {product.originalPrice}
                  </span>
                  {product.discountPercentage && (
                    <span className="text-xs font-bold text-white bg-destructive px-2 py-1 rounded-md shadow-sm">
                      -{product.discountPercentage}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div ref={topCtaRef} className="w-full">
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl md:rounded-2xl px-5 py-4 text-lg md:text-xl font-bold tracking-wide text-white transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
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
              <div className="flex items-center justify-center gap-3 mt-4 w-full text-[13px] font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Transaksi Aman Terverifikasi</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4" style={{ color: 'hsl(25, 95%, 53%)' }} />
                  <span>Respon Instan</span>
                </div>
              </div>
            </div>

            <div className="w-full border-b border-border my-8" />

            <div ref={descriptionRef} className="w-full scroll-mt-24">
              <div className="relative">
                <div
                  ref={textRef}
                  className={`text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap transition-all duration-300 ${isDescExpanded ? '' : 'line-clamp-2'}`}
                >
                  {product.description}
                </div>
                {showReadMore && !isDescExpanded && (
                  <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                )}
              </div>
              {showReadMore && (
                <button
                  onClick={handleToggleDescription}
                  className="text-sm font-semibold mt-2 transition-colors hover:opacity-80"
                  style={{ color: 'hsl(25, 95%, 53%)' }}
                >
                  {isDescExpanded ? 'Tutup Deskripsi' : 'Baca Selengkapnya...'}
                </button>
              )}
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

      {/* Omnipresent Sticky Bottom Bar */}
      <div className={`fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-md border-t border-border p-3 md:p-4 z-50 flex flex-row items-center justify-between gap-3 md:justify-center md:gap-6 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.5)] transform transition-all duration-500 ease-in-out ${showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        {/* Product Info — NOW VISIBLE ON MOBILE */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="hidden md:block text-sm text-muted-foreground truncate mb-0.5">{product.title}</span>
          <div className="flex flex-col md:flex-row md:items-baseline gap-0 md:gap-2">
            <span className="text-lg md:text-xl font-black tracking-tight truncate" style={{ color: 'hsl(25, 95%, 53%)' }}>
              {product.price}
            </span>
            {product.originalPrice && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] md:text-sm text-muted-foreground line-through font-medium">
                  {product.originalPrice}
                </span>
                {product.discountPercentage && (
                  <span className="text-[9px] md:text-[10px] font-bold text-white bg-destructive px-1.5 py-0.5 rounded shadow-sm">
                    -{product.discountPercentage}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA — Compact on Mobile, Large on Desktop */}
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-none w-[140px] sm:w-[160px] md:w-auto md:min-w-[250px] flex items-center justify-center gap-2 py-2.5 md:py-3.5 text-white font-bold text-sm md:text-lg rounded-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(to right, hsl(25, 95%, 53%), hsl(20, 90%, 48%))',
            boxShadow: '0 10px 25px -5px hsla(25, 95%, 53%, 0.25)',
          }}
        >
          <CheckoutIcon type={checkoutType} />
          Beli Sekarang
        </a>
      </div>
    </div>
  );
}
