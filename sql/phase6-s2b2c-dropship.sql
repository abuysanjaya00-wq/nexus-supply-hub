-- ============================================================
-- NexusSupply Hub — S2B2C Dropshipping Mid-Office Schema
-- Run in Supabase SQL Editor (safe to re-run)
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------
-- products (extend supply catalog for dropshipping)
-- ----------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  style text not null default '',
  specs text not null default '',
  weight_g numeric(12, 2),
  material text not null default '',
  min_price numeric(10, 2) not null default 0,
  notes text not null default '',
  image_url text,
  category text not null default 'General',
  supply_mode text not null default 'Dropship Ready'
    check (supply_mode in ('Dropship Ready', 'OEM')),
  verified_chain_leader boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists stock integer not null default 0;
alter table public.products add column if not exists english_title text not null default '';
alter table public.products add column if not exists tags text not null default '';
alter table public.products add column if not exists style text not null default '';
alter table public.products add column if not exists specs text not null default '';
alter table public.products add column if not exists weight_g numeric(12, 2);
alter table public.products add column if not exists material text not null default '';
alter table public.products add column if not exists min_price numeric(10, 2) not null default 0;
alter table public.products add column if not exists notes text not null default '';
alter table public.products add column if not exists category text not null default 'General';
alter table public.products add column if not exists supply_mode text not null default 'Dropship Ready';
alter table public.products add column if not exists verified_chain_leader boolean not null default true;
alter table public.products add column if not exists image_url text;

create index if not exists products_category_idx on public.products (category);
create index if not exists products_sku_idx on public.products (sku);
create index if not exists products_supply_mode_idx on public.products (supply_mode);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "products_select_authenticated" on public.products;
create policy "products_select_authenticated"
  on public.products for select to authenticated using (true);

drop policy if exists "products_insert_authenticated" on public.products;
create policy "products_insert_authenticated"
  on public.products for insert to authenticated with check (true);

drop policy if exists "products_update_authenticated" on public.products;
create policy "products_update_authenticated"
  on public.products for update to authenticated using (true) with check (true);

-- ----------------------------------------------------------
-- reseller_stores (multi-platform store bindings)
-- ----------------------------------------------------------
create table if not exists public.reseller_stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  store_name text not null,
  platform text not null
    check (platform in ('etsy', 'shopify', 'tiktok', 'temu', 'amazon', 'ebay')),
  api_key text not null default '',
  status text not null default 'active'
    check (status in ('active', 'inactive', 'error', 'pending')),
  external_shop_id text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reseller_stores_user_id_idx
  on public.reseller_stores (user_id);
create index if not exists reseller_stores_platform_idx
  on public.reseller_stores (platform);

drop trigger if exists reseller_stores_set_updated_at on public.reseller_stores;
create trigger reseller_stores_set_updated_at
  before update on public.reseller_stores
  for each row execute function public.set_updated_at();

alter table public.reseller_stores enable row level security;

drop policy if exists "reseller_stores_select_own" on public.reseller_stores;
create policy "reseller_stores_select_own"
  on public.reseller_stores for select
  using (auth.uid() = user_id);

drop policy if exists "reseller_stores_insert_own" on public.reseller_stores;
create policy "reseller_stores_insert_own"
  on public.reseller_stores for insert
  with check (auth.uid() = user_id);

drop policy if exists "reseller_stores_update_own" on public.reseller_stores;
create policy "reseller_stores_update_own"
  on public.reseller_stores for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "reseller_stores_delete_own" on public.reseller_stores;
create policy "reseller_stores_delete_own"
  on public.reseller_stores for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------
-- orders (dropship fulfillment orders)
-- ----------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  store_id uuid references public.reseller_stores (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  sku text not null default '',
  quantity integer not null default 1 check (quantity > 0),
  reseller_name text not null default '',
  recipient_name text not null,
  address_line1 text not null,
  address_line2 text not null default '',
  city text not null,
  state_region text not null default '',
  country text not null,
  postal_code text not null,
  phone text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
  tracking_number text not null default '',
  carrier text not null default '',
  platform_order_id text not null default '',
  platform text not null default '',
  notes text not null default '',
  shipped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_store_id_idx on public.orders (store_id);
create index if not exists orders_platform_order_id_idx on public.orders (platform_order_id);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

-- Resellers manage their own orders
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
  on public.orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "orders_update_own" on public.orders;
create policy "orders_update_own"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Warehouse operators (authenticated) can view/update fulfillment fields.
-- Tighten with roles later; for MVP all authenticated warehouse staff share access.
drop policy if exists "orders_select_warehouse" on public.orders;
create policy "orders_select_warehouse"
  on public.orders for select
  to authenticated
  using (true);

drop policy if exists "orders_update_warehouse" on public.orders;
create policy "orders_update_warehouse"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);
