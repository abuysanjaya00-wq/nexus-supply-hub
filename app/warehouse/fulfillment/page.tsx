import HubShell from "@/app/components/hub-shell";
import { listFulfillmentOrders } from "@/lib/orders";
import FulfillmentBoard from "./fulfillment-board";

export default async function WarehouseFulfillmentPage() {
  let orders: Awaited<ReturnType<typeof listFulfillmentOrders>> = [];
  let error: string | null = null;

  try {
    orders = await listFulfillmentOrders(["pending", "processing"]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load warehouse board";
  }

  return (
    <HubShell
      activePath="/warehouse/fulfillment"
      title="仓库发货看板"
      subtitle="查看待发货一件代发订单，录入国际物流单号后状态变为 shipped，并触发平台单号回传钩子。"
    >
      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
          <p className="mt-2">
            请确认已执行{" "}
            <code className="font-mono">sql/phase6-s2b2c-dropship.sql</code>
          </p>
        </div>
      ) : null}
      <FulfillmentBoard initialOrders={orders} />
    </HubShell>
  );
}
