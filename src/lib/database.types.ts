export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      sites: {
        Row: {
          id: number;
          name: string;
          addr: string;
          armed: boolean;
          tier: "A" | "B";
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          addr: string;
          armed?: boolean;
          tier?: "A" | "B";
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          addr?: string;
          armed?: boolean;
          tier?: "A" | "B";
          created_at?: string;
        };
      };
      guards: {
        Row: {
          id: number;
          name: string;
          role: string;
          armed: boolean;
          grs: number;
          hrs: number;
          max: number;
          last_out: string | null;
          status: "on-duty" | "off-duty" | "training" | "inactive";
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          role: string;
          armed?: boolean;
          grs?: number;
          hrs?: number;
          max?: number;
          last_out?: string | null;
          status?: "on-duty" | "off-duty" | "training" | "inactive";
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          role?: string;
          armed?: boolean;
          grs?: number;
          hrs?: number;
          max?: number;
          last_out?: string | null;
          status?: "on-duty" | "off-duty" | "training" | "inactive";
          created_at?: string;
        };
      };
      call_outs: {
        Row: {
          id: number;
          day: string;
          site: string;
          guard: string;
          time: string;
          armed: boolean;
          resolved: boolean;
          fill: number | null;
          by: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          day: string;
          site: string;
          guard: string;
          time: string;
          armed?: boolean;
          resolved?: boolean;
          fill?: number | null;
          by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          day?: string;
          site?: string;
          guard?: string;
          time?: string;
          armed?: boolean;
          resolved?: boolean;
          fill?: number | null;
          by?: string | null;
          created_at?: string;
        };
      };
      shifts: {
        Row: {
          id: number;
          site_id: number;
          guard_id: number;
          start_time: string;
          end_time: string | null;
          status: "scheduled" | "active" | "completed" | "no-show";
          created_at: string;
        };
        Insert: {
          id?: number;
          site_id: number;
          guard_id: number;
          start_time: string;
          end_time?: string | null;
          status?: "scheduled" | "active" | "completed" | "no-show";
          created_at?: string;
        };
        Update: {
          id?: number;
          site_id?: number;
          guard_id?: number;
          start_time?: string;
          end_time?: string | null;
          status?: "scheduled" | "active" | "completed" | "no-show";
          created_at?: string;
        };
      };
      cascade_events: {
        Row: {
          id: number;
          call_out_id: number;
          guard_id: number;
          contacted_at: string;
          response: "accepted" | "declined" | "no-answer" | "pending";
          response_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          call_out_id: number;
          guard_id: number;
          contacted_at: string;
          response?: "accepted" | "declined" | "no-answer" | "pending";
          response_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          call_out_id?: number;
          guard_id?: number;
          contacted_at?: string;
          response?: "accepted" | "declined" | "no-answer" | "pending";
          response_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      guard_status: "on-duty" | "off-duty" | "training" | "inactive";
      shift_status: "scheduled" | "active" | "completed" | "no-show";
      cascade_response: "accepted" | "declined" | "no-answer" | "pending";
      site_tier: "A" | "B";
    };
  };
}

// Convenience type aliases for Row types
export type SiteRow = Database["public"]["Tables"]["sites"]["Row"];
export type GuardRow = Database["public"]["Tables"]["guards"]["Row"];
export type CallOutRow = Database["public"]["Tables"]["call_outs"]["Row"];
export type ShiftRow = Database["public"]["Tables"]["shifts"]["Row"];
export type CascadeEventRow = Database["public"]["Tables"]["cascade_events"]["Row"];
