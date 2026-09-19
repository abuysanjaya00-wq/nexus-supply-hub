import { NextResponse } from "next/server";
import { upsertOrderFromPlatform } from "@/lib/orders";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/orders/sync
 * Skeleton for marketplace webhooks / cron order pullers.
 *
 * Auth: Authorization: Bearer <CRON_SECRET or SUPABASE_SERVICE_ROLE_KEY>
 * Body example:
 * {
 *   "platform": "etsy",
 *   "platform_order_id": "ORD-1001",
 *   "user_id": "<auth user uuid>",
 *   "store_id": "<optional store uuid>",
 *   "sku": "WOOD-RELIEF-001",
 *   "quantity": 1,
 *   "reseller_name": "Studio North",
 *   "recipient_name": "Jane Doe",
 *   "address_line1": "123 Main St",
 *   "city": "Austin",
 *   "country": "US",
 *   "postal_code": "78701",
 *   "phone": "+1..."
 * }
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const expected =
      process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!expected || token !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const required = [
      "platform",
      "platform_order_id",
      "user_id",
      "sku",
      "recipient_name",
      "address_line1",
      "city",
      "country",
      "postal_code",
    ] as const;

    for (const key of required) {
      if (!body[key] || String(body[key]).trim() === "") {
        return NextResponse.json(
          { error: `Missing field: ${key}` },
          { status: 400 },
        );
      }
    }

    // Optional: resolve product_id by SKU
    let productId: string | null = null;
    try {
      const supabase = createServiceClient();
      const { data } = await supabase
        .from("products")
        .select("id")
        .eq("sku", String(body.sku))
        .maybeSingle();
      productId = data?.id ?? null;
    } catch {
      productId = null;
    }

    const order = await upsertOrderFromPlatform({
      user_id: String(body.user_id),
      store_id: body.store_id ? String(body.store_id) : null,
      product_id: productId,
      sku: String(body.sku),
      quantity: Number(body.quantity ?? 1),
      reseller_name: String(body.reseller_name ?? ""),
      recipient_name: String(body.recipient_name),
      address_line1: String(body.address_line1),
      address_line2: String(body.address_line2 ?? ""),
      city: String(body.city),
      state_region: String(body.state_region ?? ""),
      country: String(body.country),
      postal_code: String(body.postal_code),
      phone: String(body.phone ?? ""),
      platform: String(body.platform),
      platform_order_id: String(body.platform_order_id),
      notes: String(body.notes ?? "Synced via /api/orders/sync"),
    });

    return NextResponse.json({
      ok: true,
      order,
      message: "Order synced into Nexus Supply fulfillment queue",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Order sync failed",
      },
      { status: 500 },
    );
  }
}
