import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStoreSettings } from "@/data/products";
import AdminLogin from "./AdminLogin";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Package, Plus, Pencil, Trash2, LogOut, X } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    if (settings) {
      setType(settings.globalCheckoutType);
      setTarget(settings.globalCheckoutTarget);
      setMessage(settings.globalCheckoutMessage ?? "");
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
        })
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
  );
}

// ─── Product Form (Add/Edit) ─────────────────────────────────────────────────
interface ProductFormData {
  title: string;
  price: string;
  original_price: string;
  discount_percentage: string;
  image_urls: string[];
  description: string;
  tags: string;
  useCustomCheckout: boolean;
  checkout_type: string;
  checkout_target: string;
  checkout_message: string;
  sort_order: number;
}

const emptyForm: ProductFormData = {
  title: "", price: "", original_price: "", discount_percentage: "",
  image_urls: [""], description: "", tags: "",
  useCustomCheckout: false, checkout_type: "whatsapp", checkout_target: "", checkout_message: "",
  sort_order: 0,
};

function ProductFormDialog({ product, onClose }: { product?: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const isEdit = !!product;

  const [form, setForm] = useState<ProductFormData>(() => {
    if (!product) return emptyForm;
    return {
      title: product.title ?? "",
      price: product.price ?? "",
      original_price: product.original_price ?? "",
      discount_percentage: product.discount_percentage ?? "",
      image_urls: product.image_urls?.length ? product.image_urls : [""],
      description: product.description ?? "",
      tags: (product.tags ?? []).join(", "),
      useCustomCheckout: !!(product.checkout_type && product.checkout_target),
      checkout_type: product.checkout_type ?? "whatsapp",
      checkout_target: product.checkout_target ?? "",
      checkout_message: product.checkout_message ?? "",
      sort_order: product.sort_order ?? 0,
    };
  });

  const set = (key: keyof ProductFormData, val: any) => setForm(prev => ({ ...prev, [key]: val }));

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
        price: form.price,
        original_price: form.original_price || null,
        discount_percentage: form.discount_percentage || null,
        image_urls: form.image_urls.filter(Boolean),
        description: form.description,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        checkout_type: form.useCustomCheckout ? form.checkout_type : null,
        checkout_target: form.useCustomCheckout ? form.checkout_target : null,
        checkout_message: form.useCustomCheckout ? (form.checkout_message || null) : null,
        sort_order: form.sort_order,
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
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nama Produk *</Label>
          <Input value={form.title} onChange={e => set("title", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Harga *</Label>
          <Input value={form.price} onChange={e => set("price", e.target.value)} placeholder="Rp 45.000" />
        </div>
        <div className="space-y-2">
          <Label>Harga Asli</Label>
          <Input value={form.original_price} onChange={e => set("original_price", e.target.value)} placeholder="Rp 65.000" />
        </div>
        <div className="space-y-2">
          <Label>Diskon</Label>
          <Input value={form.discount_percentage} onChange={e => set("discount_percentage", e.target.value)} placeholder="30%" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>URL Gambar</Label>
        {form.image_urls.map((url, i) => (
          <div key={i} className="flex gap-2">
            <Input value={url} onChange={e => setImageUrl(i, e.target.value)} placeholder="https://..." className="flex-1" />
            {form.image_urls.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeImageUrl(i)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addImageUrl} className="mt-1">
          <Plus className="h-3 w-3 mr-1" /> Tambah Gambar
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Deskripsi *</Label>
        <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Tags (pisah koma)</Label>
          <Input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="fashion, promo" />
        </div>
        <div className="space-y-2">
          <Label>Urutan</Label>
          <Input type="number" value={form.sort_order} onChange={e => set("sort_order", parseInt(e.target.value) || 0)} />
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-4">
        <div className="flex items-center gap-3">
          <Switch checked={form.useCustomCheckout} onCheckedChange={v => set("useCustomCheckout", v)} />
          <Label>Checkout khusus produk ini</Label>
        </div>
        {form.useCustomCheckout && (
          <div className="grid gap-4 sm:grid-cols-2 pl-1">
            <div className="space-y-2">
              <Label>Tipe</Label>
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
              <Label>Target</Label>
              <Input value={form.checkout_target} onChange={e => set("checkout_target", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Pesan</Label>
              <Input value={form.checkout_message} onChange={e => set("checkout_message", e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Menyimpan..." : isEdit ? "Perbarui" : "Tambah Produk"}
        </Button>
      </div>
    </div>
  );
}

// ─── Products Management Tab ─────────────────────────────────────────────────
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
        .order("sort_order", { ascending: true });
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{products.length} Produk</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Tambah Produk</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Tambah Produk Baru</DialogTitle></DialogHeader>
            <ProductFormDialog onClose={() => setShowAdd(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground p-4">Memuat...</div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead className="hidden sm:table-cell">Harga</TableHead>
                <TableHead className="hidden md:table-cell">Checkout</TableHead>
                <TableHead className="w-24 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground text-xs">{p.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.image_urls?.[0] && (
                        <img src={p.image_urls[0]} alt="" className="h-10 w-10 rounded-lg object-cover bg-muted flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm line-clamp-1">{p.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{p.price}</TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {p.checkout_type ? `${p.checkout_type}` : "Global"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Dialog open={editProduct?.id === p.id} onOpenChange={open => !open && setEditProduct(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditProduct(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
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
              ))}
            </TableBody>
          </Table>
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
        // Verify admin role
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
      <div className="mx-auto max-w-4xl px-4 py-8">
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
