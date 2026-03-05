import { useQuery } from "@tanstack/react-query";
import { getSimTimeline } from "@/lib/api";
import type { SimEvent } from "@/lib/types";

export function useSimTimeline() {
  return useQuery<SimEvent[], Error>({
    queryKey: ["simTimeline"],
    queryFn: getSimTimeline,
    staleTime: 30_000,
  });
}
