"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, CircleHelp, Clock3, Layers3, Trophy } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { useQuestions, useSessions } from "@/lib/use-data";
import { categories, type QuestionDifficulty } from "@/lib/types";

const levels: QuestionDifficulty[] = ["Beginner", "Intermediate", "Expert"];

export function AdminDashboard() {
  const { questions } = useQuestions();
  const { sessions } = useSessions();
  const average = sessions.length ? Math.round(sessions.reduce((sum, session) => sum + session.accuracy, 0) / sessions.length) : 0;
  const stats = [
    { label: "Total questions", value: questions.length, icon: CircleHelp, note: "Ready to ride" },
    { label: "Quiz sessions", value: sessions.length, icon: Trophy, note: "Saved on this device" },
    { label: "Average score", value: `${average}%`, icon: BarChart3, note: "Across saved runs" },
    { label: "Categories", value: categories.length, icon: Layers3, note: "Riding disciplines" },
  ];
  const recentlyAdded = [...questions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  return <AdminShell><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="surface p-4 sm:p-5"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.1em] text-[#909b92]">{stat.label}</span><stat.icon size={17} className="text-[var(--lime)]" /></div><p className="mt-5 text-3xl font-black tracking-[-.05em]">{stat.value}</p><p className="mt-1 text-[10px] text-[#7e8a81]">{stat.note}</p></div>)}</div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_.85fr]">
      <section className="surface p-5"><div className="mb-5 flex items-center justify-between gap-3"><div><p className="kicker">Question bank</p><h2 className="mt-1 text-lg font-extrabold">DIFFICULTY MIX</h2></div><Link href="/admin/questions" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.1em] text-[var(--lime)]">Manage <ArrowRight size={13} /></Link></div><div className="grid gap-4">{levels.map((level) => { const count = questions.filter((question) => question.difficulty === level).length; const percentage = questions.length ? count / questions.length * 100 : 0; return <div key={level}><div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold">{level}</span><span className="font-mono text-[#9aa59c]">{count} questions</span></div><div className="h-2 overflow-hidden rounded-full bg-[#252e27]"><div className="h-full rounded-full bg-[var(--lime)]" style={{ width: `${percentage}%` }} /></div></div>; })}</div>
        <div className="mt-7 border-t border-[var(--border)] pt-5"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.1em] text-[#88958b]">By category</p><div className="grid gap-2 sm:grid-cols-2">{categories.filter((category) => category !== "Ultimate MTB Challenge").map((category) => <div key={category} className="flex items-center justify-between rounded-lg bg-[#0c110e] px-3 py-2 text-[11px]"><span className="truncate text-[#b8c2b9]">{category}</span><span className="ml-2 font-mono font-bold text-[var(--lime)]">{questions.filter((question) => question.category === category).length}</span></div>)}</div></div>
      </section>
      <section className="surface p-5"><div className="mb-5 flex items-end justify-between gap-3"><div><p className="kicker">Recently added</p><h2 className="mt-1 text-lg font-extrabold">NEW QUESTIONS</h2></div><Link href="/admin/questions?new=1" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.1em] text-[var(--lime)]"><BookOpenCheck size={13} /> Add new</Link></div>{recentlyAdded.length ? <div className="grid gap-2">{recentlyAdded.map((question) => <div key={question.id} className="rounded-xl border border-[var(--border)] bg-[#0c110e] p-3"><p className="line-clamp-2 text-xs font-bold leading-5">{question.text}</p><div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[.08em] text-[#89958c]"><span>{question.category}</span><span>· {question.difficulty}</span><span>· {question.type}</span></div></div>)}</div> : <div className="py-10 text-center text-sm text-[#909b92]">No questions in the bank yet.</div>}<Link href="/admin/sessions" className="mt-5 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[#121914] px-4 py-3 text-xs font-bold text-[#c4cdc5] hover:border-[#66764b]"><span className="flex items-center gap-2"><Clock3 size={15} className="text-[var(--lime)]" /> Review quiz sessions</span><ArrowRight size={14} /></Link></section>
    </div></AdminShell>;
}
