"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./sign-out-button";

const LINKS = [
  { href: "/products", label: "Product Hall" },
  { href: "/admin/upload", label: "CSV Import" },
  { href: "/", label: "Marketing" },
];

export default function StudioNav() {
  const pathname = usePathname();

  return (
    <nav className="studio-nav" aria-label="Studio navigation">
      <div className="studio-nav-links">
        {LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
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
