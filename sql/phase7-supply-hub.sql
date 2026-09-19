-- Nexus Supply Hub — Mabang template cache + SKU archive
-- Run in Supabase SQL Editor (safe to re-run)

create table if not exists public.supply_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.supply_skus (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name_cn text not null default '',
  name_en text not null default '',
  source_url text not null default '',
  image_url text not null default '',
  category text not null default 'home',
  cost_rmb numeric(12, 2) not null default 0,
  msrp_usd numeric(12, 2) not null default 0,
  moq integer not null default 1,
  weight_g numeric(12, 2) not null default 0,
  pack_length_cm numeric(12, 2) not null default 0,
  pack_width_cm numeric(12, 2) not null default 0,
  pack_height_cm numeric(12, 2) not null default 0,
  pack_weight_kg numeric(12, 3) not null default 0,
  etsy_title text not null default '',
  etsy_description text not null default '',
  tags text not null default '',
  material text not null default '',
  declare_name_cn text not null default '',
  declare_name_en text not null default '',
  hs_code text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists supply_skus_set_updated_at on public.supply_skus;
create trigger supply_skus_set_updated_at
  before update on public.supply_skus
  for each row execute function public.set_updated_at();

alter table public.supply_settings enable row level security;
alter table public.supply_skus enable row level security;

drop policy if exists "supply_settings_auth" on public.supply_settings;
create policy "supply_settings_auth"
  on public.supply_settings for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "supply_skus_auth" on public.supply_skus;
create policy "supply_skus_auth"
  on public.supply_skus for all
  to authenticated
  using (true)
  with check (true);
