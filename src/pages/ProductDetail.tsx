import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Send, ExternalLink } from "lucide-react";
import { products, getCheckoutUrl, getRelatedProducts } from "@/data/products";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ProductCard from "@/components/ProductCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useMemo, useEffect } from "react";

function CheckoutIcon({ type }: { type: string }) {
  switch (type) {
    case "whatsapp": return <MessageCircle className="h-5 w-5" />;
    case "telegram": return <Send className="h-5 w-5" />;
    default: return <ExternalLink className="h-5 w-5" />;
  }
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = products.find(p => p.id === Number(id));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const related = useMemo(
    () => (product ? getRelatedProducts(product.id, 8) : []),
    [product]
  );

  const { visibleItems, isLoading, hasMore, sentinelRef } = useInfiniteScroll(related, 4);

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
        {/* Header */}
        <header className="sticky top-0 z-30 -mx-4 mb-6 bg-card/80 px-4 py-4 backdrop-blur-xl border-b border-border">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </header>

        {/* Product Detail */}
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-2xl bg-card card-shadow"
        >
          <div className="aspect-square overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-5 space-y-4">
            <div>
              <h1 className="text-xl font-bold text-card-foreground leading-snug">{product.title}</h1>
              <p className="mt-1.5 text-2xl font-extrabold text-primary">{product.price}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {product.tags.map(tag => (
                <span key={tag} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
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
          </div>
          {isLoading && <LoadingSpinner />}
          {hasMore && <div ref={sentinelRef} className="h-1" />}
        </section>
      </div>
    </div>
  );
}
