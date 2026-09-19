"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Store, Trash2 } from "lucide-react";
import {
  createStoreAction,
  removeStoreAction,
  setStoreStatusAction,
} from "@/app/actions/dropshipActions";
import type { ResellerStore, StorePlatform, StoreStatus } from "@/lib/types";
import { STORE_PLATFORMS } from "@/lib/types";

export default function StoresManager({
  initialStores,
}: {
  initialStores: ResellerStore[];
}) {
  const [stores, setStores] = useState(initialStores);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    store_name: "",
    platform: "etsy" as StorePlatform,
    api_key: "",
    external_shop_id: "",
    notes: "",
  });

  function refreshFromServer(next: ResellerStore[]) {
    setStores(next);
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createStoreAction(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refreshFromServer([result.data, ...stores]);
      setForm({
        store_name: "",
        platform: "etsy",
        api_key: "",
        external_shop_id: "",
        notes: "",
      });
    });
  }

  function handleStatus(id: string, status: StoreStatus) {
    startTransition(async () => {
      const result = await setStoreStatusAction(id, status);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStores((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s)),
      );
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await removeStoreAction(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStores((prev) => prev.filter((s) => s.id !== id));
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-indigo-600" />
          <h2 className="text-base font-semibold">绑定新店铺</h2>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-500">
            店铺名称
            <input
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.store_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, store_name: e.target.value }))
              }
              placeholder="My Etsy Boutique"
            />
          </label>

          <label className="block text-xs font-medium text-slate-500">
            平台
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.platform}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  platform: e.target.value as StorePlatform,
                }))
              }
            >
              {STORE_PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium text-slate-500">
            API Key / Access Token
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono"
              value={form.api_key}
              onChange={(e) =>
                setForm((f) => ({ ...f, api_key: e.target.value }))
              }
              placeholder="paste token (stored for sync hooks)"
            />
          </label>

          <label className="block text-xs font-medium text-slate-500">
            External Shop ID（可选）
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.external_shop_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, external_shop_id: e.target.value }))
              }
            />
          </label>

          <label className="block text-xs font-medium text-slate-500">
            备注
            <textarea
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </label>
        </div>

        {error ? (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-70"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          保存店铺授权
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Store className="h-4 w-4 text-indigo-600" />
          <h2 className="text-base font-semibold">已绑定店铺</h2>
          <span className="ml-auto text-xs text-slate-400">
            {stores.length} stores
          </span>
        </div>

        {stores.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            尚未绑定店铺。先添加 Etsy / Shopify / TikTok 等渠道授权。
          </p>
        ) : (
          <ul className="space-y-3">
            {stores.map((store) => (
              <li
                key={store.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {store.store_name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                      {store.platform} · {store.status}
                    </p>
                    {store.external_shop_id ? (
                      <p className="mt-1 font-mono text-[11px] text-slate-400">
                        shop: {store.external_shop_id}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(store.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Delete store"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["active", "inactive", "pending", "error"] as StoreStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatus(store.id, status)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          store.status === status
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {status}
                      </button>
                    ),
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
