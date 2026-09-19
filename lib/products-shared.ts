export type SupplyMode = "Dropship Ready" | "OEM";

export const SUPPLY_MODES: SupplyMode[] = ["Dropship Ready", "OEM"];

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
  stock: number;
  english_title: string;
  tags: string;
  created_at: string;
  updated_at: string;
};

export type ProductFilters = {
  category?: string;
  supplyMode?: SupplyMode | "all";
};
