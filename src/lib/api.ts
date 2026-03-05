import { supabase } from "./supabase";
import type { Site, Guard, CallOut } from "./types";
import type { ShiftRow, CascadeEventRow } from "./database.types";

// Error wrapper for consistent error handling
class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string
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
  const { data, error } = await supabase
    .from("sites")
    .select("id, name, addr, armed, tier")
    .order("name");

  if (error) handleError(error);
  return data;
}

export async function getSiteById(id: number): Promise<Site | null> {
  const { data, error } = await supabase
    .from("sites")
    .select("id, name, addr, armed, tier")
    .eq("id", id)
    .maybeSingle();

  if (error) handleError(error);
  return data;
}

export async function updateSite(
  id: number,
  updates: Partial<Pick<Site, "name" | "addr" | "armed" | "tier">>
): Promise<Site> {
  const { data, error } = await supabase
    .from("sites")
    .update(updates)
    .eq("id", id)
    .select("id, name, addr, armed, tier")
    .single();

  if (error) handleError(error);
  return data;
}

// ---------- Guards ----------

export async function getGuards(): Promise<Guard[]> {
  const { data, error } = await supabase
    .from("guards")
    .select("id, name, role, armed, grs, hrs, max, last_out, status")
    .order("grs", { ascending: false });

  if (error) handleError(error);

  // Map snake_case DB column to camelCase TS field
  return data.map((g) => ({
    id: g.id,
    name: g.name,
    role: g.role,
    armed: g.armed,
    grs: g.grs,
    hrs: g.hrs,
    max: g.max,
    lastOut: g.last_out,
    status: g.status,
  }));
}

export async function getGuardById(id: number): Promise<Guard | null> {
  const { data, error } = await supabase
    .from("guards")
    .select("id, name, role, armed, grs, hrs, max, last_out, status")
    .eq("id", id)
    .maybeSingle();

  if (error) handleError(error);
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    role: data.role,
    armed: data.armed,
    grs: data.grs,
    hrs: data.hrs,
    max: data.max,
    lastOut: data.last_out,
    status: data.status,
  };
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
  }>
): Promise<Guard> {
  const { data, error } = await supabase
    .from("guards")
    .update(updates)
    .eq("id", id)
    .select("id, name, role, armed, grs, hrs, max, last_out, status")
    .single();

  if (error) handleError(error);

  return {
    id: data.id,
    name: data.name,
    role: data.role,
    armed: data.armed,
    grs: data.grs,
    hrs: data.hrs,
    max: data.max,
    lastOut: data.last_out,
    status: data.status,
  };
}

// ---------- Call-Outs ----------

export async function getCallOuts(): Promise<CallOut[]> {
  const { data, error } = await supabase
    .from("call_outs")
    .select("day, site, guard, time, armed, resolved, fill, by")
    .order("created_at", { ascending: true });

  if (error) handleError(error);
  return data;
}

export async function createCallOut(
  callOut: Omit<CallOut, "resolved" | "fill" | "by">
): Promise<CallOut> {
  const { data, error } = await supabase
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
  by: string
): Promise<void> {
  const { error } = await supabase
    .from("call_outs")
    .update({ resolved: true, fill, by })
    .eq("id", id);

  if (error) handleError(error);
}

// ---------- Shifts ----------

export async function getShifts(): Promise<ShiftRow[]> {
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .order("start_time", { ascending: false });

  if (error) handleError(error);
  return data;
}

export async function getShiftsBySite(siteId: number): Promise<ShiftRow[]> {
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .eq("site_id", siteId)
    .order("start_time", { ascending: false });

  if (error) handleError(error);
  return data;
}

export async function createShift(
  shift: Pick<ShiftRow, "site_id" | "guard_id" | "start_time">
): Promise<ShiftRow> {
  const { data, error } = await supabase
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
  callOutId: number
): Promise<CascadeEventRow[]> {
  const { data, error } = await supabase
    .from("cascade_events")
    .select("*")
    .eq("call_out_id", callOutId)
    .order("contacted_at", { ascending: true });

  if (error) handleError(error);
  return data;
}

export async function createCascadeEvent(
  event: Pick<CascadeEventRow, "call_out_id" | "guard_id" | "contacted_at">
): Promise<CascadeEventRow> {
  const { data, error } = await supabase
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

export { ApiError };
