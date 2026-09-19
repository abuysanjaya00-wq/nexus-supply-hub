"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { SupplyMode } from "@/lib/products-shared";

const MODES: Array<{ value: "all" | SupplyMode; label: string }> = [
  { value: "all", label: "全部模式" },
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
      className={`rounded-2xl border border-[#E5D6C5] bg-[#FFFCFA] p-4 shadow-[0_8px_28px_rgba(74,48,32,0.04)] ${
        pending ? "opacity-70" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#2C241B]">多维筛选</h2>
        <button
          type="button"
          className="text-xs font-medium text-[#8B735E] hover:text-[#C45C26]"
          onClick={() =>
            startTransition(() => {
              router.push("/products");
            })
          }
        >
          重置
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-xs font-medium text-[#8B735E]">
          品类 Category
          <select
            className="mt-1.5 w-full rounded-xl border border-[#E5D6C5] bg-[#F7F1EA] px-3 py-2.5 text-sm text-[#2C241B] outline-none focus:border-[#C45C26] focus:ring-2 focus:ring-[#E8C4A8]/60"
            value={category}
            onChange={(event) => update("category", event.target.value)}
          >
            <option value="all">全部品类</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="text-xs font-medium text-[#8B735E]">
            供应模式
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
                      ? "bg-[#C45C26] text-[#FFF8F2] shadow-sm"
                      : "bg-[#F3E6D8] text-[#6B5646] hover:bg-[#EAD9C6]"
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
