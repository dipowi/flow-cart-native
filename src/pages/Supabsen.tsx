import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Supabsen() {
  const [status, setStatus] = useState("Sending heartbeat...");

  useEffect(() => {
    let cancelled = false;

    async function beat() {
      try {
        const { data, error: insertErr } = await supabase
          .from("heartbeat")
          .insert({ last_beat: new Date().toISOString() })
          .select("id")
          .single();

        if (insertErr) throw insertErr;

        await new Promise(r => setTimeout(r, 1000));

        const { error: deleteErr } = await supabase
          .from("heartbeat")
          .delete()
          .eq("id", data.id);

        if (deleteErr) throw deleteErr;

        if (!cancelled) {
          setStatus(`System Active. Heartbeat received at ${new Date().toLocaleString()}`);
        }
      } catch (e: any) {
        if (!cancelled) setStatus(`Error: ${e.message}`);
      }
    }

    beat();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-foreground text-sm">{status}</p>
    </div>
  );
}
