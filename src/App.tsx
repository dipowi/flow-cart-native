import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { fetchStoreSettings } from "@/data/products";
import Index from "./pages/Index";

const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Supabsen = lazy(() => import("./pages/Supabsen"));

const queryClient = new QueryClient();

function DynamicFavicon() {
  const { data: settings } = useQuery({
    queryKey: ["store-settings"],
    queryFn: fetchStoreSettings,
  });

  useEffect(() => {
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings?.logoUrl || '/favicon.ico';
  }, [settings?.logoUrl]);

  return null;
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DynamicFavicon />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/p/:slug" element={<Suspense fallback={<div className="min-h-screen bg-background" />}><ProductDetail /></Suspense>} />
            <Route path="/pdidin" element={<Suspense fallback={<div className="min-h-screen bg-background" />}><Admin /></Suspense>} />
            <Route path="/supabsen" element={<Suspense fallback={<div className="min-h-screen bg-background" />}><Supabsen /></Suspense>} />
            <Route path="*" element={<Suspense fallback={null}><NotFound /></Suspense>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
