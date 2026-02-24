import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStoreSettings } from "@/data/products";
import type { StoreSettings } from "@/data/products";
import AdminLogin from "./AdminLogin";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings, Package, Plus, Pencil, Trash2, LogOut, X, GripVertical, Pin, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

// ─── Global Settings Tab ─────────────────────────────────────────────────────
function GlobalSettingsTab() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["store-settings"],
    queryFn: fetchStoreSettings,
  });

  const [type, setType] = useState("whatsapp");
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");
  const [isRandom, setIsRandom] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [headerAlign, setHeaderAlign] = useState<string>("left");

  useEffect(() => {
    if (settings) {
      setType(settings.globalCheckoutType);
      setTarget(settings.globalCheckoutTarget);
      setMessage(settings.globalCheckoutMessage ?? "");
      setIsRandom(settings.isHomepageRandom);
      setStoreName(settings.storeName ?? "");
      setStoreDesc(settings.storeDescription ?? "");
      setLogoUrl(settings.logoUrl ?? "");
      setHeaderAlign(settings.headerAlignment ?? "left");
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!settings) return;
      const { error } = await supabase
        .from("store_settings")
        .update({
          global_checkout_type: type,
          global_checkout_target: target,
          global_checkout_message: message || null,
          is_homepage_random: isRandom,
          store_name: storeName || "Toko Cokotq",
          store_description: storeDesc || "Belanja mudah, harga bersahabat",
          logo_url: logoUrl || null,
          header_alignment: headerAlign,
        } as any)
        .eq("id", settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      toast.success("Pengaturan global berhasil disimpan");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-8 text-muted-foreground text-sm">Memuat...</div>;

  return (
    <div className="space-y-6">
      {/* Header Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tampilan Header</CardTitle>
          <CardDescription>Atur nama toko, deskripsi, logo, dan posisi header di halaman utama.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nama Toko</Label>
              <Input value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Toko Cokotq" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Toko</Label>
              <Input value={storeDesc} onChange={e => setStoreDesc(e.target.value)} placeholder="Belanja mudah, harga bersahabat" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>URL Logo (opsional)</Label>
            <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
            {logoUrl && (
              <div className="mt-2">
                <img src={logoUrl} alt="Preview" className="h-10 w-10 rounded-xl object-cover bg-muted" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Posisi Header</Label>
            <ToggleGroup type="single" value={headerAlign} onValueChange={v => v && setHeaderAlign(v)} className="justify-start">
              <ToggleGroupItem value="left" aria-label="Kiri" className="gap-1.5">
                <AlignLeft className="h-4 w-4" /> Kiri
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Tengah" className="gap-1.5">
                <AlignCenter className="h-4 w-4" /> Tengah
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Kanan" className="gap-1.5">
                <AlignRight className="h-4 w-4" /> Kanan
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </CardContent>
      </Card>

      {/* Checkout Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pengaturan Checkout Global</CardTitle>
          <CardDescription>Jika produk tidak punya checkout khusus, pengaturan ini yang dipakai.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipe Checkout</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="link">Link Eksternal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target ({type === "whatsapp" ? "Nomor WA" : type === "telegram" ? "Username" : "URL"})</Label>
              <Input value={target} onChange={e => setTarget(e.target.value)} placeholder={type === "whatsapp" ? "6281234567890" : type === "telegram" ? "username" : "https://..."} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Pesan Otomatis (opsional)</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Halo admin, saya ingin bertanya..." rows={3} />
          </div>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </CardContent>
      </Card>

      {/* Homepage Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pengaturan Tampilan Beranda</CardTitle>
          <CardDescription>Kontrol bagaimana produk ditampilkan di halaman utama.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Acak Urutan Produk di Beranda</Label>
              <p className="text-xs text-muted-foreground">Produk yang di-pin tetap di atas. Sisanya diacak setiap kali halaman dimuat.</p>
            </div>
            <Switch checked={isRandom} onCheckedChange={setIsRandom} />
          </div>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="mt-4">
            {mutation.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Product Form (Add/Edit) — Wide 2-Column Layout ─────────────────────────
interface ProductFormData {
  title: string;
  slug: string;
  price: string;
  original_price: string;
  discount_percentage: string;
  image_urls: string[];
  description: string;
  tags: string;
  is_pinned: boolean;
  useCustomCheckout: boolean;
  checkout_type: string;
  checkout_target: string;
  checkout_message: string;
  order_index: number;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const emptyForm: ProductFormData = {
  title: "", slug: "", price: "", original_price: "", discount_percentage: "",
  image_urls: [""], description: "", tags: "",
  is_pinned: false, useCustomCheckout: false, checkout_type: "whatsapp",
  checkout_target: "", checkout_message: "", order_index: 0,
};

/** Parse "Rp 100.000" or "100000" → number */
function parseRupiah(val: string): number {
  const n = parseInt(val.replace(/[^\d]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

/** Format number → "Rp 100.000" */
function formatRupiah(n: number): string {
  if (!n) return "";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function ProductFormDialog({ product, onClose }: { product?: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const isEdit = !!product;

  const [form, setForm] = useState<ProductFormData>(() => {
    if (!product) return emptyForm;
    return {
      title: product.title ?? "",
      slug: product.slug ?? "",
      price: product.price ?? "",
      original_price: product.original_price ?? "",
      discount_percentage: product.discount_percentage ?? "",
      image_urls: product.image_urls?.length ? product.image_urls : [""],
      description: product.description ?? "",
      tags: (product.tags ?? []).join(", "),
      is_pinned: product.is_pinned ?? false,
      useCustomCheckout: !!(product.checkout_type && product.checkout_target),
      checkout_type: product.checkout_type ?? "whatsapp",
      checkout_target: product.checkout_target ?? "",
      checkout_message: product.checkout_message ?? "",
      order_index: product.order_index ?? 0,
    };
  });

  const set = (key: keyof ProductFormData, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  // ── Smart Pricing Calculator ──
  const handlePriceChange = (raw: string) => {
    const finalPrice = parseRupiah(raw);
    const formatted = formatRupiah(finalPrice);
    set("price", formatted);
    // Auto-calc discount if original exists
    const orig = parseRupiah(form.original_price);
    if (orig > 0 && finalPrice > 0 && finalPrice < orig) {
      set("discount_percentage", Math.round(((orig - finalPrice) / orig) * 100) + "%");
    }
  };

  const handleOriginalPriceChange = (raw: string) => {
    const orig = parseRupiah(raw);
    const formatted = formatRupiah(orig);
    set("original_price", formatted);
    // Auto-calc discount if final exists
    const finalPrice = parseRupiah(form.price);
    if (orig > 0 && finalPrice > 0 && finalPrice < orig) {
      set("discount_percentage", Math.round(((orig - finalPrice) / orig) * 100) + "%");
    }
  };

  const handleDiscountChange = (raw: string) => {
    const pct = parseInt(raw.replace(/[^\d]/g, ""), 10);
    set("discount_percentage", isNaN(pct) ? "" : pct + "%");
    // Auto-calc final price from original
    const orig = parseRupiah(form.original_price);
    if (orig > 0 && !isNaN(pct) && pct > 0 && pct < 100) {
      const finalPrice = Math.round(orig * (1 - pct / 100));
      set("price", formatRupiah(finalPrice));
    }
  };

  const addImageUrl = () => set("image_urls", [...form.image_urls, ""]);
  const removeImageUrl = (i: number) => set("image_urls", form.image_urls.filter((_, idx) => idx !== i));
  const setImageUrl = (i: number, v: string) => {
    const next = [...form.image_urls];
    next[i] = v;
    set("image_urls", next);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        slug: form.slug,
        price: form.price,
        original_price: form.original_price || null,
        discount_percentage: form.discount_percentage || null,
        image_urls: form.image_urls.filter(Boolean),
        description: form.description,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        is_pinned: form.is_pinned,
        order_index: form.order_index,
        checkout_type: form.useCustomCheckout ? form.checkout_type : null,
        checkout_target: form.useCustomCheckout ? form.checkout_target : null,
        checkout_message: form.useCustomCheckout ? (form.checkout_message || null) : null,
      };

      if (isEdit) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-count"] });
      toast.success(isEdit ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan");
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="max-h-[75vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column — Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Produk *</Label>
            <Input value={form.title} maxLength={120} className="h-12" onChange={e => {
              const title = e.target.value;
              set("title", title);
              if (!isEdit || form.slug === generateSlug(form.title)) {
                set("slug", generateSlug(title));
              }
            }} placeholder="Nama produk..." />
            <p className="text-xs text-muted-foreground text-right">{form.title.length}/120</p>
          </div>
          <div className="space-y-2">
            <Label>Slug (URL)</Label>
            <Input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="nama-produk" className="font-mono text-sm h-12" />
            <p className="text-xs text-muted-foreground">URL: /p/{form.slug || "..."}</p>
          </div>
          <div className="space-y-2">
            <Label>Deskripsi *</Label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={5} placeholder="Deskripsi produk..." />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Harga Asli</Label>
              <Input value={form.original_price} onChange={e => handleOriginalPriceChange(e.target.value)} placeholder="Rp 65.000" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Diskon</Label>
              <Input value={form.discount_percentage} onChange={e => handleDiscountChange(e.target.value)} placeholder="30%" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Harga Final *</Label>
              <Input value={form.price} onChange={e => handlePriceChange(e.target.value)} placeholder="Rp 45.000" className="h-12 font-semibold text-primary" />
            </div>
          </div>
        </div>

        {/* Right Column — Media & Config */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>URL Gambar</Label>
            {form.image_urls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <Input value={url} onChange={e => setImageUrl(i, e.target.value)} placeholder="https://..." className="flex-1" />
                {form.image_urls.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeImageUrl(i)} className="shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addImageUrl}>
              <Plus className="h-3 w-3 mr-1" /> Tambah Gambar
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Tags (pisah koma)</Label>
            <Input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="fashion, promo" />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">📌 Pin Produk</Label>
              <p className="text-xs text-muted-foreground">Tampilkan selalu di bagian atas</p>
            </div>
            <Switch checked={form.is_pinned} onCheckedChange={v => set("is_pinned", v)} />
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center gap-3">
              <Switch checked={form.useCustomCheckout} onCheckedChange={v => set("useCustomCheckout", v)} />
              <Label className="text-sm">Checkout khusus produk ini</Label>
            </div>
            {form.useCustomCheckout && (
              <div className="grid grid-cols-2 gap-3 pl-1">
                <div className="space-y-2">
                  <Label className="text-xs">Tipe</Label>
                  <Select value={form.checkout_type} onValueChange={v => set("checkout_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Target</Label>
                  <Input value={form.checkout_target} onChange={e => set("checkout_target", e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-xs">Pesan</Label>
                  <Input value={form.checkout_message} onChange={e => set("checkout_message", e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-5 border-t border-border mt-5">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Menyimpan..." : isEdit ? "Perbarui" : "Tambah Produk"}
        </Button>
      </div>
    </div>
  );
}

// ─── Products Management Tab with Drag & Drop ────────────────────────────────
function ProductsTab() {
  const queryClient = useQueryClient();
  const [editProduct, setEditProduct] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-count"] });
      toast.success("Produk berhasil dihapus");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const pinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { error } = await supabase.from("products").update({ is_pinned: pinned }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; order_index: number }[]) => {
      // Batch update order indices
      for (const u of updates) {
        const { error } = await supabase.from("products").update({ order_index: u.order_index }).eq("id", u.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const items = [...products];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    // Update order_index for all items
    const updates = items.map((item, idx) => ({ id: item.id, order_index: idx }));
    // Optimistic update
    queryClient.setQueryData(["admin-products"], items.map((item, idx) => ({ ...item, order_index: idx })));
    reorderMutation.mutate(updates);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{products.length} Produk</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Tambah Produk</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8">
            <DialogHeader><DialogTitle>Tambah Produk Baru</DialogTitle></DialogHeader>
            <ProductFormDialog onClose={() => setShowAdd(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground p-4">Memuat...</div>
      ) : (
        <Card>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead className="hidden sm:table-cell">Harga</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="w-28 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <Droppable droppableId="products">
                {(provided) => (
                  <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                    {products.map((p, index) => (
                      <Draggable key={p.id} draggableId={p.id} index={index}>
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${snapshot.isDragging ? "bg-accent shadow-lg" : ""} ${p.is_pinned ? "bg-accent/40" : ""}`}
                          >
                            <TableCell>
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">{p.order_index}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {p.image_urls?.[0] && (
                                  <img src={p.image_urls[0]} alt="" className="h-10 w-10 rounded-lg object-cover bg-muted flex-shrink-0" />
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm line-clamp-1">{p.title}</span>
                                  {p.is_pinned && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">📌</Badge>}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm">{p.price}</TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                              {p.checkout_type ? `${p.checkout_type}` : "Global"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => pinMutation.mutate({ id: p.id, pinned: !p.is_pinned })}
                                  title={p.is_pinned ? "Lepas pin" : "Pin produk"}
                                  className={p.is_pinned ? "text-primary" : "text-muted-foreground"}
                                >
                                  <Pin className="h-4 w-4" />
                                </Button>
                                <Dialog open={editProduct?.id === p.id} onOpenChange={open => !open && setEditProduct(null)}>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => setEditProduct(p)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8">
                                    <DialogHeader><DialogTitle>Edit Produk</DialogTitle></DialogHeader>
                                    <ProductFormDialog product={editProduct} onClose={() => setEditProduct(null)} />
                                  </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="icon" onClick={() => { if (confirm("Hapus produk ini?")) deleteMutation.mutate(p.id); }}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                )}
              </Droppable>
            </Table>
          </DragDropContext>
        </Card>
      )}
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .then(({ data }) => {
            setAuthed(!!(data && data.length > 0));
            setChecking(false);
          });
      } else {
        setAuthed(false);
        setChecking(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .then(({ data }) => {
            setAuthed(!!(data && data.length > 0));
            setChecking(false);
          });
      } else {
        setChecking(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthed(false);
  }, []);

  if (checking) return <div className="min-h-screen bg-background" />;
  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Kelola produk dan pengaturan toko</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" /> Keluar
          </Button>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="products" className="gap-1.5">
              <Package className="h-4 w-4" /> Produk
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              <Settings className="h-4 w-4" /> Pengaturan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products"><ProductsTab /></TabsContent>
          <TabsContent value="settings"><GlobalSettingsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
