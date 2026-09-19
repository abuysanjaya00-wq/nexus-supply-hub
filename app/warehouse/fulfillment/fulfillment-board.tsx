"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Truck } from "lucide-react";
import { shipOrderAction } from "@/app/actions/dropshipActions";
import type { DropshipOrder } from "@/lib/types";

export default function FulfillmentBoard({
  initialOrders,
}: {
  initialOrders: DropshipOrder[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [drafts, setDrafts] = useState<Record<string, { tracking: string; carrier: string }>>(
    {},
  );
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function setDraft(id: string, patch: Partial<{ tracking: string; carrier: string }>) {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        tracking: prev[id]?.tracking ?? "",
        carrier: prev[id]?.carrier ?? "",
        ...patch,
      },
    }));
  }

  function handleShip(orderId: string) {
    const draft = drafts[orderId];
    setErrors((e) => ({ ...e, [orderId]: "" }));
    setMessages((m) => ({ ...m, [orderId]: "" }));

    startTransition(async () => {
      const result = await shipOrderAction({
        orderId,
        tracking_number: draft?.tracking ?? "",
        carrier: draft?.carrier,
      });
      if (!result.ok) {
        setErrors((e) => ({ ...e, [orderId]: result.error }));
        return;
      }
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setMessages((m) => ({
        ...m,
        [orderId]: result.data.platformPush.message,
      }));
    });
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <Truck className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-base font-semibold text-slate-800">
          暂无待发货订单
        </p>
        <p className="mt-1 text-sm text-slate-500">
          新的一件代发单会显示在这里（pending / processing）。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <article
          key={order.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                {order.status} · SKU {order.sku} × {order.quantity}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {order.recipient_name}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {order.address_line1}
                {order.address_line2 ? `, ${order.address_line2}` : ""}
              </p>
              <p className="text-sm text-slate-600">
                {order.city}
                {order.state_region ? `, ${order.state_region}` : ""}{" "}
                {order.postal_code}, {order.country}
              </p>
              <p className="mt-2 font-mono text-[11px] text-slate-400">
                order: {order.id}
                {order.platform_order_id
                  ? ` · platform: ${order.platform_order_id}`
                  : ""}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Reseller: {order.reseller_name || "—"}</p>
              <p className="mt-1">Phone: {order.phone || "—"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_160px_auto]">
            <input
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              placeholder="International tracking number"
              value={drafts[order.id]?.tracking ?? ""}
              onChange={(e) => setDraft(order.id, { tracking: e.target.value })}
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              placeholder="Carrier (UPS/DHL…)"
              value={drafts[order.id]?.carrier ?? ""}
              onChange={(e) => setDraft(order.id, { carrier: e.target.value })}
            />
            <button
              type="button"
              disabled={pending}
              onClick={() => handleShip(order.id)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-70"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Truck className="h-4 w-4" />
              )}
              标记已发货
            </button>
          </div>

          {errors[order.id] ? (
            <p className="mt-3 text-sm text-rose-600">{errors[order.id]}</p>
          ) : null}
          {messages[order.id] ? (
            <p className="mt-3 flex items-start gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {messages[order.id]}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
