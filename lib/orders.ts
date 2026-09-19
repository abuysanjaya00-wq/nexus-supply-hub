import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { DropshipOrder, OrderStatus } from "@/lib/types";

const ORDER_SELECT =
  "id, user_id, store_id, product_id, sku, quantity, reseller_name, recipient_name, address_line1, address_line2, city, state_region, country, postal_code, phone, status, tracking_number, carrier, platform_order_id, platform, notes, shipped_at, created_at, updated_at";

function mapOrder(row: Record<string, unknown>): DropshipOrder {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    store_id: row.store_id ? String(row.store_id) : null,
    product_id: row.product_id ? String(row.product_id) : null,
    sku: String(row.sku ?? ""),
    quantity: Number(row.quantity ?? 1),
    reseller_name: String(row.reseller_name ?? ""),
    recipient_name: String(row.recipient_name ?? ""),
    address_line1: String(row.address_line1 ?? ""),
    address_line2: String(row.address_line2 ?? ""),
    city: String(row.city ?? ""),
    state_region: String(row.state_region ?? ""),
    country: String(row.country ?? ""),
    postal_code: String(row.postal_code ?? ""),
    phone: String(row.phone ?? ""),
    status: (row.status as OrderStatus) || "pending",
    tracking_number: String(row.tracking_number ?? ""),
    carrier: String(row.carrier ?? ""),
    platform_order_id: String(row.platform_order_id ?? ""),
    platform: String(row.platform ?? ""),
    notes: String(row.notes ?? ""),
    shipped_at: row.shipped_at ? String(row.shipped_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export type CreateOrderInput = {
  store_id?: string | null;
  product_id?: string | null;
  sku: string;
  quantity: number;
  reseller_name: string;
  recipient_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_region?: string;
  country: string;
  postal_code: string;
  phone?: string;
  notes?: string;
  platform?: string;
  platform_order_id?: string;
};

export async function listMyOrders(): Promise<DropshipOrder[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapOrder(row as Record<string, unknown>));
}

export async function listFulfillmentOrders(
  statuses: OrderStatus[] = ["pending", "processing"],
): Promise<DropshipOrder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .in("status", statuses)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapOrder(row as Record<string, unknown>));
}

export async function createDropshipOrder(
  input: CreateOrderInput,
): Promise<DropshipOrder> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("请先登录");

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      store_id: input.store_id || null,
      product_id: input.product_id || null,
      sku: input.sku.trim(),
      quantity: input.quantity,
      reseller_name: input.reseller_name.trim(),
      recipient_name: input.recipient_name.trim(),
      address_line1: input.address_line1.trim(),
      address_line2: input.address_line2?.trim() ?? "",
      city: input.city.trim(),
      state_region: input.state_region?.trim() ?? "",
      country: input.country.trim(),
      postal_code: input.postal_code.trim(),
      phone: input.phone?.trim() ?? "",
      notes: input.notes?.trim() ?? "",
      platform: input.platform?.trim() ?? "",
      platform_order_id: input.platform_order_id?.trim() ?? "",
      status: "pending",
    })
    .select(ORDER_SELECT)
    .single();

  if (error) throw error;
  return mapOrder(data as Record<string, unknown>);
}

export async function shipOrder(input: {
  orderId: string;
  tracking_number: string;
  carrier?: string;
}): Promise<DropshipOrder> {
  const supabase = await createClient();
  const tracking = input.tracking_number.trim();
  if (!tracking) throw new Error("Tracking number is required");

  const { data, error } = await supabase
    .from("orders")
    .update({
      tracking_number: tracking,
      carrier: input.carrier?.trim() ?? "",
      status: "shipped",
      shipped_at: new Date().toISOString(),
    })
    .eq("id", input.orderId)
    .select(ORDER_SELECT)
    .single();

  if (error) throw error;
  return mapOrder(data as Record<string, unknown>);
}

/** Service-role upsert used by webhook / cron sync skeletons */
export async function upsertOrderFromPlatform(payload: {
  user_id: string;
  store_id?: string | null;
  product_id?: string | null;
  sku: string;
  quantity?: number;
  reseller_name?: string;
  recipient_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_region?: string;
  country: string;
  postal_code: string;
  phone?: string;
  platform: string;
  platform_order_id: string;
  notes?: string;
}): Promise<DropshipOrder> {
  const supabase = createServiceClient();

  if (payload.platform_order_id) {
    const { data: existing } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("platform", payload.platform)
      .eq("platform_order_id", payload.platform_order_id)
      .maybeSingle();

    if (existing) {
      return mapOrder(existing as Record<string, unknown>);
    }
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: payload.user_id,
      store_id: payload.store_id || null,
      product_id: payload.product_id || null,
      sku: payload.sku,
      quantity: payload.quantity ?? 1,
      reseller_name: payload.reseller_name ?? "",
      recipient_name: payload.recipient_name,
      address_line1: payload.address_line1,
      address_line2: payload.address_line2 ?? "",
      city: payload.city,
      state_region: payload.state_region ?? "",
      country: payload.country,
      postal_code: payload.postal_code,
      phone: payload.phone ?? "",
      platform: payload.platform,
      platform_order_id: payload.platform_order_id,
      notes: payload.notes ?? "",
      status: "pending",
    })
    .select(ORDER_SELECT)
    .single();

  if (error) throw error;
  return mapOrder(data as Record<string, unknown>);
}

export async function getOrderById(id: string): Promise<DropshipOrder | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrder(data as Record<string, unknown>) : null;
}
