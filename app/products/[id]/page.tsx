import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import SignOutButton from "@/app/components/sign-out-button";
import { formatUsd, getProductById } from "@/lib/products";
import ProductAiPanel from "./product-ai-panel";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product = null;
  try {
    product = await getProductById(id);
  } catch {
    product = null;
  }

  if (!product) notFound();

  const specs = [
    { label: "SKU", value: product.sku },
    { label: "Style", value: product.style || "—" },
    { label: "Specs", value: product.specs || "—" },
    {
      label: "Weight",
      value: product.weight_g != null ? `${product.weight_g} g` : "—",
    },
    { label: "Material", value: product.material || "—" },
    { label: "Category", value: product.category || "—" },
    { label: "Supply mode", value: product.supply_mode },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to catalog
          </Link>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1.15fr_0.85fr] sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[4/3] bg-slate-100">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : null}
            {product.verified_chain_leader ? (
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                <ShieldCheck className="h-4 w-4" />
                Verified Chain Leader
              </span>
            ) : null}
          </div>
          <div className="space-y-3 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              {product.category}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {product.name}
            </h1>
            {product.notes ? (
              <p className="text-sm leading-relaxed text-slate-600">
                {product.notes}
              </p>
            ) : null}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Minimum wholesale
            </p>
            <p className="mt-2 text-4xl font-bold text-indigo-600">
              {formatUsd(product.min_price)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Floor price for verified partners · {product.supply_mode}
            </p>

            <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5">
              {specs.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-4 text-sm"
                >
                  <dt className="text-slate-500">{item.label}</dt>
                  <dd className="max-w-[60%] text-right font-medium text-slate-900">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              AI listing & media kit
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Generate Etsy SEO copy and download the marketing asset pack.
            </p>
            <div className="mt-5">
              <ProductAiPanel product={product} />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
