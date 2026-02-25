import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://soyo.lovable.app";
const STORE_NAME = "SOYO STORE";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return new Response("Missing slug param", { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !product) {
    return new Response("Not found", { status: 404, headers: corsHeaders });
  }

  const t = esc(product.title);
  const d = esc((product.description || "").substring(0, 160));
  const img = esc(product.image_urls?.[0] || "");
  const p = (product.price || "").replace(/[^\d]/g, "");
  const can = BASE_URL + "/p/" + product.slug;

  const html = `<!DOCTYPE html><html lang="id"><head>
<meta charset="UTF-8"/><title>${t} | ${STORE_NAME}</title>
<meta name="description" content="${d}"/>
<meta property="og:type" content="product"/>
<meta property="og:title" content="${t}"/>
<meta property="og:description" content="${d}"/>
<meta property="og:image" content="${img}"/>
<meta property="og:url" content="${can}"/>
<meta property="product:price:amount" content="${p}"/>
<meta property="product:price:currency" content="IDR"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${t}"/>
<meta name="twitter:image" content="${img}"/>
<meta http-equiv="refresh" content="0;url=${can}"/>
</head><body><a href="${can}">${t}</a>
<script>window.location.replace("${can}")</script></body></html>`;

  return new Response(html, {
    headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
  });
});
