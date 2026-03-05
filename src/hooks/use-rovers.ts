import { useQuery } from "@tanstack/react-query";
import { getRovers } from "@/lib/api";
import type { Rover } from "@/lib/types";

export function useRovers() {
  return useQuery<Rover[], Error>({
    queryKey: ["rovers"],
    queryFn: getRovers,
    staleTime: 30_000,
  });
}
