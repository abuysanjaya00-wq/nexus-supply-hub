"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import {
  buildListingExport,
  buildMediaKitText,
  type ProductListingFields,
} from "@/lib/listing-export";

export default function ListingExportButton({
  product,
}: {
  product: ProductListingFields & { image_url?: string | null };
}) {
  const [copied, setCopied] = useState(false);

  async function copyListing() {
    const text = buildMediaKitText(product);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function downloadJson() {
    const payload = buildListingExport(product);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${product.sku}-listing-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={copyListing}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5D6C5] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#5C4636] hover:border-[#C45C26]/40 hover:text-[#C45C26]"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-[#6B7A45]" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? "已复制素材包" : "复制铺货素材包"}
      </button>
      <button
        type="button"
        onClick={downloadJson}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5D6C5] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#5C4636] hover:border-[#C45C26]/40 hover:text-[#C45C26]"
      >
        <Download className="h-3.5 w-3.5" />
        导出 JSON
      </button>
    </div>
  );
}
