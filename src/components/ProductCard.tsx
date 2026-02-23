import { memo, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  index: number;
}

function ProductCardInner({ product }: ProductCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl bg-card card-shadow">
      <Link to={`/product/${product.id}`} className="block">
        <div className="w-full aspect-square overflow-hidden relative bg-muted">
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-cover transition-transform duration-500 hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
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
    </article>
  );
}

const ProductCard = memo(ProductCardInner);
export default ProductCard;
