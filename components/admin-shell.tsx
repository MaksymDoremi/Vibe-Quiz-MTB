"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bike, LayoutDashboard, LogOut, Settings, ShieldCheck, Wrench, ClipboardList } from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/questions", label: "Questions", icon: ClipboardList },
  { href: "/admin/questions?new=1", label: "Add Question", icon: Wrench },
  { href: "/admin/sessions", label: "Quiz Sessions", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const checkAccess = window.setTimeout(() => {
      let allowed = false;
      try { allowed = sessionStorage.getItem("mtbiq_admin_auth") === "1"; } catch { allowed = false; }
      setAuthorized(allowed);
      setChecked(true);
      if (!allowed) router.replace("/admin/login");
    }, 0);
    return () => window.clearTimeout(checkAccess);
  }, [router]);

  function logout() {
    try { sessionStorage.removeItem("mtbiq_admin_auth"); } catch { /* session storage can be disabled by the browser */ }
    router.replace("/admin/login");
  }

  if (!checked || !authorized) return <main className="shell grid min-h-[calc(100vh-72px)] place-items-center py-12"><div className="surface px-7 py-6 text-center"><div className="mx-auto mb-3 grid size-10 place-items-center rounded-xl bg-[#1d291a] text-[var(--lime)]"><ShieldCheck size={18} /></div><p className="text-sm font-bold">Checking admin access…</p></div></main>;

  return <main className="shell min-h-[calc(100vh-72px)] py-6 sm:py-9">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="kicker">MTB IQ / Admin console</p><h1 className="mt-1 text-2xl font-black tracking-[-.05em] sm:text-3xl">CONTROL ROOM</h1></div><button onClick={logout} className="btn-secondary !min-h-10 !px-3 text-xs"><LogOut size={14} /> Log out</button></div>
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <aside className="surface h-fit p-2.5 lg:sticky lg:top-[96px]"><nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto lg:flex-col">{adminLinks.map((item) => {
        const active = pathname === item.href.split("?")[0];
        return <Link key={item.href} href={item.href} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-xs font-bold transition ${active ? "bg-[#202b1d] text-[var(--lime)]" : "text-[#a4afa6] hover:bg-[#171d18] hover:text-white"}`}><item.icon size={16} /><span>{item.label}</span></Link>;
      })}</nav><div className="mt-3 hidden border-t border-[var(--border)] px-3 py-3 lg:block"><Link href="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.1em] text-[#7f8b81] hover:text-white"><Bike size={14} /> View public site</Link></div></aside>
      <div className="min-w-0">{children}</div>
    </div>
  </main>;
}
