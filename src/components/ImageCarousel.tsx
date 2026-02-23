import { useState, useRef, useCallback, useEffect, type SyntheticEvent } from "react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export default function ImageCarousel({ images, alt, className = "" }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedSet, setLoadedSet] = useState<Set<number>>(new Set());
  const [errorSet, setErrorSet] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
    setLoadedSet(new Set());
    setErrorSet(new Set());
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [images]);

  const markLoaded = useCallback((i: number) => {
    setLoadedSet(prev => { const next = new Set(prev); next.add(i); return next; });
  }, []);

  const markError = useCallback((i: number) => {
    setErrorSet(prev => { const next = new Set(prev); next.add(i); return next; });
  }, []);

  const Placeholder = () => (
    <div className="absolute inset-0 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground font-medium">
      IMAGE
    </div>
  );

  if (images.length === 0) {
    return (
      <div className={`aspect-square rounded-2xl bg-muted flex items-center justify-center text-muted-foreground font-medium ${className}`}>
        IMAGE
      </div>
    );
  }

  if (images.length === 1) {
    if (errorSet.has(0)) {
      return (
        <div className={`relative aspect-square overflow-hidden rounded-2xl ${className}`}>
          <Placeholder />
        </div>
      );
    }
    return (
      <div className={`relative aspect-square overflow-hidden rounded-2xl bg-muted ${className}`}>
        {!loadedSet.has(0) && <div className="absolute inset-0 animate-pulse bg-muted" />}
        <img
          src={images[0]}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => markLoaded(0)}
          onError={() => markError(0)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${loadedSet.has(0) ? "opacity-100" : "opacity-0"}`}
        />
      </div>
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
          <div key={i} className="min-w-full snap-center aspect-square bg-muted relative flex-shrink-0">
            {errorSet.has(i) ? (
              <Placeholder />
            ) : (
              <>
                {!loadedSet.has(i) && <div className="absolute inset-0 animate-pulse bg-muted" />}
                <img
                  src={src}
                  alt={`${alt} ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  onLoad={() => markLoaded(i)}
                  onError={() => markError(i)}
                  className={`h-full w-full object-cover transition-opacity duration-300 ${loadedSet.has(i) ? "opacity-100" : "opacity-0"}`}
                />
              </>
            )}
          </div>
        ))}
      </div>
      {/* iOS-style dots */}
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
