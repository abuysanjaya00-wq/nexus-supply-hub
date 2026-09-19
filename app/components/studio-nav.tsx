"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./sign-out-button";

const LINKS = [
  { href: "/products", label: "选品中心" },
  { href: "/reseller/stores", label: "店铺绑定" },
  { href: "/reseller/orders/new", label: "代发下单" },
  { href: "/warehouse/fulfillment", label: "仓库发货" },
  { href: "/admin/supply", label: "供应链中台" },
  { href: "/admin/upload", label: "商品导入" },
];

export default function StudioNav() {
  const pathname = usePathname();

  return (
    <nav className="studio-nav" aria-label="Studio navigation">
      <div className="studio-nav-links">
        {LINKS.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`studio-nav-link${active ? " is-active" : ""}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      <SignOutButton />
    </nav>
  );
}
