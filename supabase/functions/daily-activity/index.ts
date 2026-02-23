import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // 1. Cleanup: keep only latest 10 rows
    const { data: keepIds } = await supabase
      .from("supabase_activity")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(10);

    if (keepIds && keepIds.length > 0) {
      const idsToKeep = keepIds.map((r: any) => r.id);
      await supabase
        .from("supabase_activity")
        .delete()
        .not("id", "in", `(${idsToKeep.join(",")})`);
    }

    // 2. Insert new activity
    const randomString = Math.random().toString(36).substring(7);
    const { error } = await supabase.from("supabase_activity").insert({
      activity_type: "daily-cron-maintenance",
      random_data: `Ping at ${new Date().toISOString()} - Hash: ${randomString}`,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Daily activity success", data: randomString }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
