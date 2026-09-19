"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ShieldCheck } from "lucide-react";
import {
  buildMediaKitText,
  formatUsd,
} from "@/lib/listing-export";
import type { Product } from "@/lib/products-shared";

export default function HomeBestsellers({ products }: { products: Product[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyKit(product: Product) {
    const text = buildMediaKitText(product);
    await navigator.clipboard.writeText(text);
    setCopiedId(product.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  }

  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[#E4D5C5] bg-white/70 p-10 text-center text-sm text-[#7A6554]">
        暂无链主爆款，请先在后台导入供应链商品。
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <article
          key={product.id}
          className="flex flex-col overflow-hidden rounded-2xl border border-[#E8D9C8] bg-[#FFFCFA] shadow-[0_12px_40px_rgba(74,48,32,0.06)]"
        >
          <div className="relative aspect-[4/3] bg-[#EFE4D8]">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : null}
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#FFFCFA]/95 px-2.5 py-1 text-[11px] font-semibold text-[#6B7A45] ring-1 ring-[#D8E0C4]">
              <ShieldCheck className="h-3.5 w-3.5" />
              链主之家 · Etsy 爆款
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-3 p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A8896E]">
                {product.category}
              </p>
              <h3 className="mt-1 line-clamp-2 font-[family-name:var(--font-display)] text-lg font-semibold text-[#2C241B]">
                {product.english_title || product.name}
              </h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-[#A8896E]">批发底价</p>
                <p className="text-xl font-bold text-[#C45C26]">
                  {formatUsd(product.min_price)}
                </p>
              </div>
              <p className="font-mono text-[11px] text-[#8B735E]">{product.sku}</p>
            </div>

            <div className="mt-auto flex flex-wrap gap-2 border-t border-[#EFE4D8] pt-3">
              <button
                type="button"
                onClick={() => copyKit(product)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#C45C26] px-3 py-2.5 text-xs font-semibold text-[#FFF8F2] transition hover:bg-[#A74A1C]"
              >
                {copiedId === product.id ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    已复制素材包
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    一键复制铺货素材包
                  </>
                )}
              </button>
              <Link
                href={`/products/${product.id}`}
                className="inline-flex items-center justify-center rounded-xl border border-[#E0CDB8] px-3 py-2.5 text-xs font-semibold text-[#5C4636] hover:bg-[#F7EEE4]"
              >
                详情
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
