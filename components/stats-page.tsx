"use client";

import { useMemo } from "react";
import { Activity, Award, Bike, Clock3, Crosshair, Flag, Target } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSessions } from "@/lib/use-data";
import { categories, type Difficulty } from "@/lib/types";

const chartColors = ["#c6f36b", "#a9cd68", "#779c55", "#526f43", "#41573a", "#344632", "#29382d"];
const difficulties: Difficulty[] = ["Beginner", "Intermediate", "Expert", "Mixed"];
const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
const tooltipStyle = { backgroundColor: "#111713", border: "1px solid #303b32", borderRadius: 12, color: "#f2f5f2", fontSize: 11 };

export function StatsPage() {
  const { sessions, ready } = useSessions();
  const analytics = useMemo(() => {
    const completed = [...sessions].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
    const totalQuestions = completed.reduce((sum, session) => sum + session.totalQuestions, 0);
    const correctAnswers = completed.reduce((sum, session) => sum + session.correctAnswers, 0);
    const totalTime = completed.reduce((sum, session) => sum + session.durationSeconds, 0);
    const categoryStats = categories.filter((category) => category !== "Ultimate MTB Challenge").map((category) => {
      const answers = completed.flatMap((session) => session.answers).filter((answer) => answer.category === category);
      const correct = answers.filter((answer) => answer.isCorrect).length;
      return { category, label: category.replace(" Master", "").replace(" Lab", "").replace(" Zone", "").replace(" Mechanic", "").replace(" Skills", "").replace(" Anatomy", "").replace(" Battle", ""), total: answers.length, correct, accuracy: answers.length ? Math.round(correct / answers.length * 100) : 0 };
    });
    const difficultyStats = difficulties.map((difficulty) => {
      const group = completed.filter((session) => session.difficulty === difficulty);
      const total = group.reduce((sum, session) => sum + session.totalQuestions, 0);
      const correct = group.reduce((sum, session) => sum + session.correctAnswers, 0);
      return { difficulty, sessions: group.length, accuracy: total ? Math.round(correct / total * 100) : 0, total };
    });
    const daily = completed.slice(-10).map((session) => ({ date: new Date(session.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }), accuracy: session.accuracy, correct: session.correctAnswers, total: session.totalQuestions }));
    const recent = [...completed].reverse().slice(0, 5);
    const pie = [{ name: "Correct", value: correctAnswers }, { name: "Missed", value: Math.max(0, totalQuestions - correctAnswers) }].filter((item) => item.value > 0);
    const rankedCategories = [...categoryStats].filter((item) => item.total > 0).sort((a, b) => b.accuracy - a.accuracy || b.total - a.total);
    const strongest = rankedCategories[0];
    const weakest = rankedCategories[rankedCategories.length - 1];
    const improvement = daily.length > 1 ? daily[daily.length - 1].accuracy - daily[0].accuracy : 0;
    const bestScore = completed.length ? Math.max(...completed.map((session) => session.accuracy)) : 0;
    const averageDuration = completed.length ? Math.round(totalTime / completed.length) : 0;
    return { totalQuestions, correctAnswers, totalTime, averageDuration, bestScore, categoryStats, difficultyStats, daily, recent, pie, strongest, weakest, improvement, accuracy: totalQuestions ? Math.round(correctAnswers / totalQuestions * 100) : 0 };
  }, [sessions]);

  const cards = [
    { label: "Total quizzes played", value: sessions.length, foot: "Saved on this device", icon: Activity },
    { label: "Questions answered", value: analytics.totalQuestions, foot: "Across completed sessions", icon: Bike },
    { label: "Overall accuracy", value: `${analytics.accuracy}%`, foot: "Correct answers / total", icon: Target },
    { label: "Best score", value: `${analytics.bestScore}%`, foot: "Personal session best", icon: Award },
    { label: "Average completion", value: formatDuration(analytics.averageDuration), foot: "Per completed quiz", icon: Clock3 },
    { label: "Total correct answers", value: analytics.correctAnswers, foot: "All-time correct", icon: Crosshair },
  ];

  return <main className="shell py-8 sm:py-12">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="kicker">Your ride log</p><h1 className="display-title mt-2">THE <span className="text-[var(--lime)]">DATA</span><br className="sm:hidden" /> BEHIND THE DIRT.</h1><p className="mt-4 text-sm text-[#98a49a]">Track your answers, discover strengths, and spot your next skill to sharpen.</p></div><div className="rounded-xl border border-[var(--border)] bg-[#111713] px-4 py-3"><p className="text-xl font-black">{sessions.length}</p><p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#849087]">Completed rides</p></div></div>
    <section aria-label="Quiz statistics" className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{cards.map((card) => <article key={card.label} className="surface p-4 sm:p-5"><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#89958c]">{card.label}</p><card.icon size={17} className="text-[var(--lime)]" /></div><p className="mt-5 truncate text-2xl font-black tracking-[-.04em]">{card.value}</p><p className="mt-1 truncate text-[10px] text-[#7f8b81]">{card.foot}</p></article>)}</section>
    {!ready ? <div className="surface p-12 text-center text-sm text-[#8f9b92]">Loading your ride stats…</div> : sessions.length === 0 ? <div className="surface px-5 py-16 text-center"><div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-[#1b2619] text-[var(--lime)]"><Activity size={22} /></div><h2 className="text-lg font-extrabold">Your stats will show up here</h2><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#89958c]">Finish a quiz to see your accuracy trends, category strengths, and progress by difficulty.</p></div> : <>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_.75fr]">
        <section className="surface p-4 sm:p-5"><div className="mb-4 flex items-start justify-between gap-3"><div><p className="kicker">Recent performance</p><h2 className="mt-1 text-lg font-extrabold">ACCURACY OVER TIME</h2></div><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${analytics.improvement >= 0 ? "bg-[#1c2a1d] text-[#b9df86]" : "bg-[#2a1c1e] text-[#f0a0a7]"}`}>{analytics.improvement >= 0 ? "+" : ""}{analytics.improvement} pts</span></div><div className="h-[260px] w-full" role="img" aria-label="Line chart of quiz accuracy in recent sessions">{analytics.daily.length > 1 ? <ResponsiveContainer width="100%" height="100%"><LineChart data={analytics.daily} margin={{ top: 12, right: 8, bottom: 0, left: -18 }}><CartesianGrid stroke="#263029" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="date" tick={{ fill: "#89958c", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fill: "#89958c", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, "Accuracy"]} /><Line type="monotone" dataKey="accuracy" stroke="#c6f36b" strokeWidth={3} dot={{ r: 4, fill: "#c6f36b", stroke: "#12170e", strokeWidth: 2 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-center"><div><Crosshair size={22} className="mx-auto mb-2 text-[#9db77c]" /><p className="text-xs font-bold">One ride logged</p><p className="mt-1 text-[10px] text-[#7f8b81]">Complete another quiz to see your trend.</p></div></div>}</div></section>
        <section className="surface p-4 sm:p-5"><div className="mb-4"><p className="kicker">Your answer mix</p><h2 className="mt-1 text-lg font-extrabold">CORRECT VS MISSED</h2></div><div className="relative h-[260px] w-full" role="img" aria-label="Donut chart of correct and missed answers"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analytics.pie.length ? analytics.pie : [{ name: "No answers", value: 1 }]} dataKey="value" nameKey="name" innerRadius="66%" outerRadius="88%" paddingAngle={4} stroke="none">{(analytics.pie.length ? analytics.pie : [{ name: "No answers", value: 1 }]).map((entry) => <Cell key={entry.name} fill={entry.name === "Correct" ? "#c6f36b" : entry.name === "Missed" ? "#3d483f" : "#273029"} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-black tracking-[-.06em]">{analytics.accuracy}%</span><span className="mt-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#849087]">correct</span></div></div><div className="flex justify-center gap-5 text-[10px] text-[#aeb9b0]"><span><i className="mr-1.5 inline-block size-2 rounded-full bg-[var(--lime)]" />Correct {analytics.correctAnswers}</span><span><i className="mr-1.5 inline-block size-2 rounded-full bg-[#3d483f]" />Missed {analytics.totalQuestions - analytics.correctAnswers}</span></div></section>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <section className="surface p-4 sm:p-5"><div className="mb-4"><p className="kicker">Topic breakdown</p><h2 className="mt-1 text-lg font-extrabold">ACCURACY BY CATEGORY</h2></div><div className="h-[290px] w-full" role="img" aria-label="Bar chart of accuracy for each category"><ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.categoryStats} margin={{ top: 6, right: 8, bottom: 24, left: -18 }}><CartesianGrid stroke="#263029" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="label" interval={0} angle={-15} textAnchor="end" tick={{ fill: "#89958c", fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fill: "#89958c", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} /><Tooltip contentStyle={tooltipStyle} formatter={(value, _name, item) => [`${value}% (${item.payload.correct}/${item.payload.total})`, item.payload.category]} /><Bar dataKey="accuracy" radius={[5, 5, 0, 0]}>{analytics.categoryStats.map((entry, index) => <Cell key={entry.category} fill={entry.total ? chartColors[index] : "#2a332c"} />)}</Bar></BarChart></ResponsiveContainer></div></section>
        <section className="surface p-4 sm:p-5"><div className="mb-4"><p className="kicker">Skill progression</p><h2 className="mt-1 text-lg font-extrabold">BY DIFFICULTY</h2></div><div className="mb-3 h-[180px] w-full" role="img" aria-label="Number of sessions completed by difficulty"><ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.difficultyStats} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}><CartesianGrid stroke="#263029" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="difficulty" tick={{ fill: "#89958c", fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "#89958c", fontSize: 9 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="sessions" name="Sessions" radius={[5, 5, 0, 0]}>{analytics.difficultyStats.map((entry, index) => <Cell key={entry.difficulty} fill={chartColors[index]} />)}</Bar></BarChart></ResponsiveContainer></div><div className="grid gap-3">{analytics.difficultyStats.map((entry, index) => <div key={entry.difficulty} className="rounded-xl border border-[var(--border)] bg-[#0c110e] p-4"><div className="flex items-center justify-between gap-2"><div><p className="text-xs font-bold">{entry.difficulty}</p><p className="mt-1 text-[10px] text-[#7f8b81]">{entry.sessions} session{entry.sessions === 1 ? "" : "s"} · {entry.total} questions</p></div><p className="text-xl font-black" style={{ color: chartColors[index] }}>{entry.total ? `${entry.accuracy}%` : "—"}</p></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#252e27]"><div className="h-full rounded-full" style={{ width: `${entry.accuracy}%`, backgroundColor: chartColors[index] }} /></div></div>)}</div><div className="mt-4 rounded-xl border border-[#35412f] bg-[#141b12] p-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.1em] text-[var(--lime)]"><Flag size={13} /> Keep progressing</p><p className="mt-2 text-xs leading-5 text-[#a4afa5]">Mix categories and difficulty levels to build all-round trail knowledge.</p></div></section>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="surface p-4 sm:p-5"><p className="kicker">Category insights</p><h2 className="mt-1 text-lg font-extrabold">STRENGTHS & NEXT LAPS</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{[
          { label: "Strongest", category: analytics.strongest, color: "text-[var(--lime)]" },
          { label: "Needs practice", category: analytics.weakest, color: "text-[#e0b879]" },
        ].map((entry) => <div key={entry.label} className="rounded-xl border border-[var(--border)] bg-[#0c110e] p-4"><p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#849087]">{entry.label}</p><p className={`mt-2 text-base font-extrabold ${entry.color}`}>{entry.category?.category ?? "—"}</p><p className="mt-1 text-[10px] text-[#8e9a91]">{entry.category ? `${entry.category.accuracy}% accuracy · ${entry.category.total} answers` : "Complete a quiz to unlock insights"}</p></div>)}</div></section>
        <section className="surface p-4 sm:p-5"><div className="mb-3 flex items-center justify-between"><div><p className="kicker">Latest sessions</p><h2 className="mt-1 text-lg font-extrabold">RECENT ACTIVITY</h2></div><span className="text-[9px] font-bold uppercase tracking-[.1em] text-[#849087]">Newest first</span></div><ul className="divide-y divide-[#252e27]">{analytics.recent.map((session) => <li key={session.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-xs font-bold">{session.playerName} <span className="font-normal text-[#87938a]">· {session.category}</span></p><p className="mt-1 text-[9px] text-[#7f8b81]">{new Date(session.completedAt).toLocaleString()} · {session.difficulty} · {formatDuration(session.durationSeconds)}</p></div><span className="shrink-0 text-sm font-black text-[var(--lime)]">{session.accuracy}%</span></li>)}</ul></section>
      </div>
      </>}
    <p className="mt-4 text-center text-[10px] text-[#707d74]">Statistics reflect completed quizzes saved in this browser only.</p>
  </main>;
}
