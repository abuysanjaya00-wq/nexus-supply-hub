"use client";

import { useState, useTransition } from "react";
import {
  Check,
  Copy,
  Download,
  Loader2,
  Sparkles,
  Tags,
} from "lucide-react";
import { generateListingAction } from "@/app/actions/productActions";
import type { AiListingResult } from "@/lib/ai-listing";
import type { Product } from "@/lib/products";

export default function ProductAiPanel({ product }: { product: Product }) {
  const [listing, setListing] = useState<AiListingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateListingAction(product.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setListing(result.data);
    });
  }

  async function copyText(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1600);
  }

  function downloadMediaKit() {
    const payload = {
      sku: product.sku,
      name: product.name,
      image_url: product.image_url,
      style: product.style,
      specs: product.specs,
      material: product.material,
      weight_g: product.weight_g,
      min_price: product.min_price,
      notes: product.notes,
      category: product.category,
      supply_mode: product.supply_mode,
      generated_at: new Date().toISOString(),
      photo_kit: product.image_url
        ? [product.image_url]
        : [],
      usage:
        "Nexus Supply Media & High-Res Photo Kit — use for Etsy / Shopify creative only.",
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${product.sku}-media-kit.json`;
    anchor.click();
    URL.revokeObjectURL(url);

    if (product.image_url) {
      window.open(product.image_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={downloadMediaKit}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-indigo-200 hover:text-indigo-700"
      >
        <Download className="h-4 w-4" />
        一键下载营销素材包 (Media & High-Res Photo Kit)
      </button>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {pending ? "Generating Etsy listing…" : "Generate Etsy Listing with AI"}
      </button>

      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {listing ? (
        <div className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
              AI Listing Draft · {listing.source}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <Tags className="h-3.5 w-3.5" />
              {listing.tags.length} tags
            </span>
          </div>

          <section className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                SEO Title
              </h3>
              <CopyButton
                active={copied === "title"}
                onClick={() => copyText("title", listing.title)}
              />
            </div>
            <p className="text-sm leading-relaxed text-slate-800">
              {listing.title}
            </p>
          </section>

          <section className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                English Description
              </h3>
              <CopyButton
                active={copied === "description"}
                onClick={() => copyText("description", listing.description)}
              />
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
              {listing.description}
            </pre>
          </section>

          <section className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Etsy Tags (13)
              </h3>
              <CopyButton
                active={copied === "tags"}
                onClick={() => copyText("tags", listing.tags.join(", "))}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {listing.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function CopyButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
    >
      {active ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  );
}
