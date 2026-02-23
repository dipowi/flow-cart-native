import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
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

        <div className="p-3 space-y-1">
          <h3 className="text-sm font-semibold leading-snug text-card-foreground line-clamp-2">
            {product.title}
          </h3>
          {product.originalPrice && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-medium line-through">{product.originalPrice}</span>
              <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-md">-{product.discountPercentage}</span>
            </div>
          )}
          <p className="text-base font-bold text-primary">{product.price}</p>
        </div>
      </Link>
    </motion.article>
  );
}
