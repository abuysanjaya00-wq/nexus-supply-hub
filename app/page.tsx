import Link from "next/link";
import {
  ArrowRight,
  Copy,
  PackageCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import HomeBestsellers from "@/app/components/home-bestsellers";
import { listChainLeaderBestsellers } from "@/lib/products";

const STEPS = [
  {
    step: "01",
    title: "逛选品中心",
    desc: "在链主之家精选爆款里挑 SKU，看清批发底价与供应模式。",
    icon: ShoppingBag,
    href: "/products",
  },
  {
    step: "02",
    title: "一键复制素材包",
    desc: "复制英文标题、长描述、Tags 与主图链接，直接粘贴到 Etsy 草稿。",
    icon: Copy,
    href: "#bestsellers",
  },
  {
    step: "03",
    title: "绑定你的店铺",
    desc: "连接 Etsy / Shopify / TikTok 等渠道，打通订单同步与单号回传。",
    icon: Store,
    href: "/reseller/stores",
  },
  {
    step: "04",
    title: "提交一件代发",
    desc: "填写 C 端买家地址，仓库打包发货，物流单号自动回传。",
    icon: Truck,
    href: "/reseller/orders/new",
  },
];

export default async function Home() {
  const bestsellers = await listChainLeaderBestsellers(6);

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F0E8] text-[#2C241B]">
      <header className="sticky top-0 z-50 border-b border-[#E5D6C5]/80 bg-[#FBF7F1]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C45C26] font-[family-name:var(--font-display)] text-lg font-bold text-[#FFF8F2]">
              N
            </span>
            <span className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
              Nexus Supply
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[#6B5646] md:flex">
            <a href="#steps" className="transition hover:text-[#C45C26]">
              四步上手
            </a>
            <a href="#bestsellers" className="transition hover:text-[#C45C26]">
              链主爆款
            </a>
            <Link href="/products" className="transition hover:text-[#C45C26]">
              选品中心
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-[#5C4636] transition hover:text-[#C45C26] sm:inline"
            >
              登录
            </Link>
            <Link
              href="/products"
              className="rounded-full bg-[#C45C26] px-4 py-2 text-sm font-semibold text-[#FFF8F2] shadow-sm transition hover:bg-[#A74A1C]"
            >
              开始选品
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#E5D6C5]/70">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 15% 10%, #E8C4A8 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 90% 20%, #D9CDB8 0%, transparent 50%), linear-gradient(165deg, #FBF7F1 0%, #F3EADF 55%, #EFE4D6 100%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C45C26]">
            Etsy Dropshipping Mid-Office
          </p>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] tracking-tight text-[#2C241B] sm:text-5xl lg:text-6xl">
            Nexus Supply
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#6B5646] sm:text-lg">
            专为海外 Etsy 卖家打造的一件代发中台：链主精选爆款、一键素材包、店铺绑定到仓配回传，四步走完铺货闭环。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C45C26] px-7 py-3.5 text-sm font-semibold text-[#FFF8F2] shadow-[0_10px_28px_rgba(196,92,38,0.28)] transition hover:bg-[#A74A1C]"
            >
              进入选品中心
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#bestsellers"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D9C4AE] bg-[#FFFCFA]/80 px-7 py-3.5 text-sm font-semibold text-[#5C4636] transition hover:bg-white"
            >
              <PackageCheck className="h-4 w-4 text-[#C45C26]" />
              查看链主之家爆款
            </a>
          </div>
        </div>
      </section>

      <section id="steps" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C45C26]">
            Foolproof flow
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[#2C241B] sm:text-4xl">
            四步傻瓜式引导
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#6B5646] sm:text-base">
            不需要复杂配置。跟着四步走：选品 → 复制素材 → 绑店 → 代发，当天就能上架测试。
          </p>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.step}>
                <Link
                  href={item.href}
                  className="group flex h-full flex-col rounded-2xl border border-[#E5D6C5] bg-[#FFFCFA] p-5 shadow-[0_8px_30px_rgba(74,48,32,0.04)] transition hover:-translate-y-0.5 hover:border-[#D4B89A] hover:shadow-[0_14px_36px_rgba(74,48,32,0.08)]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#C45C26]/80">
                      {item.step}
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3E6D8] text-[#C45C26] transition group-hover:bg-[#C45C26] group-hover:text-[#FFF8F2]">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#2C241B]">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#7A6554]">
                    {item.desc}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#C45C26]">
                    去完成
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section
        id="bestsellers"
        className="border-y border-[#E5D6C5]/80 bg-[#FBF7F1]"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C45C26]">
                Chain Leader Home
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[#2C241B] sm:text-4xl">
                链主之家 · Etsy 爆款实时选品
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#6B5646] sm:text-base">
                实时读取已认证链主工厂的热销 SKU。点击即可复制完整铺货素材包（标题 / 描述 / Tags / 主图）。
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#C45C26] hover:text-[#A74A1C]"
            >
              查看全部选品
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <HomeBestsellers products={bestsellers} />
        </div>
      </section>

      <footer className="mt-auto border-t border-[#E5D6C5] bg-[#2C241B] py-10 text-[#C9B8A6]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C45C26] text-sm font-bold text-[#FFF8F2]">
              N
            </span>
            <span className="font-semibold text-[#F6F0E8]">Nexus Supply</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Nexus Supply · Built for Etsy
            dropshippers
          </p>
        </div>
      </footer>
    </div>
  );
}
