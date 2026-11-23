"use client";

/* eslint-disable @next/next/no-img-element -- Admin-created question images may use arbitrary HTTPS URLs or browser-local data URLs. */
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, Clock3, RotateCcw, Trophy, X, XCircle } from "lucide-react";
import { useQuestions } from "@/lib/use-data";
import { saveSession } from "@/lib/storage";
import { categories, type Category, type Difficulty, type Question, type QuizMode, type QuizSession, type SessionAnswer } from "@/lib/types";

const difficulties: Difficulty[] = ["Mixed", "Beginner", "Intermediate", "Expert"];
const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
const formatTime = (totalSeconds: number) => `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
const ratingFor = (accuracy: number) => accuracy >= 90 ? "MTB LEGEND" : accuracy >= 75 ? "TRAIL EXPERT" : accuracy >= 50 ? "WEEKEND RIDER" : accuracy >= 25 ? "BEGINNER RIDER" : "TRAINING WHEELS";
const shuffle = <T,>(items: T[]) => [...items].map((item) => ({ item, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ item }) => item);

type CategorySelection = Category | "Any category";
type QuizSettings = { playerName: string; category: CategorySelection; difficulty: Difficulty; questionCount: string; mode: QuizMode; randomizeQuestions: boolean; randomizeOptions: boolean };

export function QuizExperience({ initialCategory }: { initialCategory?: Category }) {
  const { questions, ready } = useQuestions();
  const [settings, setSettings] = useState<QuizSettings>({ playerName: "", category: initialCategory ?? "Any category", difficulty: "Mixed", questionCount: "10", mode: "Practice", randomizeQuestions: true, randomizeOptions: true });
  const [deck, setDeck] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState<SessionAnswer[]>([]);
  const [active, setActive] = useState(false);
  const [result, setResult] = useState<QuizSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saveWarning, setSaveWarning] = useState(false);
  const [configNotice, setConfigNotice] = useState("");
  const startedAt = useRef(0);
  const questionStartedAt = useRef(0);

  useEffect(() => {
    if (!active) return;
    const interval = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => window.clearInterval(interval);
  }, [active]);

  const matchingQuestions = useMemo(() => questions.filter((question) => {
    const categoryMatches = settings.category === "Any category" || settings.category === "Ultimate MTB Challenge" || question.category === settings.category;
    const difficultyMatches = settings.difficulty === "Mixed" || question.difficulty === settings.difficulty;
    return categoryMatches && difficultyMatches;
  }), [questions, settings.category, settings.difficulty]);

  const requestedCount = settings.questionCount === "all" ? matchingQuestions.length : Number(settings.questionCount);
  const actualCount = Math.min(requestedCount, matchingQuestions.length);
  const currentQuestion = deck[questionIndex];
  const correctCount = sessionAnswers.filter((answer) => answer.isCorrect).length;

  function updateSettings<K extends keyof QuizSettings>(key: K, value: QuizSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setConfigNotice("");
  }

  function startQuiz(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings.playerName.trim()) {
      setConfigNotice("Add a player name to start your ride.");
      return;
    }
    if (!matchingQuestions.length) {
      setConfigNotice("There are no questions available for this selection yet.");
      return;
    }
    const selected = (settings.randomizeQuestions ? shuffle(matchingQuestions) : [...matchingQuestions]).slice(0, actualCount);
    const withOptions = selected.map((question) => ({ ...question, options: settings.randomizeOptions ? shuffle(question.options) : question.options }));
    setDeck(withOptions);
    setQuestionIndex(0);
    setSessionAnswers([]);
    setSelectedIds([]);
    setTypedAnswer("");
    setSubmitted(false);
    setResult(null);
    setSaveWarning(false);
    setElapsedSeconds(0);
    startedAt.current = Date.now();
    questionStartedAt.current = Date.now();
    setActive(true);
  }

  function isAnswerCorrect(question: Question, optionIds: string[], answerText: string) {
    if (question.type === "text") return question.acceptedAnswers.some((accepted) => normalize(accepted) === normalize(answerText));
    if (optionIds.length !== question.correctOptionIds.length) return false;
    return question.correctOptionIds.every((id) => optionIds.includes(id));
  }

  function submitAnswer() {
    if (!currentQuestion || submitted) return;
    if (currentQuestion.type === "text" ? !typedAnswer.trim() : !selectedIds.length) return;
    const isCorrect = isAnswerCorrect(currentQuestion, selectedIds, typedAnswer);
    const answer: SessionAnswer = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      questionType: currentQuestion.type,
      category: currentQuestion.category,
      difficulty: currentQuestion.difficulty,
      image: currentQuestion.image,
      imageAlt: currentQuestion.imageAlt,
      options: currentQuestion.options.map((option) => ({ ...option })),
      selectedOptionIds: [...selectedIds],
      typedAnswer: typedAnswer.trim(),
      correctOptionIds: [...currentQuestion.correctOptionIds],
      acceptedAnswers: [...currentQuestion.acceptedAnswers],
      explanation: currentQuestion.explanation,
      isCorrect,
      timeSpentSeconds: Math.max(0, Math.round((Date.now() - questionStartedAt.current) / 1000)),
    };
    setSessionAnswers((previous) => [...previous, answer]);
    setSubmitted(true);
  }

  function advanceQuestion() {
    if (!submitted) return;
    if (questionIndex < deck.length - 1) {
      setQuestionIndex((index) => index + 1);
      setSelectedIds([]);
      setTypedAnswer("");
      setSubmitted(false);
      questionStartedAt.current = Date.now();
      return;
    }
    const answers = sessionAnswers;
    const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
    const accuracy = Math.round(correctAnswers / deck.length * 100);
    const completedAt = new Date();
    const quizSession: QuizSession = {
      id: crypto.randomUUID(),
      playerName: settings.playerName.trim(),
      category: settings.category === "Any category" ? "Ultimate MTB Challenge" : settings.category,
      difficulty: settings.difficulty,
      mode: settings.mode,
      startedAt: new Date(startedAt.current).toISOString(),
      completedAt: completedAt.toISOString(),
      durationSeconds: Math.max(0, Math.round((completedAt.getTime() - startedAt.current) / 1000)),
      totalQuestions: deck.length,
      correctAnswers,
      accuracy,
      answers,
    };
    setSaveWarning(!saveSession(quizSession));
    setResult(quizSession);
    setActive(false);
  }

  function exitQuiz() {
    if (window.confirm("Exit this quiz? Your current answers will not be saved.")) {
      setActive(false);
      setDeck([]);
      setResult(null);
      setSessionAnswers([]);
      setSubmitted(false);
    }
  }

  if (active && currentQuestion) {
    const isPracticeReveal = settings.mode === "Practice" && submitted;
    return <main className="shell min-h-[calc(100vh-72px)] py-8 sm:py-12">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-[#51663a] bg-[#1b2618] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.1em] text-[var(--lime)]">{currentQuestion.category}</span><span className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.1em] ${currentQuestion.difficulty === "Expert" ? "bg-[#351b20] text-[#ff9aa8]" : currentQuestion.difficulty === "Intermediate" ? "bg-[#302a18] text-[#f3d27e]" : "bg-[#182b24] text-[#8fe3b2]"}`}>{currentQuestion.difficulty}</span><span className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-[#a8b2aa]">{settings.mode} mode</span></div>
          <button type="button" onClick={exitQuiz} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[#9da79f] transition hover:bg-[#151b16] hover:text-white"><X size={15} /> Exit quiz</button>
        </div>
        <section className="surface p-4 sm:p-7">
          <div className="mb-7">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs"><span className="font-bold text-[#d4ddd5]">{settings.playerName.trim()} <span className="muted font-normal">· Question {questionIndex + 1} of {deck.length}</span></span><span className="flex items-center gap-2 font-mono font-bold text-[#ccd5cd]"><Clock3 size={15} className="text-[var(--lime)]" /> {formatTime(elapsedSeconds)}</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#27312a]" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={deck.length} aria-valuenow={questionIndex + (submitted ? 1 : 0)}><div className="h-full rounded-full bg-[var(--lime)] transition-all duration-500" style={{ width: `${((questionIndex + (submitted ? 1 : 0)) / deck.length) * 100}%` }} /></div>
            <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-[.1em] text-[#7f8c82]"><span>{questionIndex + (submitted ? 1 : 0)} completed</span>{settings.mode === "Practice" && <span>Score <b className="text-[var(--lime)]">{correctCount}/{sessionAnswers.length}</b></span>}</div>
          </div>
          <div className="mb-7">
            <p className="kicker mb-3">{currentQuestion.type === "multiple" ? "Select all correct answers" : currentQuestion.type === "text" ? "Type your answer" : "Choose one answer"}</p>
            <h1 className="max-w-[760px] text-2xl font-black leading-tight tracking-[-.04em] sm:text-[32px]">{currentQuestion.text}</h1>
          </div>
          {currentQuestion.image && <img src={currentQuestion.image} alt={currentQuestion.imageAlt ?? `${currentQuestion.category} technical question image`} className="mb-6 max-h-[320px] w-full rounded-xl border border-[var(--border)] object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
          {currentQuestion.type === "text" ? <label className="block"><span className="sr-only">Your answer</span><input value={typedAnswer} onChange={(event) => setTypedAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); if (typedAnswer.trim()) submitAnswer(); } }} disabled={submitted} autoComplete="off" placeholder="Your answer..." className="field min-h-[58px] text-lg" /></label> : <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const selected = selectedIds.includes(option.id);
              const isCorrectOption = currentQuestion.correctOptionIds.includes(option.id);
              const showCorrect = isPracticeReveal && isCorrectOption;
              const showWrong = isPracticeReveal && selected && !isCorrectOption;
              return <button key={option.id} type="button" disabled={submitted} onClick={() => setSelectedIds((previous) => currentQuestion.type === "multiple" ? previous.includes(option.id) ? previous.filter((id) => id !== option.id) : [...previous, option.id] : [option.id])} className={`flex min-h-[58px] items-center gap-3 rounded-xl border px-4 py-3 text-left transition sm:px-5 ${showCorrect ? "border-[#7dc44f] bg-[#172618]" : showWrong ? "border-[#8b4551] bg-[#2b171b]" : selected ? "border-[#88ad56] bg-[#1a2418]" : "border-[var(--border)] bg-[#0b100d] hover:border-[#64754b] hover:bg-[#131a14]"} ${submitted && !showCorrect && !showWrong ? "opacity-75" : ""}`} aria-pressed={selected}>
                <span className={`grid size-7 shrink-0 place-items-center rounded-full border text-[11px] font-extrabold ${showCorrect ? "border-[#91d468] bg-[#91d468] text-[#10180d]" : showWrong ? "border-[#ea7181] text-[#ff9aa8]" : selected ? "border-[var(--lime)] bg-[var(--lime)] text-[#11170d]" : "border-[#435047] text-[#a8b3ab]"}`}>{showCorrect ? <Check size={14} /> : showWrong ? <X size={14} /> : String.fromCharCode(65 + index)}</span>
                <span className="flex-1 text-sm font-semibold leading-6 text-[#e4e9e5]">{option.text}</span>
                {currentQuestion.type === "multiple" && !submitted && <span className={`size-5 rounded border ${selected ? "border-[var(--lime)] bg-[var(--lime)]" : "border-[#4c5a4f]"}`} aria-hidden="true" />}
              </button>;
            })}
          </div>}
          {isPracticeReveal && <div className={`mt-5 rounded-xl border p-4 ${sessionAnswers.at(-1)?.isCorrect ? "border-[#4a7141] bg-[#142117]" : "border-[#71414a] bg-[#211619]"}`} role="status"><p className={`flex items-center gap-2 text-sm font-extrabold ${sessionAnswers.at(-1)?.isCorrect ? "text-[#b8ed8b]" : "text-[#ff9daa]"}`}>{sessionAnswers.at(-1)?.isCorrect ? <CheckCircle2 size={17} /> : <XCircle size={17} />}{sessionAnswers.at(-1)?.isCorrect ? "Correct — nice work." : "Not quite. Keep learning."}</p><p className="mt-2 text-sm leading-6 text-[#c4cdc5]">{currentQuestion.explanation}</p>{currentQuestion.type === "text" && !sessionAnswers.at(-1)?.isCorrect && <p className="mt-2 text-xs text-[#a9b5aa]">Accepted: {currentQuestion.acceptedAnswers.join(", ")}</p>}</div>}
          {submitted && settings.mode === "Challenge" && <div className="mt-5 rounded-xl border border-[#344136] bg-[#131a14] p-4 text-sm text-[#c3cec4]" role="status">Answer saved. Results will be revealed when you finish the challenge.</div>}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
            <p className="text-xs text-[#89948b]">{currentQuestion.type === "multiple" && !submitted ? "Select all correct answers" : submitted ? "Answer saved" : "Take your time — your ride is on the clock"}</p>
            {!submitted ? <button type="button" disabled={currentQuestion.type === "text" ? !typedAnswer.trim() : !selectedIds.length} onClick={submitAnswer} className="btn-primary disabled:cursor-not-allowed disabled:opacity-40">{currentQuestion.type === "multiple" ? "CONFIRM ANSWER" : "SUBMIT ANSWER"} <ArrowRight size={16} /></button> : <button type="button" onClick={advanceQuestion} className="btn-primary">{questionIndex === deck.length - 1 ? "SEE RESULTS" : "NEXT QUESTION"} <ArrowRight size={16} /></button>}
          </div>
        </section>
      </div>
    </main>;
  }

  if (result) return <ResultsView session={result} saveWarning={saveWarning} onPlayAgain={() => { setResult(null); setSessionAnswers([]); setSettings((current) => ({ ...current, playerName: current.playerName })); }} />;

  return <main className="shell min-h-[calc(100vh-72px)] py-10 sm:py-14">
    <div className="mx-auto max-w-[1000px]">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#9da89f] hover:text-white"><ArrowLeft size={15} /> Back home</Link>
      <div className="grid gap-7 lg:grid-cols-[.85fr_1.15fr] lg:gap-12">
        <div className="flex flex-col justify-center">
          <p className="kicker">Your next ride starts here</p><h1 className="mt-4 text-4xl font-black leading-[.98] tracking-[-.06em] sm:text-5xl">SET YOUR<br /><span className="text-[var(--lime)]">CHALLENGE.</span></h1><p className="mt-5 max-w-md text-sm leading-6 text-[#a8b2aa]">Build a quiz that fits your ride. Pick a category, set the difficulty, and see how your setup knowledge stacks up.</p>
          <div className="mt-7 grid grid-cols-2 gap-3"><div className="surface p-4"><p className="text-2xl font-black">{questions.length}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#8f9b91]">Questions ready</p></div><div className="surface p-4"><p className="text-2xl font-black">{matchingQuestions.length}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#8f9b91]">Matching this ride</p></div></div>
          <p className="mt-5 flex items-center gap-2 text-xs text-[#8f9b91]"><Clock3 size={15} className="text-[var(--lime)]" /> Every quiz is timed and saved on this device.</p>
        </div>
        <form onSubmit={startQuiz} className="surface p-5 sm:p-7">
          <div className="mb-6 border-b border-[var(--border)] pb-5"><h2 className="text-xl font-extrabold tracking-tight">Build your ride</h2><p className="mt-1 text-xs text-[#929e95]">Choose your quiz settings below.</p></div>
          <div className="grid gap-5">
            <label className="block"><span className="mb-2 block text-xs font-bold text-[#d7dfd8]">Player name <span className="text-[var(--lime)]">*</span></span><input className="field" maxLength={24} value={settings.playerName} onChange={(event) => updateSettings("playerName", event.target.value)} placeholder="e.g. Trail Rider" required /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="mb-2 block text-xs font-bold text-[#d7dfd8]">Category</span><select className="field" value={settings.category} onChange={(event) => updateSettings("category", event.target.value as CategorySelection)}><option>Any category</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
              <label className="block"><span className="mb-2 block text-xs font-bold text-[#d7dfd8]">Difficulty</span><select className="field" value={settings.difficulty} onChange={(event) => updateSettings("difficulty", event.target.value as Difficulty)}>{difficulties.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}</select></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="mb-2 block text-xs font-bold text-[#d7dfd8]">Question count</span><select className="field" value={settings.questionCount} onChange={(event) => updateSettings("questionCount", event.target.value)}>{[5, 10, 15, 20].map((count) => <option value={count} key={count}>{count} questions</option>)}<option value="all">All available</option></select></label>
              <fieldset><legend className="mb-2 block text-xs font-bold text-[#d7dfd8]">Quiz mode</legend><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => updateSettings("mode", "Practice")} className={`rounded-lg border px-3 py-3 text-xs font-bold ${settings.mode === "Practice" ? "border-[#829f56] bg-[#1b2518] text-[var(--lime)]" : "border-[var(--border)] bg-[#0b100d] text-[#a6b1a8]"}`}>Practice</button><button type="button" onClick={() => updateSettings("mode", "Challenge")} className={`rounded-lg border px-3 py-3 text-xs font-bold ${settings.mode === "Challenge" ? "border-[#829f56] bg-[#1b2518] text-[var(--lime)]" : "border-[var(--border)] bg-[#0b100d] text-[#a6b1a8]"}`}>Challenge</button></div></fieldset>
            </div>
            <fieldset><legend className="mb-2 block text-xs font-bold text-[#d7dfd8]">Randomize</legend><div className="flex flex-wrap gap-2">{[
              { key: "randomizeQuestions" as const, label: "Question order" }, { key: "randomizeOptions" as const, label: "Answer options" },
            ].map((item) => <label key={item.key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[#0b100d] px-3 py-2.5 text-xs text-[#bcc6bd]"><input type="checkbox" className="accent-[#c6f36b]" checked={settings[item.key]} onChange={(event) => updateSettings(item.key, event.target.checked)} />{item.label}</label>)}</div></fieldset>
            <div className="rounded-lg border border-[#33412e] bg-[#131a12] px-4 py-3 text-xs leading-5 text-[#b9c7b3]">{matchingQuestions.length === 0 ? "No matching questions available. Choose a different selection to start." : actualCount < requestedCount ? `Only ${matchingQuestions.length} matching questions are available, so this quiz will use all ${actualCount}.` : `${actualCount} ${settings.difficulty.toLowerCase()} questions are ready for your ride.`}</div>
            {configNotice && <p className="text-sm font-semibold text-[#ff9daa]" role="alert">{configNotice}</p>}
            <button className="btn-primary w-full !min-h-[52px]" disabled={!ready || !matchingQuestions.length}>START QUIZ <ArrowRight size={17} /></button>
          </div>
        </form>
      </div>
    </div>
  </main>;
}

function ResultsView({ session, saveWarning, onPlayAgain }: { session: QuizSession; saveWarning: boolean; onPlayAgain: () => void }) {
  const accuracy = session.accuracy;
  const rating = ratingFor(accuracy);
  const offset = 339.3 * (1 - accuracy / 100);
  return <main className="shell min-h-[calc(100vh-72px)] py-8 sm:py-12">
    <div className="mx-auto max-w-[1000px]">
      <div className="mb-7 text-center"><div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl border border-[#4a613b] bg-[#1c2918] text-[var(--lime)]"><Trophy size={22} /></div><p className="kicker">Ride complete · {new Date(session.completedAt).toLocaleString()}</p><h1 className="mt-3 text-3xl font-black tracking-[-.05em] sm:text-4xl">{session.playerName}, HERE&apos;S YOUR RUN</h1><p className="mt-2 text-sm text-[#9ca79e]">{session.category} <span className="mx-1 text-[#5d695f]">·</span> {session.difficulty} <span className="mx-1 text-[#5d695f]">·</span> {session.mode} mode</p></div>
      <div className="relative mb-6 min-h-[156px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[radial-gradient(ellipse_at_top_right,_#334a2b,_#0b100d_72%)]">
        <Image src="/images/mtb-hero.png" alt="Mountain biker riding a forest trail after a completed quiz" fill sizes="(max-width: 768px) 100vw, 1000px" className="absolute inset-0 size-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090d0a]/95 via-[#090d0a]/60 to-transparent" aria-hidden="true" />
        <div className="relative flex min-h-[156px] items-center p-6 sm:p-8"><div><p className="kicker">RIDE SMART. RIDE ON.</p><p className="mt-2 max-w-md text-sm font-semibold text-white sm:text-base">Every answer moves your trail knowledge forward.</p></div></div>
      </div>
      {saveWarning && <div className="mb-5 rounded-lg border border-[#715c2e] bg-[#241d11] p-3 text-sm text-[#f4da91]" role="alert">This score could not be saved to local storage. Your results are still visible until you leave this page.</div>}
      <section className="surface grid gap-5 p-5 sm:grid-cols-[240px_1fr] sm:items-center sm:p-8">
        <div className="mx-auto grid size-[190px] place-items-center"><div className="relative grid size-[190px] place-items-center"><svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120" aria-label={`${accuracy}% accuracy`} role="img"><circle cx="60" cy="60" r="54" fill="none" stroke="#263129" strokeWidth="8"/><circle cx="60" cy="60" r="54" fill="none" stroke="#c6f36b" strokeWidth="8" strokeLinecap="round" strokeDasharray="339.3" strokeDashoffset={offset} style={{ transition: "stroke-dashoffset .8s ease" }} /></svg><div className="text-center"><p className="text-5xl font-black tracking-[-.07em]">{accuracy}<span className="text-2xl text-[var(--lime)]">%</span></p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.15em] text-[#8d9a8f]">accuracy</p></div></div></div>
        <div><p className="kicker">{rating}</p><h2 className="mt-2 text-3xl font-black tracking-[-.04em]">{session.correctAnswers} <span className="text-[#79857c]">/ {session.totalQuestions}</span></h2><p className="mt-2 text-sm text-[#a8b2aa]">{session.correctAnswers === session.totalQuestions ? "Flawless ride. You know your stuff." : session.correctAnswers > 0 ? "Good laps. Review the details and keep building your trail knowledge." : "Every ride is a chance to learn. Study the breakdown and give it another go."}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[
            ["Correct", `${session.correctAnswers}`], ["Missed", `${session.totalQuestions - session.correctAnswers}`], ["Time", formatTime(session.durationSeconds)], ["Questions", `${session.totalQuestions}`],
          ].map(([label, value]) => <div key={label} className="rounded-xl border border-[var(--border)] bg-[#0b100d] px-3 py-3"><p className="text-lg font-extrabold">{value}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.1em] text-[#89958c]">{label}</p></div>)}</div>
        </div>
      </section>
      <div className="my-5 flex flex-wrap gap-3"><button onClick={onPlayAgain} className="btn-primary"><RotateCcw size={15} /> PLAY AGAIN</button><Link href="/" className="btn-secondary">BACK TO HOME</Link><Link href="/leaderboard" className="btn-secondary">VIEW LEADERBOARD <ChevronRight size={15} /></Link></div>
      <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><p className="kicker">Post-ride review</p><h2 className="mt-2 text-2xl font-black tracking-[-.04em]">QUESTIONS REVIEWED</h2></div><span className="text-xs text-[#89958c]">{session.answers.length} answers</span></div>
        <div className="grid gap-3">{session.answers.map((answer, index) => {
          const correctLabels = answer.options.filter((option) => answer.correctOptionIds.includes(option.id)).map((option) => option.text);
          const selectedLabels = answer.options.filter((option) => answer.selectedOptionIds.includes(option.id)).map((option) => option.text);
          return <article key={`${answer.questionId}-${index}`} className="surface p-4 sm:p-5"><div className="flex items-start gap-3"><span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg ${answer.isCorrect ? "bg-[#1b2c1c] text-[#a9e581]" : "bg-[#2b1b1f] text-[#ff9daa]"}`}>{answer.isCorrect ? <Check size={16} /> : <X size={16} />}</span><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-[.1em] text-[#8c998f]"><span>{answer.category}</span><span>· {answer.difficulty}</span><span>· {formatTime(answer.timeSpentSeconds)}</span></div><h3 className="text-sm font-bold leading-6 text-[#e8ede9]">{answer.questionText}</h3><p className="mt-2 text-xs leading-5 text-[#9ca89f]">Your answer: <span className={answer.isCorrect ? "text-[#b9ed91]" : "text-[#ffabb4]"}>{answer.questionType === "text" ? answer.typedAnswer || "No answer" : selectedLabels.join(", ") || "No answer"}</span></p>{!answer.isCorrect && <p className="mt-1 text-xs leading-5 text-[#b9ed91]">Correct answer: {answer.questionType === "text" ? answer.acceptedAnswers.join(" / ") : correctLabels.join(", ")}</p>}<p className="mt-3 border-t border-[var(--border)] pt-3 text-xs leading-5 text-[#aab5ac]">{answer.explanation}</p></div></div></article>;
        })}</div>
      </section>
    </div>
  </main>;
}
