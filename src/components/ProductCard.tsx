import { memo } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/data/products";
import ImageCarousel from "./ImageCarousel";

interface ProductCardProps {
  product: Product;
  index: number;
}

function ProductCardInner({ product }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl bg-card card-shadow">
      <Link to={`/product/${product.id}`} state={{ product }} className="block">
        <ImageCarousel images={product.images} alt={product.title} />
        <div className="p-3 space-y-1">
          <div className="min-h-[2.75rem]">
            <h3 className="text-sm font-semibold leading-snug text-card-foreground line-clamp-2">
              {product.title}
            </h3>
          </div>
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
