import { Suspense } from "react";
import Link from "next/link";
import { Boxes, Upload } from "lucide-react";
import SignOutButton from "@/app/components/sign-out-button";
import {
  listCategories,
  listProducts,
  type SupplyMode,
} from "@/lib/products";
import ProductCard from "./product-card";
import ProductFilters from "./product-filters";

type Search = {
  category?: string;
  mode?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const category =
    params.category && params.category !== "all" ? params.category : undefined;
  const supplyMode =
    params.mode === "OEM" || params.mode === "Dropship Ready"
      ? (params.mode as SupplyMode)
      : undefined;

  let products: Awaited<ReturnType<typeof listProducts>> = [];
  let categories: string[] = [];
  let error: string | null = null;

  try {
    [products, categories] = await Promise.all([
      listProducts({ category, supplyMode }),
      listCategories(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load catalog";
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                N
              </span>
              <span className="font-bold tracking-tight">
                NexusSupply <span className="text-indigo-600">Hub</span>
              </span>
            </Link>
            <span className="hidden text-slate-300 sm:inline">/</span>
            <span className="hidden text-sm font-medium text-slate-500 sm:inline">
              Supply Catalog
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/upload"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700"
            >
              <Upload className="h-3.5 w-3.5" />
              CSV Import
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Verified industrial supply
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Product Hall
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Filter by category and supply mode, then open any SKU to generate
              an Etsy-ready listing with AI.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            <Boxes className="h-3.5 w-3.5 text-indigo-600" />
            {products.length} SKUs in view
          </div>
        </div>

        <Suspense
          fallback={
            <div className="mb-6 h-28 animate-pulse rounded-2xl bg-white" />
          }
        >
          <ProductFilters categories={categories} />
        </Suspense>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
            <p className="font-semibold">Catalog unavailable</p>
            <p className="mt-1">{error}</p>
            <p className="mt-3 text-rose-700">
              Run <code className="font-mono">sql/phase5-nexus-products.sql</code>{" "}
              in Supabase, then confirm you are logged in.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-base font-semibold text-slate-800">
              No products match these filters
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Reset filters or import a CSV from the admin uploader.
            </p>
            <Link
              href="/admin/upload"
              className="mt-5 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Open CSV Import
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
