"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight, ArrowRight, Bike, ChevronRight, Clock3, Mountain, ShieldCheck, Trophy, Wrench } from "lucide-react";
import { useQuestions, useSessions } from "@/lib/use-data";
import type { Category } from "@/lib/types";

const categories: { title: Category; description: string; tag: string; image: string; icon: typeof Mountain }[] = [
  { title: "Suspension Lab", description: "Travel, sag, damping and setup that makes every hit count.", tag: "SETUP & TECH", image: "https://images.unsplash.com/photo-1544191696-15693072a401?auto=format&fit=crop&w=1000&q=85", icon: Mountain },
  { title: "Brake Zone", description: "Get confident with hydraulics, rotors, pads and stopping power.", tag: "CONTROL", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=85", icon: ShieldCheck },
  { title: "Drivetrain Master", description: "Know your gears, clutch, chain and clean shifting setup.", tag: "COMPONENTS", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=85", icon: Wrench },
  { title: "Brand Battle", description: "Match the brands and tech shaping the modern trail bike.", tag: "THE INDUSTRY", image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1000&q=85", icon: Bike },
  { title: "Bike Anatomy", description: "Geometry, wheels and the details behind the ride feel.", tag: "FRAME & FIT", image: "https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=1000&q=85", icon: Mountain },
  { title: "Workshop Mechanic", description: "Build better habits in the home workshop and on the trail.", tag: "MAINTENANCE", image: "https://images.unsplash.com/photo-1593764592116-bfb2a97c642a?auto=format&fit=crop&w=1000&q=85", icon: Wrench },
  { title: "Trail Skills", description: "Sharper lines, smoother braking and more control outdoors.", tag: "RIDE SMART", image: "https://images.unsplash.com/photo-1544191696-15693072a401?auto=format&fit=crop&w=1000&q=85", icon: Mountain },
  { title: "Ultimate MTB Challenge", description: "A full-spectrum mix. No category left behind.", tag: "ALL TERRAIN", image: "/images/mtb-hero.png", icon: Trophy },
];

export function HomePage() {
  const { questions } = useQuestions();
  const { sessions } = useSessions();
  const best = sessions.reduce((score, session) => Math.max(score, session.accuracy), 0);
  const avg = sessions.length ? Math.round(sessions.reduce((total, session) => total + session.accuracy, 0) / sessions.length) : 0;
  return (
    <main>
      <section className="relative isolate min-h-[580px] overflow-hidden border-b border-[#202922] bg-[#101711] sm:min-h-[650px]">
        <div className="absolute inset-0 -z-20 bg-[url('/images/mtb-hero.png')] bg-cover bg-[position:70%_center] sm:bg-[center_45%]" role="img" aria-label="Mountain biker riding a rocky forest singletrack" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,11,9,.98)_0%,rgba(8,11,9,.86)_42%,rgba(8,11,9,.22)_100%),linear-gradient(0deg,#080b09_0%,transparent_45%)]" />
        <div className="shell flex min-h-[580px] items-center py-20 sm:min-h-[650px]">
          <div className="max-w-[700px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#a5cf67]/30 bg-black/35 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.14em] text-[#d8f4aa] backdrop-blur"><span className="size-1.5 rounded-full bg-[var(--lime)]" /> Built for the trail curious</div>
            <h1 className="display-title max-w-[690px]">HOW MUCH DO YOU REALLY KNOW ABOUT <span className="text-[var(--lime)]">MTB?</span></h1>
            <p className="mt-6 max-w-[540px] text-base leading-7 text-[#c0c8c2] sm:text-lg">Test your knowledge of mountain bikes, suspension, components, maintenance and riding technology.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/quiz" className="btn-primary !min-h-12 !px-6">START RIDING <ArrowRight size={16} /></Link>
              <Link href="/leaderboard" className="btn-secondary !min-h-12 !bg-black/35 !px-6 backdrop-blur">VIEW LEADERBOARD <ArrowDownRight size={16} /></Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-[11px] font-bold uppercase tracking-[.13em] text-[#b3bcb5]"><span className="flex items-center gap-2"><Mountain size={15} className="text-[var(--lime)]" /> 7 ride disciplines</span><span className="flex items-center gap-2"><Wrench size={15} className="text-[var(--lime)]" /> 60+ questions</span><span className="flex items-center gap-2"><Trophy size={15} className="text-[var(--lime)]" /> Earn your stripes</span></div>
          </div>
        </div>
      </section>

      <section className="shell relative -mt-1 grid grid-cols-2 gap-3 pb-10 sm:grid-cols-4 sm:gap-4" aria-label="Quiz statistics">
        {[
          { label: "Quiz attempts", value: sessions.length.toLocaleString(), icon: Trophy },
          { label: "Personal best", value: `${best}%`, icon: ArrowRight },
          { label: "Questions ready", value: questions.length.toLocaleString(), icon: Wrench },
          { label: "Average accuracy", value: `${avg}%`, icon: Clock3 },
        ].map((stat) => <div key={stat.label} className="surface flex min-h-[96px] items-center gap-3.5 px-4 py-4 sm:min-h-[104px] sm:px-5"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#222e20] text-[var(--lime)]"><stat.icon size={18} /></span><div><p className="text-xl font-black tracking-tight sm:text-2xl">{stat.value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#929e95] sm:text-[11px]">{stat.label}</p></div></div>)}
      </section>

      <section className="shell pb-20 pt-12 sm:pb-28 sm:pt-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div><p className="kicker">Pick your line</p><h2 className="mt-3 text-3xl font-black tracking-[-.05em] sm:text-4xl">CHOOSE YOUR CHALLENGE</h2><p className="mt-2 max-w-lg text-sm leading-6 text-[#98a39b]">Eight ways to ride smarter. Pick a focus or take on the whole mountain.</p></div>
          <Link href="/quiz" className="hidden items-center gap-2 text-sm font-bold text-[var(--lime)] hover:text-white sm:flex">All quizzes <ChevronRight size={16} /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => <Link href={`/quiz?category=${encodeURIComponent(category.title)}`} key={category.title} className="group relative isolate flex min-h-[280px] flex-col justify-end overflow-hidden rounded-2xl border border-[#27312a] bg-[#121914] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#718d4a] sm:min-h-[305px]">
            <div className="absolute inset-0 -z-20 bg-[linear-gradient(0deg,rgba(8,11,9,.98),rgba(8,11,9,.06)_82%)]" />
            <Image src={category.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="absolute inset-0 -z-30 size-full object-cover opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-75" onError={(event) => { event.currentTarget.style.display = "none"; }} />
            <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/35 px-2.5 py-1.5 text-[9px] font-extrabold tracking-[.14em] text-[#d9e3db] backdrop-blur">{category.tag}</div>
            <div className="mb-auto ml-auto mt-4 grid size-10 place-items-center rounded-xl border border-white/15 bg-black/30 text-[var(--lime)] backdrop-blur"><category.icon size={18} /></div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[.1em] text-[var(--lime)]">{String(index + 1).padStart(2, "0")} / 08</p>
            <h3 className="text-xl font-extrabold tracking-[-.03em]">{category.title}</h3>
            <p className="mt-2 min-h-10 text-xs leading-5 text-[#c1c9c2]">{category.description}</p>
            <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3 text-[11px] font-bold uppercase tracking-[.1em] text-white/85"><span>Start challenge</span><ArrowRight className="text-[var(--lime)] transition-transform group-hover:translate-x-1" size={16} /></div>
          </Link>)}
        </div>
        <div className="mt-9 text-center sm:hidden"><Link href="/quiz" className="btn-secondary">Browse all quizzes <ChevronRight size={15} /></Link></div>
      </section>
    </main>
  );
}
