import { useQuery } from "@tanstack/react-query";
import { getCallOuts } from "@/lib/api";
import type { CallOut } from "@/lib/types";

export function useCallOuts() {
  return useQuery<CallOut[], Error>({
    queryKey: ["callOuts"],
    queryFn: getCallOuts,
    staleTime: 30_000,
  });
}
