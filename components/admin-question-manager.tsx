"use client";

/* eslint-disable @next/next/no-img-element -- Admin-managed images are loaded directly from arbitrary HTTPS URLs or local data URLs. */
import { useMemo, useState } from "react";
import { Check, Copy, Edit3, Eye, ImagePlus, Plus, Search, Trash2, X } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { deleteQuestion, duplicateQuestion, saveQuestion } from "@/lib/storage";
import { useQuestions } from "@/lib/use-data";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { categories, type Question, type QuestionDifficulty, type QuestionType } from "@/lib/types";

const questionCategories = categories.filter((category): category is Exclude<typeof category, "Ultimate MTB Challenge"> => category !== "Ultimate MTB Challenge");
const difficulties: QuestionDifficulty[] = ["Beginner", "Intermediate", "Expert"];
const types: QuestionType[] = ["single", "multiple", "text"];

export function AdminQuestionManager({ initialNew = false }: { initialNew?: boolean }) {
  const { questions, ready } = useQuestions();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Question["category"] | "All categories">("All categories");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty | "All difficulties">("All difficulties");
  const [type, setType] = useState<QuestionType | "All types">("All types");
  const [showForm, setShowForm] = useState(initialNew);
  const [editing, setEditing] = useState<Question | null>(null);
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => questions.filter((question) =>
    (category === "All categories" || question.category === category) &&
    (difficulty === "All difficulties" || question.difficulty === difficulty) &&
    (type === "All types" || question.type === type) &&
    question.text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  ), [questions, category, difficulty, type, query]);

  function addQuestion() {
    setEditing(null);
    setNotice("");
    setShowForm(true);
  }
  function closeForm() {
    setShowForm(false);
    setEditing(null);
    window.history.replaceState(null, "", window.location.pathname);
  }
  function editQuestion(question: Question) {
    setNotice("");
    setEditing(question);
    setShowForm(true);
  }
  function handleDuplicate(question: Question) {
    const copy = duplicateQuestion(question);
    setNotice(copy ? "Question duplicated. The copy is saved in your question bank." : "Could not duplicate this question. Check browser storage and try again.");
  }
  function handleDelete(question: Question) {
    if (!window.confirm(`Delete this question?\n\n${question.text}`)) return;
    deleteQuestion(question.id);
    setNotice("Question deleted from the local question bank.");
  }
  function saved(message: string) {
    setShowForm(false);
    setEditing(null);
    window.history.replaceState(null, "", window.location.pathname);
    setNotice(message);
  }

  return <AdminShell>
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="kicker">Question database</p><h2 className="mt-1 text-2xl font-black tracking-[-.05em]">QUESTION EDITOR</h2><p className="mt-1 text-xs text-[#929e95]">Create, edit, duplicate and organize your MTB knowledge base.</p></div><button onClick={addQuestion} className="btn-primary !min-h-10 !px-4 text-xs"><Plus size={15} /> ADD QUESTION</button></div>
    <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <label className="relative block sm:col-span-2 xl:col-span-1"><span className="sr-only">Search questions</span><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#77847a]" /><input className="field !pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions" /></label>
      <label><span className="sr-only">Filter category</span><select className="field" value={category} onChange={(event) => setCategory(event.target.value as Question["category"] | "All categories")}><option>All categories</option>{questionCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span className="sr-only">Filter difficulty</span><select className="field" value={difficulty} onChange={(event) => setDifficulty(event.target.value as QuestionDifficulty | "All difficulties")}><option>All difficulties</option>{difficulties.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span className="sr-only">Filter type</span><select className="field" value={type} onChange={(event) => setType(event.target.value as QuestionType | "All types")}><option>All types</option>{types.map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>
    {notice && <p className="mb-4 rounded-lg border border-[#43563b] bg-[#172118] px-4 py-3 text-xs text-[#c8dfa9]" role="status">{notice}</p>}
    <section className="surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3"><p className="text-xs font-bold">{filtered.length} question{filtered.length === 1 ? "" : "s"}</p><p className="text-[10px] text-[#818d84]">Changes save on this device</p></div>
      {!ready ? <p className="p-9 text-center text-sm text-[#929e95]">Loading questions…</p> : filtered.length === 0 ? <div className="px-5 py-12 text-center"><div className="mx-auto mb-3 grid size-11 place-items-center rounded-xl bg-[#1b2619] text-[var(--lime)]"><Search size={18} /></div><p className="text-sm font-bold">No questions found</p><p className="mt-1 text-xs text-[#89958c]">Try changing your filters or add a new question.</p></div> : <>
        <div className="hidden overflow-x-auto md:block"><table className="w-full text-left"><thead><tr className="text-[9px] font-bold uppercase tracking-[.12em] text-[#7c897f]"><th className="px-4 py-3">Question</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Difficulty</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Media</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>{filtered.map((question) => <tr key={question.id} className="border-t border-[var(--border)] align-middle"><td className="max-w-[320px] px-4 py-3 text-xs font-semibold leading-5">{question.text}</td><td className="px-4 py-3 text-[10px] text-[#aeb8b0]">{question.category}</td><td className="px-4 py-3"><Badge variant={question.difficulty === "Expert" ? "destructive" : question.difficulty === "Intermediate" ? "secondary" : "outline"} className="text-[9px] font-bold uppercase tracking-[.05em]">{question.difficulty}</Badge></td><td className="px-4 py-3"><Badge variant="outline" className="capitalize">{question.type}</Badge></td><td className="px-4 py-3 text-xs text-[#91a092]">{question.image ? <span className="flex items-center gap-1"><Eye size={13} /> Image</span> : "—"}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button aria-label={`Edit question: ${question.text}`} title="Edit" onClick={() => editQuestion(question)} className="grid size-8 place-items-center rounded-md text-[#acb6ad] hover:bg-[#253022] hover:text-[var(--lime)]"><Edit3 size={14} /></button><button aria-label={`Duplicate question: ${question.text}`} title="Duplicate" onClick={() => handleDuplicate(question)} className="grid size-8 place-items-center rounded-md text-[#acb6ad] hover:bg-[#253022] hover:text-[var(--lime)]"><Copy size={14} /></button><button aria-label={`Delete question: ${question.text}`} title="Delete" onClick={() => handleDelete(question)} className="grid size-8 place-items-center rounded-md text-[#acb6ad] hover:bg-[#321b20] hover:text-[#ff9daa]"><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div>
        <div className="grid gap-2 p-3 md:hidden">{filtered.map((question) => <article key={question.id} className="rounded-xl border border-[var(--border)] bg-[#0c110e] p-4"><div className="flex items-start justify-between gap-3"><h3 className="text-xs font-bold leading-5">{question.text}</h3>{question.image && <Eye size={14} className="shrink-0 text-[#9bab8d]" />}</div><div className="mt-2 flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-[.08em] text-[#919e94]"><span>{question.category}</span><span>· {question.difficulty}</span><span>· {question.type}</span></div><div className="mt-3 flex gap-2 border-t border-[var(--border)] pt-3"><button className="btn-secondary !min-h-8 !px-3 text-[10px]" onClick={() => editQuestion(question)}><Edit3 size={13} /> Edit</button><button className="btn-secondary !min-h-8 !px-3 text-[10px]" onClick={() => handleDuplicate(question)}><Copy size={13} /> Duplicate</button><button className="btn-secondary !min-h-8 !px-3 text-[10px] text-[#ff9daa]" onClick={() => handleDelete(question)}><Trash2 size={13} /> Delete</button></div></article>)}</div>
      </>}
    </section>
    {showForm && <QuestionEditor key={editing?.id ?? "new"} question={editing} onCancel={closeForm} onSaved={saved} />}
  </AdminShell>;
}

function QuestionEditor({ question, onCancel, onSaved }: { question: Question | null; onCancel: () => void; onSaved: (message: string) => void }) {
  const [text, setText] = useState(question?.text ?? "");
  const [category, setCategory] = useState<Question["category"]>(question?.category ?? "Suspension Lab");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(question?.difficulty ?? "Beginner");
  const [type, setType] = useState<QuestionType>(question?.type ?? "single");
  const [options, setOptions] = useState(question?.options.length === 4 ? question.options : Array.from({ length: 4 }, (_, index) => ({ id: crypto.randomUUID(), text: question?.options[index]?.text ?? "" })));
  const [correctIds, setCorrectIds] = useState<string[]>(question?.correctOptionIds ?? []);
  const [accepted, setAccepted] = useState<string[]>(question?.acceptedAnswers.length ? question.acceptedAnswers : [""]);
  const [explanation, setExplanation] = useState(question?.explanation ?? "");
  const [image, setImage] = useState(question?.image ?? "");
  const [imageAlt, setImageAlt] = useState(question?.imageAlt ?? (question?.image ? question.text : ""));
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  function changeOption(id: string, value: string) {
    setOptions((current) => current.map((option) => option.id === id ? { ...option, text: value } : option));
  }
  function toggleCorrect(id: string) {
    setCorrectIds((current) => type === "single" ? [id] : current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Choose an image file such as JPG, PNG, or WebP."); return; }
    if (file.size > 12 * 1024 * 1024) { setError("Choose an image under 12 MB before compression."); return; }
    setUploading(true);
    setError("");
    try {
      const source = URL.createObjectURL(file);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        URL.revokeObjectURL(source);
        const maxSide = 1400;
        const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) { setError("This browser could not process the image."); setUploading(false); return; }
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        setImage(canvas.toDataURL("image/jpeg", 0.76));
        setImageAlt((current) => current.trim() || text.trim() || `${category} question image`);
        setUploading(false);
      };
      img.onerror = () => { URL.revokeObjectURL(source); setError("That image could not be opened. Try another file or use an image URL."); setUploading(false); };
      img.src = source;
    } catch {
      setError("Image compression failed. Try using an image URL instead.");
      setUploading(false);
    }
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!text.trim()) { setError("Enter the question text."); return; }
    if (!explanation.trim()) { setError("Add an explanation so players can learn from the answer."); return; }
    if (image.trim() && !imageAlt.trim()) { setError("Add a short image description for screen readers."); return; }
    if (image.trim() && !image.startsWith("data:image/")) {
      try {
        const parsed = new URL(image);
        if (!(["https:", "http:"].includes(parsed.protocol))) throw new Error("Invalid protocol");
      } catch { setError("Image URL must be a valid HTTP or HTTPS address."); return; }
    }
    if (type === "text") {
      const answers = accepted.map((answer) => answer.trim()).filter(Boolean);
      if (!answers.length) { setError("Add at least one accepted text answer."); return; }
    } else {
      if (options.some((option) => !option.text.trim())) { setError("Fill in all four answer options."); return; }
      if (type === "single" && correctIds.length !== 1) { setError("Choose exactly one correct answer."); return; }
      if (type === "multiple" && correctIds.length < 2) { setError("Choose at least two correct answers."); return; }
    }
    const now = new Date().toISOString();
    const savedQuestion: Question = {
      id: question?.id ?? crypto.randomUUID(), text: text.trim(), category, difficulty, type,
      image: image.trim() || undefined,
      imageAlt: image.trim() ? imageAlt.trim() : undefined,
      options: type === "text" ? [] : options.map((option) => ({ ...option, text: option.text.trim() })),
      correctOptionIds: type === "text" ? [] : correctIds,
      acceptedAnswers: type === "text" ? accepted.map((answer) => answer.trim()).filter(Boolean) : [],
      explanation: explanation.trim(), createdAt: question?.createdAt ?? now, updatedAt: now,
    };
    if (!saveQuestion(savedQuestion)) {
      setError(image.startsWith("data:image/") ? "Browser storage is full. Try a smaller upload or use an image URL instead." : "Could not save this question. Check browser storage and try again.");
      return;
    }
    onSaved(question ? "Question updated and saved." : "Question added to the bank and ready for the next quiz.");
  }

return <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
  <DialogContent showCloseButton={false} className="surface max-h-[94vh] w-full max-w-[calc(100%-2rem)] overflow-y-auto border-[var(--border)] bg-[#0d120f] p-5 text-[var(--foreground)] shadow-2xl sm:max-w-3xl sm:rounded-2xl sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4"><div><p className="kicker">{question ? "Edit question" : "New question"}</p><DialogTitle id="question-editor-title" className="mt-1 text-2xl font-black tracking-[-.04em] text-[var(--foreground)]">{question ? "UPDATE YOUR QUESTION" : "BUILD A QUESTION"}</DialogTitle></div><button type="button" onClick={onCancel} className="grid size-9 place-items-center rounded-lg border border-[var(--border)] text-[#a2ada4] hover:text-white" aria-label="Close editor"><X size={17} /></button></div>
      <form onSubmit={save} className="grid gap-4">
        <label className="block"><span className="mb-2 block text-xs font-bold">Question text <span className="text-[var(--lime)]">*</span></span><textarea className="field min-h-[94px] resize-y" value={text} onChange={(event) => setText(event.target.value)} maxLength={500} required placeholder="Write a clear, specific MTB question" /></label>
        <div className="grid gap-3 sm:grid-cols-3"><label className="block"><span className="mb-2 block text-xs font-bold">Category</span><select className="field" value={category} onChange={(event) => setCategory(event.target.value as Question["category"])}>{questionCategories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="block"><span className="mb-2 block text-xs font-bold">Difficulty</span><select className="field" value={difficulty} onChange={(event) => setDifficulty(event.target.value as QuestionDifficulty)}>{difficulties.map((item) => <option key={item}>{item}</option>)}</select></label><label className="block"><span className="mb-2 block text-xs font-bold">Question type</span><select className="field" value={type} onChange={(event) => { setType(event.target.value as QuestionType); setCorrectIds([]); }}><option value="single">Single choice</option><option value="multiple">Multiple choice</option><option value="text">Text answer</option></select></label></div>
        {type !== "text" ? <fieldset className="rounded-xl border border-[var(--border)] p-4"><legend className="px-2 text-xs font-bold">Answer options <span className="font-normal text-[#8c988f]">· {type === "single" ? "select one correct answer" : "select 2+ correct answers"}</span></legend><div className="grid gap-2">{options.map((option, index) => <label key={option.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${correctIds.includes(option.id) ? "border-[#61784b] bg-[#151e13]" : "border-[var(--border)] bg-[#0a0f0c]"}`}><input type={type === "single" ? "radio" : "checkbox"} name="correct-answer" checked={correctIds.includes(option.id)} onChange={() => toggleCorrect(option.id)} aria-label={`Mark option ${index + 1} as correct`} className="accent-[#c6f36b]" /><span className="w-6 text-xs font-bold text-[#829084]">{String.fromCharCode(65 + index)}.</span><input className="min-w-0 flex-1 bg-transparent py-1 text-xs outline-none" value={option.text} maxLength={200} onChange={(event) => changeOption(option.id, event.target.value)} placeholder={`Option ${index + 1}`} aria-label={`Answer option ${index + 1}`} /></label>)}</div></fieldset> : <fieldset className="rounded-xl border border-[var(--border)] p-4"><legend className="px-2 text-xs font-bold">Accepted answers</legend><div className="grid gap-2">{accepted.map((answer, index) => <div key={index} className="flex gap-2"><input className="field min-h-10" value={answer} onChange={(event) => setAccepted((current) => current.map((value, answerIndex) => answerIndex === index ? event.target.value : value))} placeholder={index === 0 ? "e.g. rebound" : "Another accepted spelling"} /><button type="button" disabled={accepted.length === 1} onClick={() => setAccepted((current) => current.filter((_, answerIndex) => answerIndex !== index))} aria-label={`Remove accepted answer ${index + 1}`} className="grid size-10 shrink-0 place-items-center rounded-lg border border-[var(--border)] text-[#9da89f] disabled:opacity-30"><X size={14} /></button></div>)}<button type="button" onClick={() => setAccepted((current) => [...current, ""])} className="flex items-center gap-2 text-xs font-bold text-[var(--lime)]"><Plus size={14} /> Add accepted answer</button></div></fieldset>}
        <label className="block"><span className="mb-2 block text-xs font-bold">Explanation <span className="text-[var(--lime)]">*</span></span><textarea className="field min-h-[78px] resize-y" value={explanation} onChange={(event) => setExplanation(event.target.value)} maxLength={1000} required placeholder="Explain why this is the correct answer" /></label>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><label className="block"><span className="mb-2 block text-xs font-bold">Image URL <span className="font-normal text-[#849087]">· optional</span></span><input className="field" value={image.startsWith("data:image/") ? "Uploaded image saved on this device" : image} readOnly={image.startsWith("data:image/")} onChange={(event) => setImage(event.target.value)} placeholder="https://example.com/trail.jpg" /></label><label className="btn-secondary !min-h-[46px] cursor-pointer !px-4 text-xs"><ImagePlus size={15} /> {uploading ? "Processing…" : "Upload image"}<input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(event) => { void uploadImage(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label></div>
        {image && <label className="block"><span className="mb-2 block text-xs font-bold">Image description <span className="text-[var(--lime)]">*</span></span><input className="field" value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} maxLength={180} required placeholder="Describe the image for screen readers" /></label>}
        {image && <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[#080b09]"><img src={image} alt={imageAlt || `${category} question image preview`} className="max-h-[220px] w-full object-contain" onError={(event) => { event.currentTarget.style.display = "none"; }} /><button type="button" onClick={() => { setImage(""); setImageAlt(""); }} className="absolute right-2 top-2 flex items-center gap-1 rounded-lg border border-white/20 bg-black/70 px-2.5 py-2 text-[10px] font-bold text-white"><X size={13} /> Remove image</button></div>}
        {image.startsWith("data:image/") && <p className="text-[10px] leading-5 text-[#8d998f]">The image is resized and stored as a compressed data URL in this browser. For large images, use a URL to avoid local storage limits.</p>}
        {error && <p className="rounded-lg border border-[#713d47] bg-[#28171b] px-3 py-2.5 text-xs text-[#ffacb6]" role="alert">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] pt-4"><button type="button" onClick={onCancel} className="btn-secondary !min-h-10 text-xs">CANCEL</button><button type="submit" disabled={uploading} className="btn-primary !min-h-10 text-xs"><Check size={14} /> SAVE QUESTION</button></div>
  </form>
  </DialogContent>
  </Dialog>;
}
