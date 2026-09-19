"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Loader2, Package } from "lucide-react";
import { createOrderAction } from "@/app/actions/dropshipActions";
import type { Product } from "@/lib/products-shared";
import type { ResellerStore } from "@/lib/types";

export default function NewOrderForm({
  products,
  stores,
}: {
  products: Product[];
  stores: ResellerStore[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [productId, setProductId] = useState(products[0]?.id ?? "");

  const selected = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId],
  );

  const [form, setForm] = useState({
    store_id: stores[0]?.id ?? "",
    quantity: 1,
    reseller_name: "",
    recipient_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state_region: "",
    country: "US",
    postal_code: "",
    phone: "",
    notes: "",
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccessId(null);

    if (!selected) {
      setError("请选择供应链 SKU");
      return;
    }

    startTransition(async () => {
      const store = stores.find((s) => s.id === form.store_id);
      const result = await createOrderAction({
        store_id: form.store_id || null,
        product_id: selected.id,
        sku: selected.sku,
        quantity: Number(form.quantity) || 1,
        reseller_name: form.reseller_name,
        recipient_name: form.recipient_name,
        address_line1: form.address_line1,
        address_line2: form.address_line2,
        city: form.city,
        state_region: form.state_region,
        country: form.country,
        postal_code: form.postal_code,
        phone: form.phone,
        notes: form.notes,
        platform: store?.platform ?? "",
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccessId(result.data.id);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"
    >
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold">C 端买家收货信息</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-500 sm:col-span-2">
            卖家 / Reseller 名称
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.reseller_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, reseller_name: e.target.value }))
              }
              placeholder="Your shop brand"
            />
          </label>
          <label className="block text-xs font-medium text-slate-500 sm:col-span-2">
            Recipient Name *
            <input
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.recipient_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, recipient_name: e.target.value }))
              }
            />
          </label>
          <label className="block text-xs font-medium text-slate-500 sm:col-span-2">
            Address Line 1 *
            <input
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.address_line1}
              onChange={(e) =>
                setForm((f) => ({ ...f, address_line1: e.target.value }))
              }
            />
          </label>
          <label className="block text-xs font-medium text-slate-500 sm:col-span-2">
            Address Line 2
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.address_line2}
              onChange={(e) =>
                setForm((f) => ({ ...f, address_line2: e.target.value }))
              }
            />
          </label>
          <label className="block text-xs font-medium text-slate-500">
            City *
            <input
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.city}
              onChange={(e) =>
                setForm((f) => ({ ...f, city: e.target.value }))
              }
            />
          </label>
          <label className="block text-xs font-medium text-slate-500">
            State / Region
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.state_region}
              onChange={(e) =>
                setForm((f) => ({ ...f, state_region: e.target.value }))
              }
            />
          </label>
          <label className="block text-xs font-medium text-slate-500">
            Country *
            <input
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.country}
              onChange={(e) =>
                setForm((f) => ({ ...f, country: e.target.value }))
              }
            />
          </label>
          <label className="block text-xs font-medium text-slate-500">
            Postal Code *
            <input
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.postal_code}
              onChange={(e) =>
                setForm((f) => ({ ...f, postal_code: e.target.value }))
              }
            />
          </label>
          <label className="block text-xs font-medium text-slate-500 sm:col-span-2">
            Phone
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </label>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-indigo-600" />
          <h2 className="text-base font-semibold">一件代发采购单</h2>
        </div>

        <label className="block text-xs font-medium text-slate-500">
          绑定店铺（可选）
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            value={form.store_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, store_id: e.target.value }))
            }
          >
            <option value="">不关联店铺</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.store_name} ({store.platform})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium text-slate-500">
          供应链 SKU *
          <select
            required
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            {products.length === 0 ? (
              <option value="">暂无商品，请先导入</option>
            ) : (
              products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name}
                </option>
              ))
            )}
          </select>
        </label>

        {selected ? (
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <p>批发底价：${selected.min_price.toFixed(2)}</p>
            <p className="mt-1">库存：{selected.stock}</p>
            <p className="mt-1">供应模式：{selected.supply_mode}</p>
          </div>
        ) : null}

        <label className="block text-xs font-medium text-slate-500">
          数量 *
          <input
            type="number"
            min={1}
            required
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            value={form.quantity}
            onChange={(e) =>
              setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
            }
          />
        </label>

        <label className="block text-xs font-medium text-slate-500">
          订单备注
          <textarea
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            value={form.notes}
            onChange={(e) =>
              setForm((f) => ({ ...f, notes: e.target.value }))
            }
          />
        </label>

        {error ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        {successId ? (
          <p className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            代发单已提交，进入仓库队列。Order ID:{" "}
            <span className="font-mono text-xs">{successId}</span>
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || products.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-70"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          提交一件代发订单
        </button>
      </div>
    </form>
  );
}
