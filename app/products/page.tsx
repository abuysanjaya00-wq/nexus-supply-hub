import { Suspense } from "react";
import Link from "next/link";
import { Boxes, Leaf } from "lucide-react";
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

const NAV = [
  { href: "/products", label: "选品中心" },
  { href: "/reseller/stores", label: "店铺绑定" },
  { href: "/reseller/orders/new", label: "代发下单" },
  { href: "/warehouse/fulfillment", label: "仓库发货" },
  { href: "/admin/supply", label: "供应链中台" },
  { href: "/admin/upload", label: "商品导入" },
];

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
    <div className="min-h-screen bg-[#F6F0E8] text-[#2C241B]">
      <header className="sticky top-0 z-40 border-b border-[#E5D6C5]/90 bg-[#FBF7F1]/92 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C45C26] text-sm font-bold text-[#FFF8F2]">
                N
              </span>
              <span className="hidden font-[family-name:var(--font-display)] font-semibold tracking-tight sm:inline">
                Nexus Supply
              </span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((link) => {
                const active = link.href === "/products";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "bg-[#F3E6D8] text-[#C45C26]"
                        : "text-[#6B5646] hover:bg-[#F3E6D8]/70 hover:text-[#2C241B]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <SignOutButton />
        </div>
        <div className="flex gap-1 overflow-x-auto border-t border-[#EFE4D8] px-4 py-2 md:hidden">
          {NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full bg-[#F3E6D8] px-3 py-1 text-[11px] font-semibold text-[#5C4636]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#C45C26]">
              <Leaf className="h-3.5 w-3.5" />
              Etsy earth catalog
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[#2C241B] sm:text-4xl">
              选品中心
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6B5646]">
              温暖大地色工作台：筛选链主爆款，一键复制刊登素材，或直接跳转一件代发下单。
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5D6C5] bg-[#FFFCFA] px-3 py-1.5 text-xs font-medium text-[#6B5646]">
            <Boxes className="h-3.5 w-3.5 text-[#C45C26]" />
            {products.length} SKUs in view
          </div>
        </div>

        <Suspense
          fallback={
            <div className="mb-6 h-28 animate-pulse rounded-2xl bg-[#F3E6D8]/60" />
          }
        >
          <ProductFilters categories={categories} />
        </Suspense>

        {error ? (
          <div className="mt-6 rounded-2xl border border-[#E8B4A2] bg-[#FDF2EC] p-5 text-sm text-[#8B3E28]">
            <p className="font-semibold">选品目录暂时不可用</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-[#A65A42]">
              请确认已登录，并已执行 phase5 / phase6 SQL。
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#D9C4AE] bg-[#FFFCFA] p-12 text-center">
            <p className="text-base font-semibold text-[#2C241B]">
              没有匹配的商品
            </p>
            <p className="mt-2 text-sm text-[#7A6554]">
              试试重置筛选，或前往后台导入供应链表格。
            </p>
            <Link
              href="/admin/upload"
              className="mt-5 inline-flex rounded-full bg-[#C45C26] px-4 py-2 text-sm font-semibold text-[#FFF8F2]"
            >
              去导入商品
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
