import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, RefreshCw } from "lucide-react";

interface ActivityRow {
  id: string;
  activity_type: string;
  random_data: string | null;
  created_at: string;
}

export default function Supabsen() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("supabase_activity")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) setError(error.message);
    else setRows((data as ActivityRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isActive = rows.length > 0 &&
    Date.now() - new Date(rows[0].created_at).getTime() < 25 * 60 * 60 * 1000;

  const handlePing = async () => {
    setPinging(true);
    setError(null);
    try {
      const { error } = await supabase.functions.invoke("daily-activity", {
        body: { trigger: "manual" },
      });
      if (error) throw error;
      await new Promise(r => setTimeout(r, 500));
      await fetchData();
    } catch (e: any) {
      setError(e.message);
    }
    setPinging(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-4 py-10 space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">System Pulse Monitor</h1>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            {loading ? (
              <span className="text-sm text-muted-foreground">Checking...</span>
            ) : (
              <Badge variant={isActive ? "default" : "destructive"} className="text-sm px-3 py-1">
                {isActive ? "✅ Active" : "🔴 Warning"}
              </Badge>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button size="sm" onClick={handlePing} disabled={pinging}>
                {pinging ? "Pinging..." : "Ping Manually"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Log List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity (Last 10)</CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length === 0 && !loading ? (
              <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {rows.map(r => (
                  <div key={r.id} className="flex items-start justify-between gap-4 border-b border-border pb-2 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground truncate">{r.random_data}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
