import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TableName = "sites" | "guards" | "call_outs" | "shifts";

interface RealtimeConfig {
  readonly table: TableName;
  readonly queryKey: readonly string[];
}

const REALTIME_CONFIGS: readonly RealtimeConfig[] = [
  { table: "sites", queryKey: ["sites"] },
  { table: "call_outs", queryKey: ["callOuts"] },
  { table: "shifts", queryKey: ["shifts"] },
];

/**
 * Subscribe to Supabase realtime changes and invalidate
 * the corresponding React Query cache entries.
 */
export function useRealtimeSubscriptions() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sites" },
        (_payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          queryClient.invalidateQueries({ queryKey: ["sites"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "call_outs" },
        (_payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          queryClient.invalidateQueries({ queryKey: ["callOuts"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shifts" },
        (_payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          queryClient.invalidateQueries({ queryKey: ["shifts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export { REALTIME_CONFIGS };
