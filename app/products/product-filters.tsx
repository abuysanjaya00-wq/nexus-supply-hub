"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { SupplyMode } from "@/lib/products";

const MODES: Array<{ value: "all" | SupplyMode; label: string }> = [
  { value: "all", label: "All modes" },
  { value: "Dropship Ready", label: "Dropship Ready" },
  { value: "OEM", label: "OEM" },
];

export default function ProductFilters({
  categories,
}: {
  categories: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const category = searchParams.get("category") || "all";
  const mode = searchParams.get("mode") || "all";

  function update(key: "category" | "mode", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${
        pending ? "opacity-70" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Global filters
        </h2>
        <button
          type="button"
          className="text-xs font-medium text-slate-500 hover:text-indigo-600"
          onClick={() =>
            startTransition(() => {
              router.push("/products");
            })
          }
        >
          Reset
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-xs font-medium text-slate-500">
          Category
          <select
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            value={category}
            onChange={(event) => update("category", event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="text-xs font-medium text-slate-500">
            Supply mode
          </legend>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {MODES.map((item) => {
              const active = mode === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => update("mode", item.value)}
                  className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
