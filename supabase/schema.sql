create extension if not exists pgcrypto;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  role text not null check (role in ('parent','helper')),
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.household_state (
  household_id uuid primary key references public.households(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.household_members enable row level security;
alter table public.household_state enable row level security;

create policy "members can read their membership" on public.household_members
for select using (user_id = auth.uid());

create policy "members can read household state" on public.household_state
for select using (exists (
  select 1 from public.household_members m
  where m.user_id = auth.uid() and m.household_id = household_state.household_id
));

create policy "members can insert household state" on public.household_state
for insert with check (exists (
  select 1 from public.household_members m
  where m.user_id = auth.uid() and m.household_id = household_state.household_id
));

create policy "members can update household state" on public.household_state
for update using (exists (
  select 1 from public.household_members m
  where m.user_id = auth.uid() and m.household_id = household_state.household_id
));