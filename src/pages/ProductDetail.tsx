import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Send, ExternalLink } from "lucide-react";
import { products, getCheckoutUrl, buildDiscoveryQueue } from "@/data/products";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ProductCard from "@/components/ProductCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useMemo, useEffect, useState } from "react";

function CheckoutIcon({ type }: { type: string }) {
  switch (type) {
    case "whatsapp": return <MessageCircle className="h-5 w-5" />;
    case "telegram": return <Send className="h-5 w-5" />;
    default: return <ExternalLink className="h-5 w-5" />;
  }
}

function DetailImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[380px] aspect-square rounded-2xl overflow-hidden shadow-sm">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
        <img
          src={src}
          alt={alt}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = products.find(p => p.id === Number(id));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const discoveryQueue = useMemo(
    () => (product ? buildDiscoveryQueue(product) : []),
    [product]
  );

  const { visibleItems, hasMore, sentinelRef } = useInfiniteScroll(discoveryQueue, 4);

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

  const checkoutUrl = getCheckoutUrl(product);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[730px] px-4 pb-12">
        {/* Product Detail */}
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="pt-6 space-y-4"
        >
          <DetailImage src={product.image} alt={product.title} />

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
              <CheckoutIcon type={product.checkout.type} />
              Beli Sekarang
            </a>
          </div>
        </motion.article>

        {/* Seamless product feed */}
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
