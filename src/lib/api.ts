import { supabase, isSupabaseConfigured } from "./supabase";
import {
  SITES,
  GUARDS,
  CALLOUTS,
  ROVERS,
  TONIGHT_SCHEDULE,
  SIM_TIMELINE,
} from "./data";
import type {
  Site,
  Guard,
  CallOut,
  Rover,
  ScheduleEntry,
  SimEvent,
} from "./types";
import type { ShiftRow, CascadeEventRow } from "./database.types";

class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function handleError(error: { message: string; code?: string }): never {
  throw new ApiError(error.message, error.code);
}

// ---------- Sites ----------

export async function getSites(): Promise<Site[]> {
  if (!isSupabaseConfigured) return SITES;

  const { data, error } = await supabase!
    .from("sites")
    .select("id, name, addr, armed, tier")
    .order("name");

  if (error) handleError(error);
  return data;
}

export async function getSiteById(id: number): Promise<Site | null> {
  if (!isSupabaseConfigured) return SITES.find((s) => s.id === id) ?? null;

  const { data, error } = await supabase!
    .from("sites")
    .select("id, name, addr, armed, tier")
    .eq("id", id)
    .maybeSingle();

  if (error) handleError(error);
  return data;
}

export async function updateSite(
  id: number,
  updates: Partial<Pick<Site, "name" | "addr" | "armed" | "tier">>,
): Promise<Site> {
  if (!isSupabaseConfigured) {
    const site = SITES.find((s) => s.id === id);
    if (!site) throw new ApiError("Site not found");
    return { ...site, ...updates };
  }

  const { data, error } = await supabase!
    .from("sites")
    .update(updates)
    .eq("id", id)
    .select("id, name, addr, armed, tier")
    .single();

  if (error) handleError(error);
  return data;
}

// ---------- Guards ----------

function mapGuardRow(g: {
  id: number;
  name: string;
  role: string;
  armed: boolean;
  grs: number;
  hrs: number;
  max: number;
  last_out: string | null;
  status: string;
}): Guard {
  return {
    id: g.id,
    name: g.name,
    role: g.role,
    armed: g.armed,
    grs: g.grs,
    hrs: g.hrs,
    max: g.max,
    lastOut: g.last_out,
    status: g.status as Guard["status"],
  };
}

export async function getGuards(): Promise<Guard[]> {
  if (!isSupabaseConfigured) return GUARDS;

  const { data, error } = await supabase!
    .from("guards")
    .select("id, name, role, armed, grs, hrs, max, last_out, status")
    .order("grs", { ascending: false });

  if (error) handleError(error);
  return data.map(mapGuardRow);
}

export async function getGuardById(id: number): Promise<Guard | null> {
  if (!isSupabaseConfigured) return GUARDS.find((g) => g.id === id) ?? null;

  const { data, error } = await supabase!
    .from("guards")
    .select("id, name, role, armed, grs, hrs, max, last_out, status")
    .eq("id", id)
    .maybeSingle();

  if (error) handleError(error);
  if (!data) return null;
  return mapGuardRow(data);
}

export async function updateGuard(
  id: number,
  updates: Partial<{
    name: string;
    role: string;
    armed: boolean;
    grs: number;
    hrs: number;
    max: number;
    last_out: string | null;
    status: Guard["status"];
  }>,
): Promise<Guard> {
  if (!isSupabaseConfigured) {
    const guard = GUARDS.find((g) => g.id === id);
    if (!guard) throw new ApiError("Guard not found");
    return { ...guard, ...updates } as Guard;
  }

  const { data, error } = await supabase!
    .from("guards")
    .update(updates)
    .eq("id", id)
    .select("id, name, role, armed, grs, hrs, max, last_out, status")
    .single();

  if (error) handleError(error);
  return mapGuardRow(data);
}

// ---------- Call-Outs ----------

export async function getCallOuts(): Promise<CallOut[]> {
  if (!isSupabaseConfigured) return CALLOUTS;

  const { data, error } = await supabase!
    .from("call_outs")
    .select("day, site, guard, time, armed, resolved, fill, by")
    .order("created_at", { ascending: true });

  if (error) handleError(error);
  return data;
}

export async function createCallOut(
  callOut: Omit<CallOut, "resolved" | "fill" | "by">,
): Promise<CallOut> {
  if (!isSupabaseConfigured) {
    return { ...callOut, resolved: false, fill: null, by: null };
  }

  const { data, error } = await supabase!
    .from("call_outs")
    .insert({
      day: callOut.day,
      site: callOut.site,
      guard: callOut.guard,
      time: callOut.time,
      armed: callOut.armed,
      resolved: false,
      fill: null,
      by: null,
    })
    .select("day, site, guard, time, armed, resolved, fill, by")
    .single();

  if (error) handleError(error);
  return data;
}

export async function resolveCallOut(
  id: number,
  fill: number,
  by: string,
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase!
    .from("call_outs")
    .update({ resolved: true, fill, by })
    .eq("id", id);

  if (error) handleError(error);
}

// ---------- Shifts ----------

export async function getShifts(): Promise<ShiftRow[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase!
    .from("shifts")
    .select("*")
    .order("start_time", { ascending: false });

  if (error) handleError(error);
  return data;
}

export async function getShiftsBySite(siteId: number): Promise<ShiftRow[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase!
    .from("shifts")
    .select("*")
    .eq("site_id", siteId)
    .order("start_time", { ascending: false });

  if (error) handleError(error);
  return data;
}

export async function createShift(
  shift: Pick<ShiftRow, "site_id" | "guard_id" | "start_time">,
): Promise<ShiftRow> {
  if (!isSupabaseConfigured) throw new ApiError("Supabase not configured");

  const { data, error } = await supabase!
    .from("shifts")
    .insert({
      site_id: shift.site_id,
      guard_id: shift.guard_id,
      start_time: shift.start_time,
      status: "scheduled",
    })
    .select("*")
    .single();

  if (error) handleError(error);
  return data;
}

// ---------- Cascade Events ----------

export async function getCascadeEvents(
  callOutId: number,
): Promise<CascadeEventRow[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase!
    .from("cascade_events")
    .select("*")
    .eq("call_out_id", callOutId)
    .order("contacted_at", { ascending: true });

  if (error) handleError(error);
  return data;
}

export async function createCascadeEvent(
  event: Pick<CascadeEventRow, "call_out_id" | "guard_id" | "contacted_at">,
): Promise<CascadeEventRow> {
  if (!isSupabaseConfigured) throw new ApiError("Supabase not configured");

  const { data, error } = await supabase!
    .from("cascade_events")
    .insert({
      call_out_id: event.call_out_id,
      guard_id: event.guard_id,
      contacted_at: event.contacted_at,
      response: "pending",
    })
    .select("*")
    .single();

  if (error) handleError(error);
  return data;
}

// ---------- Rovers ----------

export async function getRovers(): Promise<Rover[]> {
  if (!isSupabaseConfigured) return ROVERS;
  // Future: Supabase query
  return ROVERS;
}

// ---------- Schedule ----------

export async function getTonightSchedule(): Promise<ScheduleEntry[]> {
  if (!isSupabaseConfigured) return TONIGHT_SCHEDULE;
  // Future: Supabase query
  return TONIGHT_SCHEDULE;
}

// ---------- Simulation ----------

export async function getSimTimeline(): Promise<SimEvent[]> {
  if (!isSupabaseConfigured) return SIM_TIMELINE;
  // Future: Supabase query
  return SIM_TIMELINE;
}

export { ApiError };
