"use server";

import { revalidatePath } from "next/cache";
import {
  createDropshipOrder,
  listFulfillmentOrders,
  listMyOrders,
  shipOrder,
  type CreateOrderInput,
} from "@/lib/orders";
import { pushTrackingToPlatform } from "@/lib/platform-hooks";
import {
  createResellerStore,
  deleteResellerStore,
  listResellerStores,
  updateResellerStoreStatus,
  type CreateStoreInput,
} from "@/lib/stores";
import type { DropshipOrder, ResellerStore, StoreStatus } from "@/lib/types";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function listStoresAction(): Promise<
  ActionResult<ResellerStore[]>
> {
  try {
    const data = await listResellerStores();
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to list stores",
    };
  }
}

export async function createStoreAction(
  input: CreateStoreInput,
): Promise<ActionResult<ResellerStore>> {
  try {
    if (!input.store_name?.trim()) {
      return { ok: false, error: "店铺名称不能为空" };
    }
    if (!input.platform) {
      return { ok: false, error: "请选择平台" };
    }
    const data = await createResellerStore(input);
    revalidatePath("/reseller/stores");
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to create store",
    };
  }
}

export async function setStoreStatusAction(
  id: string,
  status: StoreStatus,
): Promise<ActionResult<{ id: string }>> {
  try {
    await updateResellerStoreStatus(id, status);
    revalidatePath("/reseller/stores");
    return { ok: true, data: { id } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update store",
    };
  }
}

export async function removeStoreAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    await deleteResellerStore(id);
    revalidatePath("/reseller/stores");
    return { ok: true, data: { id } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete store",
    };
  }
}

export async function createOrderAction(
  input: CreateOrderInput,
): Promise<ActionResult<DropshipOrder>> {
  try {
    if (!input.sku?.trim()) return { ok: false, error: "SKU 不能为空" };
    if (!input.recipient_name?.trim()) {
      return { ok: false, error: "收件人姓名不能为空" };
    }
    if (!input.address_line1?.trim()) {
      return { ok: false, error: "收件地址不能为空" };
    }
    if (!input.city?.trim() || !input.country?.trim() || !input.postal_code?.trim()) {
      return { ok: false, error: "城市 / 国家 / 邮编为必填" };
    }
    if (!input.quantity || input.quantity < 1) {
      return { ok: false, error: "数量至少为 1" };
    }

    const data = await createDropshipOrder(input);
    revalidatePath("/reseller/orders/new");
    revalidatePath("/warehouse/fulfillment");
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

export async function listMyOrdersAction(): Promise<
  ActionResult<DropshipOrder[]>
> {
  try {
    const data = await listMyOrders();
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to list orders",
    };
  }
}

export async function listFulfillmentOrdersAction(): Promise<
  ActionResult<DropshipOrder[]>
> {
  try {
    const data = await listFulfillmentOrders(["pending", "processing"]);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to load warehouse board",
    };
  }
}

export async function shipOrderAction(input: {
  orderId: string;
  tracking_number: string;
  carrier?: string;
}): Promise<
  ActionResult<{ order: DropshipOrder; platformPush: { message: string } }>
> {
  try {
    const order = await shipOrder(input);
    const platformPush = await pushTrackingToPlatform(order);
    revalidatePath("/warehouse/fulfillment");
    revalidatePath("/reseller/orders/new");
    return { ok: true, data: { order, platformPush } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to ship order",
    };
  }
}
