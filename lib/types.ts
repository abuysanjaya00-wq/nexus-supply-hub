export type StorePlatform =
  | "etsy"
  | "shopify"
  | "tiktok"
  | "temu"
  | "amazon"
  | "ebay";

export type StoreStatus = "active" | "inactive" | "error" | "pending";

export type ResellerStore = {
  id: string;
  user_id: string;
  store_name: string;
  platform: StorePlatform;
  api_key: string;
  status: StoreStatus;
  external_shop_id: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type DropshipOrder = {
  id: string;
  user_id: string;
  store_id: string | null;
  product_id: string | null;
  sku: string;
  quantity: number;
  reseller_name: string;
  recipient_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state_region: string;
  country: string;
  postal_code: string;
  phone: string;
  status: OrderStatus;
  tracking_number: string;
  carrier: string;
  platform_order_id: string;
  platform: string;
  notes: string;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
};

export const STORE_PLATFORMS: Array<{
  value: StorePlatform;
  label: string;
}> = [
  { value: "etsy", label: "Etsy" },
  { value: "shopify", label: "Shopify" },
  { value: "tiktok", label: "TikTok Shop" },
  { value: "temu", label: "Temu" },
  { value: "amazon", label: "Amazon" },
  { value: "ebay", label: "eBay" },
];

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];
