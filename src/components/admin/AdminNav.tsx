"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/reglages", label: "Réglages" },
];

export function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  return (
    <nav className="admin-nav" aria-label="Administration">
      <Link href="/admin" className="logo">
        Ines<span>.</span> B
      </Link>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
      <div className="sep" />
      <Link href="/" target="_blank">
        Voir le site ↗
      </Link>
      <form action={signOut}>
        <button type="submit">Se déconnecter</button>
      </form>
    </nav>
  );
}
