import { useParams, Link, useLocation } from "react-router-dom";
import { MessageCircle, Send, ExternalLink, ShieldCheck, Zap } from "lucide-react";
import { getCheckoutUrl, type Product } from "@/data/products";
import { useProductBySlug, useDiscoveryQueue, useStoreSettings } from "@/hooks/useProducts";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ProductCard from "@/components/ProductCard";
import ImageCarousel from "@/components/ImageCarousel";
import { useEffect, useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";

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

  const isSoldOut = product.isSoldOut;
  const checkoutUrl = getCheckoutUrl(product, storeSettings);
  const isAffiliate = !!product.affiliateUrl;
  const ctaText = product.ctaText || "Beli Sekarang";
  const checkoutType = isAffiliate ? "link" : (product.checkout?.type ?? storeSettings?.globalCheckoutType ?? "link");

  const storeName = storeSettings?.storeName ?? "";
  const metaDesc = product.description?.substring(0, 160) ?? "";
  const ogImage = product.images?.[0] ?? "";
  const canonicalUrl = `${window.location.origin}/p/${product.slug}`;

  const priceNum = product.price?.replace(/[^\d]/g, "") ?? "";
  const availability = isSoldOut
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images,
    description: product.description,
    offers: {
      "@type": "Offer",
      price: priceNum,
      priceCurrency: "IDR",
      availability,
      url: canonicalUrl,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{product.title} | {storeName}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="product:price:amount" content={priceNum} />
        <meta property="product:price:currency" content="IDR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.title} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
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
              {isSoldOut ? (
                <>
                  <button disabled className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl md:rounded-2xl px-5 py-4 text-lg md:text-xl font-bold tracking-wide bg-secondary text-muted-foreground cursor-not-allowed border border-border">
                    Stok Habis
                  </button>
                  <span className="text-muted-foreground text-sm flex justify-center mt-4">Nantikan restock selanjutnya.</span>
                </>
              ) : (
                <>
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl md:rounded-2xl px-5 py-4 text-lg md:text-xl font-bold tracking-wide text-white transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(to right, hsl(25, 95%, 53%), hsl(20, 90%, 48%))',
                      boxShadow: '0 10px 25px -5px hsla(25, 95%, 53%, 0.25)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 15px 30px -5px hsla(25, 95%, 53%, 0.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 10px 25px -5px hsla(25, 95%, 53%, 0.25)'; }}
                  >
                    <CheckoutIcon type={checkoutType} />
                    {ctaText}
                    {isAffiliate && <ExternalLink className="h-4 w-4 ml-1" />}
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
                </>
              )}
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

      {/* Floating Conversion Island */}
      {!isSoldOut && (
        <div
          className={`fixed z-50 left-0 w-full flex justify-center transition-all duration-500 ease-out pointer-events-none
          ${showStickyBar ? 'bottom-0 md:bottom-8 opacity-100' : '-bottom-32 opacity-0'}`}
        >
          <div className="pointer-events-auto w-full md:w-[750px] md:max-w-[90vw] bg-background/95 backdrop-blur-xl border-t md:border border-border p-3 md:p-4 md:rounded-2xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4">
            <div className="flex flex-col flex-1 min-w-0 md:pl-2">
              <span className="text-[10px] md:text-xs text-muted-foreground truncate block w-full leading-tight mb-0.5">
                {product.title}
              </span>
              <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
                <span className="text-base sm:text-lg md:text-2xl font-black tracking-tight leading-none" style={{ color: 'hsl(25, 95%, 53%)' }}>
                  {product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-[9px] md:text-sm text-muted-foreground line-through font-medium">
                      {product.originalPrice}
                    </span>
                    {product.discountPercentage && (
                      <span className="text-[8px] md:text-xs font-bold text-white bg-destructive px-1.5 py-0.5 rounded-sm shadow-sm leading-none">
                        -{product.discountPercentage}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-none px-6 md:px-10 py-2.5 md:py-3.5 flex items-center justify-center gap-2 text-white font-bold text-sm md:text-lg rounded-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(to right, hsl(25, 95%, 53%), hsl(20, 90%, 48%))',
                boxShadow: '0 10px 25px -5px hsla(25, 95%, 53%, 0.25)',
              }}
            >
              <CheckoutIcon type={checkoutType} />
              {ctaText}
              {isAffiliate && <ExternalLink className="h-4 w-4 ml-1" />}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
