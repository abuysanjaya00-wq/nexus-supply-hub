import { NextResponse } from "next/server";
import { getOrderById, shipOrder } from "@/lib/orders";
import { pushTrackingToPlatform } from "@/lib/platform-hooks";

/**
 * POST /api/orders/tracking
 * Warehouse ships an order → status=shipped → platform push-back hook.
 *
 * Body: { orderId, tracking_number, carrier? }
 * Auth: logged-in cookie session (Supabase) OR Bearer CRON_SECRET for automation.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      orderId?: string;
      tracking_number?: string;
      carrier?: string;
    };

    if (!body.orderId || !body.tracking_number?.trim()) {
      return NextResponse.json(
        { error: "orderId and tracking_number are required" },
        { status: 400 },
      );
    }

    const order = await shipOrder({
      orderId: body.orderId,
      tracking_number: body.tracking_number,
      carrier: body.carrier,
    });

    const platformPush = await pushTrackingToPlatform(order);

    return NextResponse.json({
      ok: true,
      order,
      platformPush,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Tracking update failed",
      },
      { status: 500 },
    );
  }
}

/** GET /api/orders/tracking?id=... — inspect a single order */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, order });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lookup failed" },
      { status: 500 },
    );
  }
}
