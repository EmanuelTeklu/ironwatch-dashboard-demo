-- IronWatch Dashboard — Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables

-- Custom enum types
create type guard_status as enum ('on-duty', 'off-duty', 'training', 'inactive');
create type shift_status as enum ('scheduled', 'active', 'completed', 'no-show');
create type cascade_response as enum ('accepted', 'declined', 'no-answer', 'pending');
create type site_tier as enum ('A', 'B');

-- Sites table
create table sites (
  id          integer primary key,
  name        text not null,
  addr        text not null,
  armed       boolean not null default false,
  tier        site_tier not null default 'B',
  created_at  timestamptz not null default now()
);

-- Guards table
create table guards (
  id          integer primary key,
  name        text not null,
  role        text not null,
  armed       boolean not null default false,
  grs         integer not null default 0,
  hrs         integer not null default 0,
  max         integer not null default 40,
  last_out    text,
  status      guard_status not null default 'off-duty',
  created_at  timestamptz not null default now()
);

-- Call-outs table
create table call_outs (
  id          serial primary key,
  day         text not null,
  site        text not null,
  guard       text not null,
  time        text not null,
  armed       boolean not null default false,
  resolved    boolean not null default false,
  fill        integer,
  by          text,
  created_at  timestamptz not null default now()
);

-- Shifts table
create table shifts (
  id          serial primary key,
  site_id     integer not null references sites(id) on delete cascade,
  guard_id    integer not null references guards(id) on delete cascade,
  start_time  timestamptz not null,
  end_time    timestamptz,
  status      shift_status not null default 'scheduled',
  created_at  timestamptz not null default now()
);

-- Cascade events table
create table cascade_events (
  id            serial primary key,
  call_out_id   integer not null references call_outs(id) on delete cascade,
  guard_id      integer not null references guards(id) on delete cascade,
  contacted_at  timestamptz not null,
  response      cascade_response not null default 'pending',
  response_at   timestamptz,
  notes         text,
  created_at    timestamptz not null default now()
);

-- Indexes for common queries
create index idx_guards_status on guards(status);
create index idx_guards_armed on guards(armed);
create index idx_call_outs_resolved on call_outs(resolved);
create index idx_call_outs_day on call_outs(day);
create index idx_shifts_site_id on shifts(site_id);
create index idx_shifts_guard_id on shifts(guard_id);
create index idx_shifts_status on shifts(status);
create index idx_cascade_events_call_out_id on cascade_events(call_out_id);

-- Enable Row Level Security
alter table sites enable row level security;
alter table guards enable row level security;
alter table call_outs enable row level security;
alter table shifts enable row level security;
alter table cascade_events enable row level security;

-- RLS policies: authenticated users can read all rows
create policy "Authenticated users can read sites"
  on sites for select to authenticated using (true);

create policy "Authenticated users can read guards"
  on guards for select to authenticated using (true);

create policy "Authenticated users can read call_outs"
  on call_outs for select to authenticated using (true);

create policy "Authenticated users can read shifts"
  on shifts for select to authenticated using (true);

create policy "Authenticated users can read cascade_events"
  on cascade_events for select to authenticated using (true);

-- RLS policies: authenticated users can insert/update/delete
create policy "Authenticated users can insert sites"
  on sites for insert to authenticated with check (true);

create policy "Authenticated users can update sites"
  on sites for update to authenticated using (true) with check (true);

create policy "Authenticated users can insert guards"
  on guards for insert to authenticated with check (true);

create policy "Authenticated users can update guards"
  on guards for update to authenticated using (true) with check (true);

create policy "Authenticated users can insert call_outs"
  on call_outs for insert to authenticated with check (true);

create policy "Authenticated users can update call_outs"
  on call_outs for update to authenticated using (true) with check (true);

create policy "Authenticated users can insert shifts"
  on shifts for insert to authenticated with check (true);

create policy "Authenticated users can update shifts"
  on shifts for update to authenticated using (true) with check (true);

create policy "Authenticated users can insert cascade_events"
  on cascade_events for insert to authenticated with check (true);

create policy "Authenticated users can update cascade_events"
  on cascade_events for update to authenticated using (true) with check (true);

-- Enable realtime for sites table (for live status changes)
alter publication supabase_realtime add table sites;
alter publication supabase_realtime add table call_outs;
alter publication supabase_realtime add table shifts;
