export interface CheckoutConfig {
  type: "whatsapp" | "telegram" | "payment_gateway";
  phone?: string;
  username?: string;
  url?: string;
  message?: string;
}

export interface Product {
  id: number;
  title: string;
  price: string;
  originalPrice?: string;
  discountPercentage?: string;
  image: string;
  description: string;
  tags: string[];
  checkout: CheckoutConfig;
}

export const products: Product[] = [
  {
    id: 1,
    title: "Kurma Kurmanun Premium 250gr",
    price: "Rp 45.000",
    originalPrice: "Rp 65.000",
    discountPercentage: "30%",
    image: "https://placehold.co/400x400/e2e8f0/64748b?text=Kurma",
    description: "Kurma premium pilihan, manis alami dan lembut. Cocok untuk hidangan keluarga.",
    tags: ["makanan", "kurma"],
    checkout: { type: "whatsapp", phone: "6281234567890", message: "Halo Cokotq, saya mau pesan Kurma Kurmanun 250gr." }
  },
  {
    id: 2,
    title: "Template HPP WEB ID Pro",
    price: "Rp 150.000",
    image: "https://placehold.co/400x400/e2e8f0/64748b?text=Template",
    description: "Platform PWA-based untuk manajemen bisnis modern. Solusi full-stack untuk UMKM.",
    tags: ["digital", "template"],
    checkout: { type: "telegram", username: "admin_store", message: "Halo, saya tertarik dengan Template HPP WEB ID." }
  },
  {
    id: 3,
    title: "Layanan Konsultan Bisnis & Setup Web",
    price: "Rp 500.000",
    image: "https://placehold.co/400x400/e2e8f0/64748b?text=Konsultan",
    description: "Sesi konsultasi 1-on-1 bersama Didin Prasetyawan, S.M. untuk optimasi target market Gen Z.",
    tags: ["jasa", "konsultan"],
    checkout: { type: "payment_gateway", url: "https://payment.gateway.com/link/123" }
  },
  {
    id: 4,
    title: "Paket Produk Digital Gen Z",
    price: "Rp 99.000",
    image: "https://placehold.co/400x400/e2e8f0/64748b?text=Digital",
    description: "Kumpulan aset digital desain kekinian.",
    tags: ["digital", "gen-z"],
    checkout: { type: "whatsapp", phone: "6281234567890", message: "Halo, mau order Paket Digital Gen Z." }
  },
  {
    id: 5,
    title: "Modul Pelatihan Microsoft Word",
    price: "Rp 35.000",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=60",
    description: "Modul praktis untuk pemula dan anak sekolah.",
    tags: ["edukasi", "digital"],
    checkout: { type: "whatsapp", phone: "6281234567890", message: "Halo, pesan Modul MS Word." }
  },
  {
    id: 6,
    title: "Jam Tangan Retro Casio A168 (Pre-loved)",
    price: "Rp 300.000",
    originalPrice: "Rp 450.000",
    discountPercentage: "33%",
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&q=60",
    description: "Kondisi mulus, akurat, gaya klasik abadi.",
    tags: ["aksesoris", "fashion"],
    checkout: { type: "whatsapp", phone: "6281234567890", message: "Halo, Casio A168 masih ada?" }
  },
  {
    id: 7,
    title: "Madu Hutan Asli Kalimantan 500ml",
    price: "Rp 120.000",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=60",
    description: "Madu murni dari hutan Kalimantan, tanpa campuran. Kaya manfaat untuk kesehatan.",
    tags: ["makanan", "kesehatan"],
    checkout: { type: "whatsapp", phone: "6281234567890", message: "Halo, saya mau pesan Madu Hutan Kalimantan." }
  },
  {
    id: 8,
    title: "Kursus Online UI/UX Design",
    price: "Rp 250.000",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&q=60",
    description: "Belajar desain UI/UX dari nol sampai mahir. Termasuk sertifikat dan mentoring.",
    tags: ["edukasi", "digital"],
    checkout: { type: "telegram", username: "admin_store", message: "Halo, saya mau ikut kursus UI/UX." }
  },
  {
    id: 9,
    title: "Tas Laptop Canvas Premium",
    price: "Rp 185.000",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=60",
    description: "Tas laptop canvas tebal, muat hingga 15.6 inch. Desain minimalis dan tahan air.",
    tags: ["aksesoris", "fashion"],
    checkout: { type: "whatsapp", phone: "6281234567890", message: "Halo, saya mau pesan Tas Laptop Canvas." }
  },
  {
    id: 10,
    title: "Ebook Strategi Bisnis Online 2025",
    price: "Rp 49.000",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=60",
    description: "Panduan lengkap memulai dan mengembangkan bisnis online di era digital.",
    tags: ["digital", "edukasi"],
    checkout: { type: "payment_gateway", url: "https://payment.gateway.com/link/456" }
  },
  {
    id: 11,
    title: "Kopi Arabica Toraja 200gr",
    price: "Rp 75.000",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=60",
    description: "Biji kopi arabica pilihan dari Toraja, roast medium dengan aroma khas.",
    tags: ["makanan", "kopi"],
    checkout: { type: "whatsapp", phone: "6281234567890", message: "Halo, pesan Kopi Toraja 200gr." }
  },
  {
    id: 12,
    title: "Sticker Pack Custom Bisnis",
    price: "Rp 25.000",
    image: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=400&q=60",
    description: "Paket stiker custom untuk branding bisnis. Bahan vinyl tahan air.",
    tags: ["digital", "branding"],
    checkout: { type: "whatsapp", phone: "6281234567890", message: "Halo, mau pesan Sticker Pack Custom." }
  }
];

export function getCheckoutUrl(product: Product): string {
  const { checkout, title } = product;
  switch (checkout.type) {
    case "whatsapp": {
      const msg = encodeURIComponent(checkout.message || `Halo admin, saya ingin membeli ${title}`);
      return `https://wa.me/${checkout.phone}?text=${msg}`;
    }
    case "telegram": {
      const msg = encodeURIComponent(checkout.message || `Halo, saya ingin membeli ${title}`);
      return `https://t.me/${checkout.username}?text=${msg}`;
    }
    case "payment_gateway":
      return checkout.url || "#";
    default:
      return "#";
  }
}

export function getRelatedProducts(currentId: number, count = 5): Product[] {
  const others = products.filter(p => p.id !== currentId);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function buildDiscoveryQueue(currentProduct: Product): Product[] {
  const others = products.filter(p => p.id !== currentProduct.id);
  const currentTags = new Set(currentProduct.tags);
  
  const related = others.filter(p => p.tags.some(t => currentTags.has(t)));
  const rest = others.filter(p => !p.tags.some(t => currentTags.has(t)));
  const shuffledRest = [...rest].sort(() => Math.random() - 0.5);
  
  return [...related, ...shuffledRest];
}
