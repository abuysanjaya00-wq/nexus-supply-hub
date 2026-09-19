import Link from "next/link";
import SignOutButton from "@/app/components/sign-out-button";

const LINKS = [
  { href: "/products", label: "选品中心" },
  { href: "/reseller/stores", label: "店铺绑定" },
  { href: "/reseller/orders/new", label: "代发下单" },
  { href: "/warehouse/fulfillment", label: "仓库发货" },
  { href: "/admin/supply", label: "供应链中台" },
  { href: "/admin/upload", label: "商品导入" },
];

export default function HubShell({
  title,
  subtitle,
  children,
  activePath,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  activePath?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                N
              </span>
              <span className="hidden font-bold tracking-tight sm:inline">
                Nexus Supply
              </span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {LINKS.map((link) => {
                const active =
                  activePath === link.href ||
                  (activePath?.startsWith(link.href) && link.href !== "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
        <div className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
}
