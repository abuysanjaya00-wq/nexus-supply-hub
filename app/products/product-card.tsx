import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { formatUsd } from "@/lib/listing-export";
import type { Product } from "@/lib/products-shared";
import ListingExportButton from "./listing-export-button";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5D6C5] bg-[#FFFCFA] shadow-[0_10px_32px_rgba(74,48,32,0.05)] transition hover:-translate-y-0.5 hover:border-[#D4B89A] hover:shadow-[0_16px_40px_rgba(74,48,32,0.09)]">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#EFE4D8]">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#A8896E]">
              No image
            </div>
          )}
          {product.verified_chain_leader ? (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#FFFCFA]/95 px-2.5 py-1 text-[11px] font-semibold text-[#6B7A45] shadow-sm ring-1 ring-[#D8E0C4]">
              <ShieldCheck className="h-3.5 w-3.5" />
              链主之家
            </span>
          ) : null}
          <span className="absolute bottom-3 right-3 rounded-full bg-[#2C241B]/88 px-2.5 py-1 text-[11px] font-medium text-[#F6F0E8]">
            {product.supply_mode}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A8896E]">
            {product.category || "General"}
          </p>
          <Link href={`/products/${product.id}`}>
            <h2 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-[#2C241B] hover:text-[#C45C26]">
              {product.english_title || product.name}
            </h2>
          </Link>
        </div>

        <dl className="mt-auto grid grid-cols-2 gap-2 text-xs text-[#6B5646]">
          <div>
            <dt className="text-[#A8896E]">SKU</dt>
            <dd className="font-mono text-[12px] text-[#2C241B]">{product.sku}</dd>
          </div>
          <div>
            <dt className="text-[#A8896E]">Stock</dt>
            <dd className="text-[#2C241B]">{product.stock}</dd>
          </div>
        </dl>

        <div className="flex items-end justify-between border-t border-[#EFE4D8] pt-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[#A8896E]">
              Min wholesale
            </p>
            <p className="text-lg font-bold text-[#C45C26]">
              {formatUsd(product.min_price)}
            </p>
          </div>
          <Link
            href={`/reseller/orders/new?sku=${encodeURIComponent(product.sku)}`}
            className="text-xs font-semibold text-[#C45C26] hover:underline"
          >
            代发下单 →
          </Link>
        </div>

        <ListingExportButton product={product} />
      </div>
    </article>
  );
}
