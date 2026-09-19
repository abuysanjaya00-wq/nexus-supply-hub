import { createClient } from "@/lib/supabase/server";
import type {
  ResellerStore,
  StorePlatform,
  StoreStatus,
} from "@/lib/types";

const STORE_SELECT =
  "id, user_id, store_name, platform, api_key, status, external_shop_id, notes, created_at, updated_at";

function mapStore(row: Record<string, unknown>): ResellerStore {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    store_name: String(row.store_name ?? ""),
    platform: row.platform as StorePlatform,
    api_key: String(row.api_key ?? ""),
    status: (row.status as StoreStatus) || "pending",
    external_shop_id: String(row.external_shop_id ?? ""),
    notes: String(row.notes ?? ""),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function listResellerStores(): Promise<ResellerStore[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("reseller_stores")
    .select(STORE_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapStore(row as Record<string, unknown>));
}

export type CreateStoreInput = {
  store_name: string;
  platform: StorePlatform;
  api_key: string;
  status?: StoreStatus;
  external_shop_id?: string;
  notes?: string;
};

export async function createResellerStore(
  input: CreateStoreInput,
): Promise<ResellerStore> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("请先登录");

  const { data, error } = await supabase
    .from("reseller_stores")
    .insert({
      user_id: user.id,
      store_name: input.store_name.trim(),
      platform: input.platform,
      api_key: input.api_key.trim(),
      status: input.status ?? "active",
      external_shop_id: input.external_shop_id?.trim() ?? "",
      notes: input.notes?.trim() ?? "",
    })
    .select(STORE_SELECT)
    .single();

  if (error) throw error;
  return mapStore(data as Record<string, unknown>);
}

export async function updateResellerStoreStatus(
  id: string,
  status: StoreStatus,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reseller_stores")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteResellerStore(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("reseller_stores").delete().eq("id", id);
  if (error) throw error;
}
