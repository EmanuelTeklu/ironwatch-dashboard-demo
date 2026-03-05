import { useQuery } from "@tanstack/react-query";
import { getSites } from "@/lib/api";
import type { Site } from "@/lib/types";

export function useSites() {
  return useQuery<Site[], Error>({
    queryKey: ["sites"],
    queryFn: getSites,
    staleTime: 30_000,
  });
}
