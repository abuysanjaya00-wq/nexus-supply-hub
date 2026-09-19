import { createServiceClient } from "@/lib/supabase/server";
import {
  CATEGORY_PRESETS,
  generateStockSku,
  suggestMsrp,
  type SupplyCategory,
  type SupplySku,
} from "@/lib/supply-shared";

const SELECT =
  "id, sku, name_cn, name_en, source_url, image_url, category, cost_rmb, msrp_usd, moq, weight_g, pack_length_cm, pack_width_cm, pack_height_cm, pack_weight_kg, etsy_title, etsy_description, tags, material, declare_name_cn, declare_name_en, hs_code, created_at, updated_at";

function toNumber(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapRow(row: Record<string, unknown>): SupplySku {
  const category = (["wood", "pod", "baby", "jewelry", "home"].includes(
    String(row.category),
  )
    ? row.category
    : "home") as SupplyCategory;
  const tags = String(row.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return {
    id: String(row.id),
    sku: String(row.sku ?? ""),
    name_cn: String(row.name_cn ?? ""),
    name_en: String(row.name_en ?? ""),
    source_url: String(row.source_url ?? ""),
    image_url: String(row.image_url ?? ""),
    category,
    cost_rmb: toNumber(row.cost_rmb),
    msrp_usd: toNumber(row.msrp_usd),
    moq: toNumber(row.moq, 1),
    weight_g: toNumber(row.weight_g),
    pack_length_cm: toNumber(row.pack_length_cm),
    pack_width_cm: toNumber(row.pack_width_cm),
    pack_height_cm: toNumber(row.pack_height_cm),
    pack_weight_kg: toNumber(row.pack_weight_kg),
    etsy_title: String(row.etsy_title ?? ""),
    etsy_description: String(row.etsy_description ?? ""),
    tags,
    material: String(row.material ?? ""),
    declare_name_cn: String(row.declare_name_cn ?? ""),
    declare_name_en: String(row.declare_name_en ?? ""),
    hs_code: String(row.hs_code ?? ""),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function listSupplySkus(): Promise<SupplySku[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("supply_skus")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function getSupplySkusByIds(ids: string[]): Promise<SupplySku[]> {
  if (ids.length === 0) return [];
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("supply_skus")
    .select(SELECT)
    .in("id", ids);
  if (error) throw error;
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function insertSupplySku(input: {
  name_cn: string;
  source_url: string;
  image_url: string;
  category: SupplyCategory;
  cost_rmb: number;
}): Promise<SupplySku> {
  const preset = CATEGORY_PRESETS[input.category];
  const supabase = createServiceClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const sku = generateStockSku();
    const { data, error } = await supabase
      .from("supply_skus")
      .insert({
        sku,
        name_cn: input.name_cn,
        name_en: "",
        source_url: input.source_url,
        image_url: input.image_url,
        category: input.category,
        cost_rmb: input.cost_rmb,
        msrp_usd: suggestMsrp(input.cost_rmb),
        moq: 1,
        weight_g: preset.weight_g,
        pack_length_cm: preset.pack_length_cm,
        pack_width_cm: preset.pack_width_cm,
        pack_height_cm: preset.pack_height_cm,
        pack_weight_kg: preset.pack_weight_kg,
        material: preset.material,
        declare_name_cn: preset.declare_name_cn,
        declare_name_en: preset.declare_name_en,
        hs_code: preset.hs_code,
        tags: "",
      })
      .select(SELECT)
      .single();
    if (!error && data) return mapRow(data as Record<string, unknown>);
    lastError = new Error(error?.message || "insert failed");
    if (!error?.message?.includes("duplicate")) break;
  }
  throw lastError ?? new Error("无法生成唯一 SKU");
}

export async function saveEtsyPack(
  id: string,
  pack: {
    title: string;
    description: string;
    tags: string[];
    msrp_usd: number;
  },
): Promise<SupplySku> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("supply_skus")
    .update({
      etsy_title: pack.title,
      name_en: pack.title,
      etsy_description: pack.description,
      tags: pack.tags.join(", "),
      msrp_usd: pack.msrp_usd,
    })
    .eq("id", id)
    .select(SELECT)
    .single();
  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}
