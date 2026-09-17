-- ============================================================
-- Etsy Product Partner — Phase 4 products catalog
-- Run in Supabase SQL Editor
-- ============================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  category text not null default '',
  price numeric(10, 2) not null default 0,
  stock integer not null default 0,
  image_url text,
  description text not null default '',
  materials text not null default '',
  etsy_category text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_sku_idx on public.products (sku);

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

insert into public.products (
  id, name, sku, category, price, stock, image_url, description, materials, etsy_category
) values
  (
    'a1c4e8d0-1b23-4f56-9abc-111111111111',
    'Oak Wood Relief Panel — Forest Canopy',
    'WOOD-RELIEF-001',
    'Wood relief carving',
    128.00,
    18,
    'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80',
    'Hand-carved oak relief depicting layered forest canopy. Food-safe oil finish, ready to hang or lean as a wall sculpture.',
    'oak wood, food-safe oil, beeswax',
    'Home & Living > Home Decor > Wall Decor > Wall Sculptures'
  ),
  (
    'a1c4e8d0-1b23-4f56-9abc-222222222222',
    '925 Silver Crescent Charm Necklace',
    'SILVER-925-014',
    '925 silver jewelry',
    64.00,
    42,
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
    'Sterling silver crescent pendant on an 18-inch chain. Lightweight everyday piece with a brushed, slightly vintage finish.',
    '925 sterling silver',
    'Jewelry > Necklaces > Charm Necklaces'
  ),
  (
    'a1c4e8d0-1b23-4f56-9abc-333333333333',
    'Vintage Brass Candle Holder Pair',
    'HOME-VINTAGE-07',
    'Vintage home decor',
    86.00,
    9,
    'https://images.unsplash.com/photo-1602874801007-bd457ca1739e?auto=format&fit=crop&w=1200&q=80',
    'A pair of aged-brass candlesticks with a mottled patina. Works as a mantel accent or dinner-table centerpiece.',
    'brass, antique wax finish',
    'Home & Living > Home Decor > Candle Holders'
  ),
  (
    'a1c4e8d0-1b23-4f56-9abc-444444444444',
    'Speckled Stoneware Bud Vase',
    'CERAMIC-VASE-22',
    'Ceramic homeware',
    38.00,
    27,
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
    'Small wheel-thrown vase with a speckled oatmeal glaze. Sized for a single stem or dried grass bundle.',
    'stoneware clay, food-safe glaze',
    'Home & Living > Home Decor > Vases'
  ),
  (
    'a1c4e8d0-1b23-4f56-9abc-555555555555',
    'Linen Table Runner — Undyed Flax',
    'LINEN-RUNNER-03',
    'Textile home goods',
    52.00,
    31,
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    'Undyed European flax linen runner with a raw hem. Softens with each wash; 160cm length.',
    '100% linen (European flax)',
    'Home & Living > Kitchen & Dining > Table Linens > Table Runners'
  )
on conflict (sku) do update set
  name = excluded.name,
  category = excluded.category,
  price = excluded.price,
  stock = excluded.stock,
  image_url = excluded.image_url,
  description = excluded.description,
  materials = excluded.materials,
  etsy_category = excluded.etsy_category,
  updated_at = now();
