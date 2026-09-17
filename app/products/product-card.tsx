import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { formatUsd, type Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}
        {product.verified_chain_leader ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Chain Leader
          </span>
        ) : null}
        <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/85 px-2.5 py-1 text-[11px] font-medium text-white">
          {product.supply_mode}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {product.category || "General"}
          </p>
          <h2 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900">
            {product.name}
          </h2>
        </div>

        <dl className="mt-auto grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div>
            <dt className="text-slate-400">SKU</dt>
            <dd className="font-mono text-[12px] text-slate-800">{product.sku}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Material</dt>
            <dd className="line-clamp-1 text-slate-800">
              {product.material || "—"}
            </dd>
          </div>
        </dl>

        <div className="flex items-end justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Min wholesale
            </p>
            <p className="text-lg font-bold text-indigo-600">
              {formatUsd(product.min_price)}
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 opacity-0 transition group-hover:opacity-100">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}
