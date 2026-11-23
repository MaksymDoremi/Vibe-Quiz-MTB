"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bike, Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/quiz", label: "Play quiz" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/stats", label: "Statistics" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[#202922] bg-[#080b09]/90 backdrop-blur-xl">
      <div className="shell flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="MTB IQ home" onClick={() => setMenuOpen(false)}>
          <span className="grid size-9 place-items-center rounded-lg bg-[var(--lime)] text-[#12170e]"><Bike size={20} strokeWidth={2.7} /></span>
          <span className="text-lg font-black tracking-[-.06em]">MTB <span className="lime">IQ</span></span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {links.map((link) => <Link key={link.href} href={link.href} className={`text-[13px] font-semibold transition-colors ${pathname === link.href ? "text-[var(--lime)]" : "text-[#a4aea7] hover:text-white"}`}>{link.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/admin/login" className="text-[12px] font-bold uppercase tracking-[.08em] text-[#78837b] transition-colors hover:text-white">Admin</Link>
          <Link href="/quiz" className="btn-primary !min-h-10 !px-4">Start riding</Link>
        </div>
        <button type="button" className="grid size-10 place-items-center rounded-lg border border-[var(--border)] md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen}>
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
      {menuOpen && <nav className="border-t border-[var(--border)] px-5 py-4 md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-1">
          {[...links, { href: "/admin/login", label: "Admin login" }].map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={`rounded-lg px-3 py-3 text-sm font-semibold ${pathname === link.href ? "bg-[#182019] text-[var(--lime)]" : "text-[#bcc4be] hover:bg-[#121713]"}`}>{link.label}</Link>)}
        </div>
      </nav>}
    </header>
  );
}
