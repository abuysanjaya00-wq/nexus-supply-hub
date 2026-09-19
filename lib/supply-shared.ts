export type SupplyCategory =
  | "wood"
  | "pod"
  | "baby"
  | "jewelry"
  | "home";

export const SUPPLY_CATEGORIES: Array<{
  value: SupplyCategory | "auto";
  label: string;
}> = [
  { value: "auto", label: "自动识别" },
  { value: "wood", label: "木雕" },
  { value: "pod", label: "POD" },
  { value: "baby", label: "母婴礼盒" },
  { value: "jewelry", label: "珠宝" },
  { value: "home", label: "家居" },
];

export type SupplySku = {
  id: string;
  sku: string;
  name_cn: string;
  name_en: string;
  source_url: string;
  image_url: string;
  category: SupplyCategory;
  cost_rmb: number;
  msrp_usd: number;
  moq: number;
  weight_g: number;
  pack_length_cm: number;
  pack_width_cm: number;
  pack_height_cm: number;
  pack_weight_kg: number;
  etsy_title: string;
  etsy_description: string;
  tags: string[];
  material: string;
  declare_name_cn: string;
  declare_name_en: string;
  hs_code: string;
  created_at: string;
  updated_at: string;
};

export type CategoryPreset = {
  weight_g: number;
  pack_length_cm: number;
  pack_width_cm: number;
  pack_height_cm: number;
  pack_weight_kg: number;
  material: string;
  declare_name_cn: string;
  declare_name_en: string;
  hs_code: string;
  usage: string;
};

export const CATEGORY_PRESETS: Record<SupplyCategory, CategoryPreset> = {
  wood: {
    weight_g: 820,
    pack_length_cm: 42,
    pack_width_cm: 32,
    pack_height_cm: 8,
    pack_weight_kg: 1.1,
    material: "oak wood",
    declare_name_cn: "木制装饰摆件",
    declare_name_en: "wooden decor",
    hs_code: "4420100090",
    usage: "home decoration",
  },
  pod: {
    weight_g: 220,
    pack_length_cm: 30,
    pack_width_cm: 25,
    pack_height_cm: 3,
    pack_weight_kg: 0.35,
    material: "cotton blend",
    declare_name_cn: "印花制品",
    declare_name_en: "printed goods",
    hs_code: "6109100021",
    usage: "daily wear",
  },
  baby: {
    weight_g: 650,
    pack_length_cm: 32,
    pack_width_cm: 26,
    pack_height_cm: 12,
    pack_weight_kg: 0.9,
    material: "cotton / paper",
    declare_name_cn: "母婴礼盒",
    declare_name_en: "baby gift set",
    hs_code: "9503008900",
    usage: "baby gift",
  },
  jewelry: {
    weight_g: 35,
    pack_length_cm: 12,
    pack_width_cm: 9,
    pack_height_cm: 3,
    pack_weight_kg: 0.08,
    material: "925 sterling silver",
    declare_name_cn: "银饰",
    declare_name_en: "silver jewelry",
    hs_code: "7113119090",
    usage: "personal adornment",
  },
  home: {
    weight_g: 400,
    pack_length_cm: 25,
    pack_width_cm: 18,
    pack_height_cm: 12,
    pack_weight_kg: 0.55,
    material: "mixed",
    declare_name_cn: "家居装饰品",
    declare_name_en: "home decor",
    hs_code: "4421999090",
    usage: "home decoration",
  },
};

export function inferCategory(text: string): SupplyCategory {
  const raw = text.toLowerCase();
  if (/木雕|木制|实木|雕刻|oak|wood/.test(raw)) return "wood";
  if (/pod|印花|t恤|卫衣|马克杯|帆布/.test(raw)) return "pod";
  if (/母婴|婴儿|宝宝|礼盒|baby/.test(raw)) return "baby";
  if (/银|珠宝|项链|戒指|耳|925|jewelry/.test(raw)) return "jewelry";
  return "home";
}

export function generateStockSku() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NS${y}${m}${d}${rand}`.replace(/[^A-Z0-9]/g, "").slice(0, 18);
}

export function suggestMsrp(costRmb: number) {
  const usd = costRmb > 0 ? (costRmb / 7.2) * 3.2 : 29;
  const rounded = Math.max(12.99, Math.ceil(usd) - 0.01);
  return Number(rounded.toFixed(2));
}
