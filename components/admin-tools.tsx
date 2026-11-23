"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Download, FileUp, RotateCcw, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { deleteAllSessions, deleteSession, exportData as getExportData, importData, readQuestions, readSessions, resetQuestions as restoreSeedQuestions } from "@/lib/storage";
import { useSessions } from "@/lib/use-data";

const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export function AdminSessionManager() {
  const { sessions } = useSessions();
  const [notice, setNotice] = useState("");
  const newestFirst = [...sessions].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  function removeSession(id: string, name: string) {
    if (!window.confirm(`Delete ${name}'s saved quiz session? This cannot be undone.`)) return;
    deleteSession(id);
    setNotice("Quiz session removed from this device.");
  }
  return <AdminShell><div className="mb-5"><p className="kicker">Local history</p><h2 className="mt-1 text-2xl font-black tracking-[-.05em]">QUIZ SESSIONS</h2><p className="mt-1 text-xs text-[#929e95]">Review scores saved on this device. Removing a session updates public stats and the leaderboard immediately.</p></div>
    {notice && <p className="mb-4 rounded-lg border border-[#43563b] bg-[#172118] px-4 py-3 text-xs text-[#c8dfa9]" role="status">{notice}</p>}
    <section className="surface overflow-hidden"><div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4"><div><p className="text-sm font-bold">Saved runs</p><p className="mt-1 text-[10px] text-[#869287]">{sessions.length} total</p></div><span className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.1em] text-[#9aa59c]">Local only</span></div>
      {newestFirst.length === 0 ? <div className="px-5 py-14 text-center"><div className="mx-auto mb-3 grid size-11 place-items-center rounded-xl bg-[#1b2619] text-[var(--lime)]"><Trash2 size={18} /></div><p className="text-sm font-bold">No quiz sessions yet</p><p className="mt-1 text-xs text-[#89958c]">Completed rides will appear here.</p></div> : <div className="grid gap-2 p-3">{newestFirst.map((session) => <article key={session.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[#0c110e] p-4"><div className="min-w-[170px] flex-1"><p className="text-sm font-extrabold">{session.playerName}<span className="ml-2 text-[10px] font-normal text-[#8f9a91]">{session.mode} mode</span></p><p className="mt-1 text-[10px] leading-5 text-[#909c92]">{session.category} · {session.difficulty} · {new Date(session.completedAt).toLocaleString()}</p></div><div className="flex items-center gap-5"><div className="text-right"><p className="font-black text-[var(--lime)]">{session.accuracy}%</p><p className="text-[10px] text-[#929e95]">{session.correctAnswers}/{session.totalQuestions} · {formatTime(session.durationSeconds)}</p></div><button onClick={() => removeSession(session.id, session.playerName)} className="grid size-9 place-items-center rounded-lg border border-[var(--border)] text-[#a0aaa1] transition hover:border-[#7b3f49] hover:bg-[#28171b] hover:text-[#ff9daa]" aria-label={`Delete ${session.playerName}'s quiz session`} title="Delete session"><Trash2 size={15} /></button></div></article>)}</div>}
    </section>
  </AdminShell>;
}

export function AdminSettings() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  function exportData() {
    const data = getExportData();
    if (!data) { setNotice({ text: "Could not read local data. Check your browser storage permissions.", error: true }); return; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mtb-iq-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice({ text: "Your questions and quiz sessions were exported to a JSON backup.", error: false });
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { setNotice({ text: "This backup is larger than 25 MB. Choose a smaller JSON file.", error: true }); return; }
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const result = importData(parsed);
      setNotice({ text: result.message, error: !result.ok });
    } catch {
      setNotice({ text: "This file is not valid JSON. Your saved data has not changed.", error: true });
    }
  }
  function resetQuestions() {
    if (!window.confirm("Replace the current question bank with the original MTB IQ seed questions? Custom questions and edits will be lost.")) return;
    if (restoreSeedQuestions()) setNotice({ text: "Question bank restored to the original seed questions.", error: false });
    else setNotice({ text: "Could not reset the question bank. Check available browser storage.", error: true });
  }
  function clearSessions() {
    if (!window.confirm("Delete all saved quiz sessions on this device? This also clears the leaderboard and statistics.")) return;
    if (deleteAllSessions()) setNotice({ text: "All saved quiz history was deleted.", error: false });
    else setNotice({ text: "Could not clear quiz history. Check browser storage permissions.", error: true });
  }
  const questionCount = readQuestions().length;
  const sessionCount = readSessions().length;
  return <AdminShell><div className="mb-5"><p className="kicker">Backup and maintenance</p><h2 className="mt-1 text-2xl font-black tracking-[-.05em]">APP SETTINGS</h2><p className="mt-1 text-xs text-[#929e95]">Export a backup before changing or clearing local data.</p></div>
    {notice && <p className={`mb-4 rounded-lg border px-4 py-3 text-xs ${notice.error ? "border-[#713d47] bg-[#28171b] text-[#ffacb6]" : "border-[#43563b] bg-[#172118] text-[#c8dfa9]"}`} role="status">{notice.text}</p>}
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="surface p-5 sm:p-6"><div className="mb-5 flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#1c291a] text-[var(--lime)]"><Download size={18} /></div><div><h3 className="text-base font-extrabold">Backup your data</h3><p className="mt-1 text-xs leading-5 text-[#939f95]">Download all questions and completed quiz sessions in a portable JSON file.</p></div></div><div className="mb-4 grid grid-cols-2 gap-2"><div className="rounded-lg border border-[var(--border)] bg-[#0b100d] p-3"><p className="text-lg font-black">{questionCount}</p><p className="text-[9px] font-bold uppercase tracking-[.1em] text-[#89958c]">Questions</p></div><div className="rounded-lg border border-[var(--border)] bg-[#0b100d] p-3"><p className="text-lg font-black">{sessionCount}</p><p className="text-[9px] font-bold uppercase tracking-[.1em] text-[#89958c]">Sessions</p></div></div><div className="flex flex-wrap gap-2"><button onClick={exportData} className="btn-primary !min-h-10 !px-4 text-xs"><Download size={14} /> EXPORT JSON</button><button onClick={() => fileInput.current?.click()} className="btn-secondary !min-h-10 !px-4 text-xs"><FileUp size={14} /> IMPORT BACKUP</button><input ref={fileInput} type="file" accept="application/json,.json" className="sr-only" onChange={(event) => { void importFile(event.target.files?.[0]); event.currentTarget.value = ""; }} /></div><p className="mt-3 text-[10px] leading-5 text-[#7f8b81]">Import replaces the current question bank and session history after validating the file structure.</p></section>
      <section className="surface p-5 sm:p-6"><div className="mb-5 flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#282219] text-[#e2bd77]"><AlertTriangle size={18} /></div><div><h3 className="text-base font-extrabold">Reset and clear</h3><p className="mt-1 text-xs leading-5 text-[#939f95]">These actions cannot be undone. Export a backup first if you need to keep your data.</p></div></div><div className="grid gap-3"><div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[#0b100d] p-4"><div><p className="text-xs font-bold">Restore seed questions</p><p className="mt-1 text-[10px] text-[#8a968d]">Replace all questions with the original {readQuestions().filter((question) => question.id.startsWith("seed-")).length || "seed"} question set.</p></div><button onClick={resetQuestions} className="btn-secondary !min-h-9 !px-3 text-[10px]"><RotateCcw size={13} /> RESET QUESTIONS</button></div><div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#493037] bg-[#171012] p-4"><div><p className="text-xs font-bold">Delete quiz history</p><p className="mt-1 text-[10px] text-[#a28a8f]">Remove all {sessionCount} sessions and clear public stats.</p></div><button onClick={clearSessions} className="btn-secondary !min-h-9 !border-[#623640] !px-3 text-[10px] !text-[#ff9eaa] hover:!bg-[#2b171c]"><Trash2 size={13} /> DELETE SESSIONS</button></div></div></section>
    </div>
  </AdminShell>;
}
