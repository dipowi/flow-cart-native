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
    <article className="group relative flex flex-col bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-border hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 cursor-pointer">
      <Link to={`/p/${product.slug}`} state={{ product }} className="block">
        {/* Discount badge */}
        {product.discountPercentage && (
          <div className="absolute top-0 right-0 bg-destructive/95 backdrop-blur-sm text-white text-xs md:text-sm font-bold px-3 py-1.5 rounded-bl-xl z-10 shadow-lg">
            -{product.discountPercentage}
          </div>
        )}

        {/* Image with zoom illusion */}
        <div className="relative overflow-hidden aspect-square w-full">
          <div className="w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out">
            <ImageCarousel images={product.images} alt={product.title} />
          </div>
        </div>

        <div className="p-3 space-y-1">
          <div className="min-h-[2.75rem]">
            <h3 className="text-sm md:text-base font-semibold leading-snug text-card-foreground line-clamp-2">
              {product.title}
            </h3>
          </div>
          {product.originalPrice && (
            <span className="text-xs md:text-sm text-muted-foreground font-medium line-through">{product.originalPrice}</span>
          )}
          <p className="text-lg md:text-xl font-bold tracking-tight mt-1" style={{ color: 'hsl(25, 95%, 53%)' }}>{product.price}</p>
        </div>
      </Link>
    </article>
  );
}

const ProductCard = memo(ProductCardInner);
export default ProductCard;
