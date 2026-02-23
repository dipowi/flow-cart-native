import { useState, useRef, useCallback, useEffect } from "react";
import { OptimizedImage } from "./OptimizedImage";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function ImageCarousel({ images, alt, className = "", priority = false }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className={`aspect-square rounded-2xl bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground font-medium tracking-widest text-sm uppercase">
          IMAGE
        </span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <OptimizedImage
        src={images[0]}
        alt={alt}
        priority={priority}
        className={`aspect-square rounded-2xl ${className}`}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide rounded-2xl"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        {images.map((src, i) => (
          <div key={i} className="min-w-full snap-center flex-shrink-0">
            <OptimizedImage
              src={src}
              alt={`${alt} ${i + 1}`}
              priority={priority && i === 0}
              className="aspect-square"
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              i === activeIndex
                ? "w-4 bg-primary-foreground/90"
                : "w-1.5 bg-primary-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
