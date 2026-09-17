-- ============================================================
-- NexusSupply Hub — products schema (SKU supply catalog)
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

-- Migrate legacy columns if an older Phase-4 table already exists
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

-- Backfill from legacy fields when present
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'price'
  ) then
    execute 'update public.products set min_price = coalesce(nullif(min_price, 0), price, 0)';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'materials'
  ) then
    execute 'update public.products set material = coalesce(nullif(material, ''''), materials, '''')';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'description'
  ) then
    execute 'update public.products set notes = coalesce(nullif(notes, ''''), description, '''')';
  end if;
end $$;

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
  on public.products for select
  to authenticated
  using (true);

drop policy if exists "products_insert_authenticated" on public.products;
create policy "products_insert_authenticated"
  on public.products for insert
  to authenticated
  with check (true);

drop policy if exists "products_update_authenticated" on public.products;
create policy "products_update_authenticated"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

insert into public.products (
  id, sku, name, style, specs, weight_g, material, min_price, notes, image_url,
  category, supply_mode, verified_chain_leader
) values
  (
    'a1c4e8d0-1b23-4f56-9abc-111111111111',
    'WOOD-RELIEF-001',
    'Oak Wood Relief Panel — Forest Canopy',
    'Nordic natural',
    '40×60cm wall panel',
    820,
    'oak wood, food-safe oil',
    128.00,
    'Ready for private-label packaging. Laser logo optional.',
    'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80',
    'Wood relief carving',
    'OEM',
    true
  ),
  (
    'a1c4e8d0-1b23-4f56-9abc-222222222222',
    'SILVER-925-014',
    '925 Silver Crescent Charm Necklace',
    'Minimal vintage',
    '18-inch chain + crescent pendant',
    12,
    '925 sterling silver',
    64.00,
    'Dropship Ready SKU with US/EU parcel templates.',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
    '925 silver jewelry',
    'Dropship Ready',
    true
  ),
  (
    'a1c4e8d0-1b23-4f56-9abc-333333333333',
    'HOME-VINTAGE-07',
    'Vintage Brass Candle Holder Pair',
    'Aged brass',
    'Pair set, 18cm height',
    640,
    'brass, antique wax finish',
    86.00,
    'MOQ 1 for verified partners.',
    'https://images.unsplash.com/photo-1602874801007-bd457ca1739e?auto=format&fit=crop&w=1200&q=80',
    'Vintage home decor',
    'Dropship Ready',
    true
  ),
  (
    'a1c4e8d0-1b23-4f56-9abc-444444444444',
    'CERAMIC-VASE-22',
    'Speckled Stoneware Bud Vase',
    'Speckled oatmeal',
    'H12cm / Ø6cm',
    280,
    'stoneware clay, food-safe glaze',
    38.00,
    'Ideal for gift-box bundles.',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
    'Ceramic homeware',
    'OEM',
    true
  ),
  (
    'a1c4e8d0-1b23-4f56-9abc-555555555555',
    'LINEN-RUNNER-03',
    'Linen Table Runner — Undyed Flax',
    'Undyed flax',
    '160×35cm',
    210,
    '100% linen (European flax)',
    52.00,
    'Custom hem & embroidery available under OEM.',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    'Textile home goods',
    'OEM',
    true
  )
on conflict (sku) do update set
  name = excluded.name,
  style = excluded.style,
  specs = excluded.specs,
  weight_g = excluded.weight_g,
  material = excluded.material,
  min_price = excluded.min_price,
  notes = excluded.notes,
  image_url = excluded.image_url,
  category = excluded.category,
  supply_mode = excluded.supply_mode,
  verified_chain_leader = excluded.verified_chain_leader,
  updated_at = now();
