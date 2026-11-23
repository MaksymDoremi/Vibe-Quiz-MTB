import { seedQuestions } from "./seed-data";
import { categories } from "./types";
import type { Question, QuizSession, QuizSettings, SessionAnswer } from "./types";

const QUESTIONS_KEY = "mtbiq_questions_v1";
const SESSIONS_KEY = "mtbiq_sessions_v1";
const SETTINGS_KEY = "mtbiq_settings_v1";
const CHANGE_EVENT = "mtbiq-storage-change";

function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function readArray<T>(key: string): T[] {
  const storage = browserStorage();
  if (!storage) return [];
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return [];
  }
  if (raw === null && key === QUESTIONS_KEY) {
    try {
      storage.setItem(QUESTIONS_KEY, JSON.stringify(seedQuestions));
    } catch {
      return seedQuestions as T[];
    }
    return seedQuestions as T[];
  }
  if (raw === null) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value as T[] : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T): boolean {
  const storage = browserStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function readQuestions(): Question[] {
  const questions = readArray<Question>(QUESTIONS_KEY);
  return questions.every(isQuestion) ? questions : [];
}

export function saveQuestions(questions: Question[]): boolean {
  return write(QUESTIONS_KEY, questions);
}

export function saveQuestion(question: Question): boolean {
  const questions = readQuestions();
  const index = questions.findIndex((item) => item.id === question.id);
  if (index >= 0) questions[index] = question;
  else questions.unshift(question);
  return saveQuestions(questions);
}

export function deleteQuestion(id: string): boolean {
  return saveQuestions(readQuestions().filter((question) => question.id !== id));
}

export function duplicateQuestion(question: Question): Question | null {
  const now = new Date().toISOString();
  const copy: Question = {
    ...question,
    id: crypto.randomUUID(),
    text: `${question.text} (copy)`,
    options: question.options.map((option) => ({ ...option, id: crypto.randomUUID() })),
    createdAt: now,
    updatedAt: now,
  };
  return saveQuestion(copy) ? copy : null;
}

export function resetQuestions(): boolean {
  return saveQuestions(seedQuestions);
}

export function readSessions(): QuizSession[] {
  const sessions = readArray<QuizSession>(SESSIONS_KEY);
  return sessions.every(isSession) ? sessions : [];
}

export function saveSession(session: QuizSession): boolean {
  return write(SESSIONS_KEY, [session, ...readSessions()]);
}

export function saveSessions(sessions: QuizSession[]): boolean {
  return write(SESSIONS_KEY, sessions);
}

export function deleteSession(id: string): boolean {
  return saveSessions(readSessions().filter((session) => session.id !== id));
}

export function deleteAllSessions(): boolean {
  return saveSessions([]);
}

export function readSettings(): QuizSettings {
  const storage = browserStorage();
  if (!storage) return { reduceMotion: false };
  try {
    const raw = storage.getItem(SETTINGS_KEY);
    if (!raw) return { reduceMotion: false };
    const value = JSON.parse(raw) as Partial<QuizSettings>;
    return { reduceMotion: Boolean(value.reduceMotion) };
  } catch {
    return { reduceMotion: false };
  }
}

export function saveSettings(settings: QuizSettings): boolean {
  return write(SETTINGS_KEY, settings);
}

export function exportData(): { version: 1; exportedAt: string; questions: Question[]; sessions: QuizSession[] } {
  return { version: 1, exportedAt: new Date().toISOString(), questions: readQuestions(), sessions: readSessions() };
}

const questionCategories = categories.filter((category) => category !== "Ultimate MTB Challenge");
const questionDifficulties = ["Beginner", "Intermediate", "Expert"] as const;
const questionTypes = ["single", "multiple", "text"] as const;
const quizDifficulties = [...questionDifficulties, "Mixed"] as const;
const quizModes = ["Practice", "Challenge"] as const;

function isAnswerOption(value: unknown): value is { id: string; text: string } {
  return Boolean(value && typeof value === "object" &&
    typeof (value as { id?: unknown }).id === "string" &&
    typeof (value as { text?: unknown }).text === "string");
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isQuestion(value: unknown): value is Question {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Question>;
  if (typeof item.id !== "string" || !item.id || typeof item.text !== "string" ||
      !questionCategories.includes(item.category as (typeof questionCategories)[number]) ||
      !questionDifficulties.includes(item.difficulty as (typeof questionDifficulties)[number]) ||
      !questionTypes.includes(item.type as (typeof questionTypes)[number]) ||
      typeof item.explanation !== "string" || typeof item.createdAt !== "string" || typeof item.updatedAt !== "string" ||
      (item.image !== undefined && typeof item.image !== "string") ||
      (item.imageAlt !== undefined && typeof item.imageAlt !== "string") || !Array.isArray(item.options) ||
      !item.options.every(isAnswerOption) || !isStringArray(item.correctOptionIds) || !isStringArray(item.acceptedAnswers)) return false;
  const validOptionIds = new Set(item.options.map((option) => option.id));
  if (!item.correctOptionIds.every((id) => validOptionIds.has(id))) return false;
  if (item.type === "text") return item.options.length === 0 && item.correctOptionIds.length === 0 && item.acceptedAnswers.some((answer) => answer.trim().length > 0);
  if (item.options.length !== 4 || item.options.some((option) => !option.text.trim()) || item.acceptedAnswers.length > 0) return false;
  return item.type === "single" ? item.correctOptionIds.length === 1 : item.correctOptionIds.length >= 2;
}

function isSessionAnswer(value: unknown): value is SessionAnswer {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SessionAnswer>;
  return typeof item.questionId === "string" && typeof item.questionText === "string" &&
    questionTypes.includes(item.questionType as (typeof questionTypes)[number]) &&
    questionCategories.includes(item.category as (typeof questionCategories)[number]) &&
    questionDifficulties.includes(item.difficulty as (typeof questionDifficulties)[number]) &&
    (item.image === undefined || typeof item.image === "string") &&
    (item.imageAlt === undefined || typeof item.imageAlt === "string") &&
    Array.isArray(item.options) && item.options.every(isAnswerOption) &&
    isStringArray(item.selectedOptionIds) && isStringArray(item.correctOptionIds) &&
    isStringArray(item.acceptedAnswers) && typeof item.typedAnswer === "string" &&
    typeof item.explanation === "string" && typeof item.isCorrect === "boolean" &&
    typeof item.timeSpentSeconds === "number" && Number.isFinite(item.timeSpentSeconds) && item.timeSpentSeconds >= 0;
}

function isSession(value: unknown): value is QuizSession {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<QuizSession>;
  return typeof item.id === "string" && item.id.length > 0 && typeof item.playerName === "string" &&
    categories.includes(item.category as (typeof categories)[number]) &&
    quizDifficulties.includes(item.difficulty as (typeof quizDifficulties)[number]) &&
    quizModes.includes(item.mode as (typeof quizModes)[number]) &&
    typeof item.startedAt === "string" && Number.isFinite(Date.parse(item.startedAt)) &&
    typeof item.completedAt === "string" && Number.isFinite(Date.parse(item.completedAt)) &&
    typeof item.durationSeconds === "number" && Number.isFinite(item.durationSeconds) && item.durationSeconds >= 0 &&
    typeof item.totalQuestions === "number" && Number.isInteger(item.totalQuestions) && item.totalQuestions > 0 &&
    typeof item.correctAnswers === "number" && Number.isInteger(item.correctAnswers) && item.correctAnswers >= 0 && item.correctAnswers <= item.totalQuestions &&
    typeof item.accuracy === "number" && Number.isFinite(item.accuracy) && item.accuracy >= 0 && item.accuracy <= 100 &&
    Array.isArray(item.answers) && item.answers.length === item.totalQuestions && item.answers.every(isSessionAnswer);
}

export function importData(input: unknown): { ok: boolean; message: string } {
  if (!input || typeof input !== "object") return { ok: false, message: "That file is not a valid MTB IQ export." };
  const value = input as { questions?: unknown; sessions?: unknown; version?: unknown };
  if (value.version !== 1 || !Array.isArray(value.questions) || !Array.isArray(value.sessions) ||
      value.questions.length > 5000 || value.sessions.length > 50000 ||
      !value.questions.every(isQuestion) || !value.sessions.every(isSession)) {
    return { ok: false, message: "The JSON structure is invalid, too large, or uses an unsupported export version." };
  }
  const storage = browserStorage();
  if (!storage) return { ok: false, message: "Browser storage is unavailable. Your saved data has not changed." };
  let oldQuestions: string | null | undefined = undefined;
  let oldSessions: string | null | undefined = undefined;
  try {
    oldQuestions = storage.getItem(QUESTIONS_KEY);
    oldSessions = storage.getItem(SESSIONS_KEY);
    storage.setItem(QUESTIONS_KEY, JSON.stringify(value.questions));
    storage.setItem(SESSIONS_KEY, JSON.stringify(value.sessions));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    try {
      if (oldQuestions === null) storage.removeItem(QUESTIONS_KEY);
      else if (oldQuestions !== undefined) storage.setItem(QUESTIONS_KEY, oldQuestions);
      if (oldSessions === null) storage.removeItem(SESSIONS_KEY);
      else if (oldSessions !== undefined) storage.setItem(SESSIONS_KEY, oldSessions);
    } catch {
      // Preserve the original storage error if rollback is also unavailable.
    }
    return { ok: false, message: "Storage is full or unavailable. Your previous data was preserved when possible." };
  }
  return { ok: true, message: `Imported ${value.questions.length} questions and ${value.sessions.length} quiz sessions.` };
}

export function subscribeStorage(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
