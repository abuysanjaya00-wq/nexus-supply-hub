import { createClient } from "@/lib/supabase/server";
import {
  type Product,
  type ProductFilters,
  type SupplyMode,
} from "@/lib/products-shared";

export type { Product, ProductFilters, SupplyMode };
export { formatUsd, buildListingExport, buildMediaKitText } from "@/lib/listing-export";

type ProductRow = {
  id: string;
  sku: string;
  name: string;
  style: string | null;
  specs: string | null;
  weight_g: number | string | null;
  material: string | null;
  min_price: number | string;
  notes: string | null;
  image_url: string | null;
  category: string | null;
  supply_mode: string | null;
  verified_chain_leader: boolean | null;
  stock?: number | string | null;
  english_title?: string | null;
  tags?: string | null;
  created_at: string;
  updated_at: string;
};

const PRODUCT_SELECT =
  "id, sku, name, style, specs, weight_g, material, min_price, notes, image_url, category, supply_mode, verified_chain_leader, stock, english_title, tags, created_at, updated_at";

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function mapProduct(row: ProductRow): Product {
  const mode = row.supply_mode === "OEM" ? "OEM" : "Dropship Ready";
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    style: row.style ?? "",
    specs: row.specs ?? "",
    weight_g:
      row.weight_g === null || row.weight_g === undefined
        ? null
        : toNumber(row.weight_g, 0),
    material: row.material ?? "",
    min_price: toNumber(row.min_price, 0),
    notes: row.notes ?? "",
    image_url: row.image_url,
    category: row.category ?? "",
    supply_mode: mode,
    verified_chain_leader: Boolean(row.verified_chain_leader),
    stock: toNumber(row.stock, 0),
    english_title: row.english_title ?? "",
    tags: row.tags ?? "",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function listProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("name", { ascending: true });

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.supplyMode && filters.supplyMode !== "all") {
    query = query.eq("supply_mode", filters.supplyMode);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapProduct(row as ProductRow));
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProduct(data as ProductRow) : null;
}

export async function listCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .order("category", { ascending: true });

  if (error) throw error;
  const set = new Set<string>();
  for (const row of data ?? []) {
    const category = (row as { category: string | null }).category?.trim();
    if (category) set.add(category);
  }
  return Array.from(set);
}

const FALLBACK_BESTSELLERS: Product[] = [
  {
    id: "fallback-1",
    sku: "WOOD-RELIEF-001",
    name: "Oak Wood Relief Panel — Forest Canopy",
    style: "Nordic natural",
    specs: "40×60cm wall panel",
    weight_g: 820,
    material: "oak wood, food-safe oil",
    min_price: 128,
    notes: "Etsy wall decor bestseller from Chain Leader factory.",
    image_url:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
    category: "Wood relief carving",
    supply_mode: "OEM",
    verified_chain_leader: true,
    stock: 18,
    english_title: "Hand Carved Oak Wood Wall Art Forest Canopy Relief Panel",
    tags: "wood wall art, oak relief, forest decor, handmade gift, wall sculpture",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    sku: "SILVER-925-014",
    name: "925 Silver Crescent Charm Necklace",
    style: "Minimal vintage",
    specs: "18-inch chain + crescent pendant",
    weight_g: 12,
    material: "925 sterling silver",
    min_price: 64,
    notes: "Dropship Ready jewelry SKU with high Etsy search intent.",
    image_url:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    category: "925 silver jewelry",
    supply_mode: "Dropship Ready",
    verified_chain_leader: true,
    stock: 42,
    english_title: "925 Sterling Silver Crescent Charm Necklace Minimal Gift",
    tags: "silver necklace, crescent charm, 925 silver, gift for her, minimal jewelry",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-3",
    sku: "CERAMIC-VASE-22",
    name: "Speckled Stoneware Bud Vase",
    style: "Speckled oatmeal",
    specs: "H12cm / Ø6cm",
    weight_g: 280,
    material: "stoneware clay, food-safe glaze",
    min_price: 38,
    notes: "Gift-box friendly ceramic for Etsy home decor niches.",
    image_url:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
    category: "Ceramic homeware",
    supply_mode: "OEM",
    verified_chain_leader: true,
    stock: 27,
    english_title: "Speckled Stoneware Bud Vase Handmade Ceramic Home Decor",
    tags: "ceramic vase, stoneware, bud vase, home decor, handmade pottery",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/** Public homepage bestsellers — prefers verified chain leaders via service role. */
export async function listChainLeaderBestsellers(
  limit = 6,
): Promise<Product[]> {
  try {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("verified_chain_leader", true)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((row) => mapProduct(row as ProductRow));
    }

    const { data: anyProducts, error: anyError } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (anyError) throw anyError;
    if (anyProducts && anyProducts.length > 0) {
      return anyProducts.map((row) => mapProduct(row as ProductRow));
    }
  } catch {
    // fall through to curated demos when DB/env is unavailable
  }

  return FALLBACK_BESTSELLERS.slice(0, limit);
}
