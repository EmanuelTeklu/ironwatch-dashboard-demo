import { useQuery } from "@tanstack/react-query";
import { getTonightSchedule } from "@/lib/api";
import type { ScheduleEntry } from "@/lib/types";

export function useSchedule() {
  return useQuery<ScheduleEntry[], Error>({
    queryKey: ["schedule"],
    queryFn: getTonightSchedule,
    staleTime: 30_000,
  });
}
