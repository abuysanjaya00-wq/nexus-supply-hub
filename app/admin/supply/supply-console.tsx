"use client";

import { useMemo, useState, useTransition } from "react";
import {
  generateEtsyPackAction,
  scrapeSupplyAction,
  uploadMabangTemplateAction,
} from "@/app/actions/supplyActions";
import {
  SUPPLY_CATEGORIES,
  type SupplyCategory,
  type SupplySku,
} from "@/lib/supply-shared";

async function download(path: string, ids: string[], filename: string) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error || "下载失败");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function SupplyConsole({
  initialSkus,
  templateCount,
  templateSource,
}: {
  initialSkus: SupplySku[];
  templateCount: number;
  templateSource: "uploaded" | "builtin";
}) {
  const [skus, setSkus] = useState(initialSkus);
  const [selected, setSelected] = useState<string[]>([]);
  const [url, setUrl] = useState("");
  const [nameCn, setNameCn] = useState("");
  const [cost, setCost] = useState("");
  const [category, setCategory] = useState<SupplyCategory | "auto">("auto");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [headers, setHeaders] = useState({
    count: templateCount,
    source: templateSource,
  });
  const [pending, startTransition] = useTransition();

  const allChecked = skus.length > 0 && selected.length === skus.length;
  const selectedSkus = useMemo(
    () => skus.filter((sku) => selected.includes(sku.id)),
    [skus, selected],
  );

  function flash(ok: string) {
    setError(null);
    setMessage(ok);
  }

  function fail(text: string) {
    setMessage(null);
    setError(text);
  }

  function ingest(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await scrapeSupplyAction({
        url,
        category,
        name_cn: nameCn,
        cost_rmb: cost ? Number(cost) : undefined,
      });
      if (!result.ok) {
        fail(result.error);
        return;
      }
      setSkus((prev) => [result.data, ...prev.filter((row) => row.id !== result.data.id)]);
      setUrl("");
      setNameCn("");
      setCost("");
      flash(`已建档 ${result.data.sku} · ${result.data.name_cn}`);
    });
  }

  function uploadTemplate(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("template", file);
    startTransition(async () => {
      const result = await uploadMabangTemplateAction(formData);
      if (!result.ok) {
        fail(result.error);
        return;
      }
      setHeaders({ count: result.data.count, source: "uploaded" });
      flash(`马帮模板已锁定，共 ${result.data.count} 列`);
    });
    event.target.value = "";
  }

  function generateCopy(id: string) {
    startTransition(async () => {
      const result = await generateEtsyPackAction(id);
      if (!result.ok) {
        fail(result.error);
        return;
      }
      setSkus((prev) => prev.map((row) => (row.id === id ? result.data : row)));
      flash("Etsy 铺货包已写入这条 SKU");
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={ingest}
          className="rounded-2xl border border-[#E5D6C5] bg-[#FFFCFA] p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C45C26]">
            1 · 源头链接
          </p>
          <h2 className="mt-1 text-lg font-semibold text-[#2C241B]">
            粘贴 1688 / 供应商链接
          </h2>
          <label className="mt-4 block text-xs font-medium text-[#8B735E]">
            产品链接
            <input
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://detail.1688.com/offer/..."
              className="mt-1 w-full rounded-xl border border-[#E5D6C5] bg-[#F7F1EA] px-3 py-2.5 text-sm"
            />
          </label>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-medium text-[#8B735E] sm:col-span-1">
              品类
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as SupplyCategory | "auto")
                }
                className="mt-1 w-full rounded-xl border border-[#E5D6C5] bg-white px-3 py-2.5 text-sm"
              >
                {SUPPLY_CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-[#8B735E]">
              手工标题（抓取失败时必填）
              <input
                value={nameCn}
                onChange={(event) => setNameCn(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[#E5D6C5] bg-white px-3 py-2.5 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-[#8B735E]">
              采购价 RMB
              <input
                inputMode="decimal"
                value={cost}
                onChange={(event) => setCost(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[#E5D6C5] bg-white px-3 py-2.5 text-sm"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="mt-4 rounded-full bg-[#C45C26] px-5 py-2.5 text-sm font-semibold text-[#FFF8F2] disabled:opacity-60"
          >
            {pending ? "处理中…" : "抓取并建档"}
          </button>
        </form>

        <div className="rounded-2xl border border-[#E5D6C5] bg-[#FFFCFA] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C45C26]">
            2 · 马帮模板
          </p>
          <h2 className="mt-1 text-lg font-semibold text-[#2C241B]">
            {headers.source === "uploaded" ? "已锁定上传模板" : "使用内置官方表头"}
          </h2>
          <p className="mt-2 text-sm text-[#6B5646]">
            当前 {headers.count} 列。马帮改版后重新上传 xlsx，导出列名会跟着变。
          </p>
          <label className="mt-4 inline-flex cursor-pointer rounded-full border border-[#E0CDB8] px-4 py-2 text-sm font-semibold text-[#5C4636]">
            上传 / 更新官方模板
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={uploadTemplate}
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending || selectedSkus.length === 0}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await download(
                      "/api/supply/mabang",
                      selected,
                      "mabang-stock-sku.xlsx",
                    );
                    flash(`已导出 ${selected.length} 条马帮表格`);
                  } catch (err) {
                    fail(err instanceof Error ? err.message : "导出失败");
                  }
                })
              }
              className="rounded-full bg-[#2C241B] px-4 py-2 text-sm font-semibold text-[#F6F0E8] disabled:opacity-50"
            >
              导出选中马帮 Excel
            </button>
            <button
              type="button"
              disabled={pending || selectedSkus.length === 0}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await download(
                      "/api/supply/catalog-pdf",
                      selected,
                      "nexus-whatsapp-lookbook.pdf",
                    );
                    flash("WhatsApp 选品画册已下载");
                  } catch (err) {
                    fail(err instanceof Error ? err.message : "PDF 失败");
                  }
                })
              }
              className="rounded-full border border-[#C45C26] px-4 py-2 text-sm font-semibold text-[#C45C26] disabled:opacity-50"
            >
              导出 WhatsApp PDF
            </button>
          </div>
        </div>
      </section>

      {message ? (
        <p className="rounded-xl bg-[#F3E6D8] px-4 py-3 text-sm text-[#5C4636]">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-[#FDF2EC] px-4 py-3 text-sm text-[#8B3E28]">
          {error}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-[#E5D6C5] bg-white">
        <div className="flex items-center justify-between border-b border-[#EFE4D8] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#2C241B]">
            产品档案 · {skus.length}
          </h2>
          <label className="text-xs text-[#8B735E]">
            <input
              type="checkbox"
              className="mr-2"
              checked={allChecked}
              onChange={(event) =>
                setSelected(event.target.checked ? skus.map((sku) => sku.id) : [])
              }
            />
            全选本周主推
          </label>
        </div>
        <div className="divide-y divide-[#F3E6D8]">
          {skus.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[#8B735E]">
              还没有 SKU。先粘贴一条供应商链接。
            </p>
          ) : (
            skus.map((sku) => (
              <article
                key={sku.id}
                className="grid gap-3 px-4 py-4 md:grid-cols-[auto_88px_1fr_auto]"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(sku.id)}
                  onChange={(event) =>
                    setSelected((prev) =>
                      event.target.checked
                        ? [...prev, sku.id]
                        : prev.filter((id) => id !== sku.id),
                    )
                  }
                />
                <div className="h-20 w-20 overflow-hidden rounded-xl bg-[#EFE4D8]">
                  {sku.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sku.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="font-mono text-[11px] text-[#A8896E]">{sku.sku}</p>
                  <p className="font-semibold text-[#2C241B]">{sku.name_cn}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-[#6B5646]">
                    {sku.etsy_title || "尚未生成英文标题"}
                  </p>
                  <p className="mt-1 text-xs text-[#8B735E]">
                    {sku.category} · RMB {sku.cost_rmb.toFixed(2)} · MSRP $
                    {sku.msrp_usd.toFixed(2)} · MOQ {sku.moq}
                    {sku.tags.length ? ` · ${sku.tags.length} tags` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => generateCopy(sku.id)}
                  className="h-fit rounded-full bg-[#F3E6D8] px-3 py-2 text-xs font-semibold text-[#5C4636]"
                >
                  一键生成 Etsy 铺货包
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
