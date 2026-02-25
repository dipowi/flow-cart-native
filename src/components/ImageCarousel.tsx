import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const scrollToSlide = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * index, behavior: "smooth" });
  }, []);

  useEffect(() => {
    setActiveIndex(0);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className={`aspect-square rounded-2xl bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground font-medium tracking-widest text-sm uppercase">IMAGE</span>
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
    <div className={`relative group ${className}`}>
      <div className="relative w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-muted">
        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {images.map((src, i) => (
            <div key={i} className="flex-none w-full h-full snap-center">
              <OptimizedImage
                src={src}
                alt={`${alt} ${i + 1}`}
                priority={priority && i === 0}
                className="w-full h-full"
              />
            </div>
          ))}
        </div>

        {/* Contrast Mask — guarantees dot visibility on bright images */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-10" />

        {/* Glassmorphism Hover Arrows — Desktop Only */}
        <button
          onClick={() => scrollToSlide(activeIndex === 0 ? images.length - 1 : activeIndex - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/40 backdrop-blur-md border border-foreground/10 hidden md:flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background/60"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scrollToSlide(activeIndex === images.length - 1 ? 0 : activeIndex + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/40 backdrop-blur-md border border-foreground/10 hidden md:flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background/60"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dynamic Pill Indicators — Mobile-First, always visible */}
        <div className="absolute bottom-3 md:bottom-5 left-0 w-full flex justify-center items-center gap-1.5 md:gap-2 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSlide(i)}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ease-out ${
                i === activeIndex
                  ? "w-5 md:w-8 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.9)]"
                  : "w-1.5 md:w-2 bg-white/60 hover:bg-white/90"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
