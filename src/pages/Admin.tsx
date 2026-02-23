import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function Admin() {
  // TODO: Add authentication guard in next iteration
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Halaman ini akan berisi panel manajemen produk. Login diperlukan untuk mengakses.
        </p>
        <Link to="/" className="inline-block text-primary font-medium text-sm hover:underline">
          ← Kembali ke Toko
        </Link>
      </div>
    </div>
  );
}
