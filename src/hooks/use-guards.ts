import { useQuery } from "@tanstack/react-query";
import { getGuards } from "@/lib/api";
import type { Guard } from "@/lib/types";

export function useGuards() {
  return useQuery<Guard[], Error>({
    queryKey: ["guards"],
    queryFn: getGuards,
    staleTime: 30_000,
  });
}
