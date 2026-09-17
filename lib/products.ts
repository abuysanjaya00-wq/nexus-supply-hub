import { createClient } from "@/lib/supabase/server";

export type SupplyMode = "Dropship Ready" | "OEM";

export type Product = {
  id: string;
  sku: string;
  name: string;
  style: string;
  specs: string;
  weight_g: number | null;
  material: string;
  min_price: number;
  notes: string;
  image_url: string | null;
  category: string;
  supply_mode: SupplyMode;
  verified_chain_leader: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductFilters = {
  category?: string;
  supplyMode?: SupplyMode | "all";
};

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
  created_at: string;
  updated_at: string;
};

const PRODUCT_SELECT =
  "id, sku, name, style, specs, weight_g, material, min_price, notes, image_url, category, supply_mode, verified_chain_leader, created_at, updated_at";

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
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function formatUsd(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
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
