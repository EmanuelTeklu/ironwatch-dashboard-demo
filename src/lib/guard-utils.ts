import { TONIGHT_SCHEDULE } from "./data";
import type { Guard } from "./types";

const scheduledGuardIds = new Set(TONIGHT_SCHEDULE.map((s) => s.guardId));

export function isOnCall(guard: Guard): boolean {
  return scheduledGuardIds.has(guard.id);
}

export function sortGuardsOnCallFirst(guards: readonly Guard[]): readonly Guard[] {
  return [...guards].sort((a, b) => {
    const aOnCall = isOnCall(a);
    const bOnCall = isOnCall(b);
    if (aOnCall && !bOnCall) return -1;
    if (!aOnCall && bOnCall) return 1;
    return b.grs - a.grs;
  });
}
