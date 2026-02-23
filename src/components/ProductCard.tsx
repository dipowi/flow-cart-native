import { motion } from "framer-motion";
import { Eye, ShoppingCart, MessageCircle, Send, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Product, getCheckoutUrl } from "@/data/products";

interface ProductCardProps {
  product: Product;
  index: number;
}

function CheckoutIcon({ type }: { type: string }) {
  switch (type) {
    case "whatsapp": return <MessageCircle className="h-4 w-4" />;
    case "telegram": return <Send className="h-4 w-4" />;
    default: return <ExternalLink className="h-4 w-4" />;
  }
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const checkoutUrl = getCheckoutUrl(product);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className="overflow-hidden rounded-2xl bg-card card-shadow"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </Link>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-base font-semibold leading-snug text-card-foreground line-clamp-2">
            {product.title}
          </h3>
          <p className="mt-1 text-lg font-bold text-primary">{product.price}</p>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 active:scale-[0.98]"
          >
            <Eye className="h-4 w-4" />
            Lihat Deskripsi
          </Link>
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
          >
            <CheckoutIcon type={product.checkout.type} />
            Beli Sekarang
          </a>
        </div>
      </div>
    </motion.article>
  );
}
