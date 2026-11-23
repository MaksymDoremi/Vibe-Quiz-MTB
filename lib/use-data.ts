"use client";

import { useCallback, useEffect } from "react";
import useSWR from "swr";
import { readQuestions, readSessions, subscribeStorage } from "./storage";
import type { Question, QuizSession } from "./types";

const EMPTY_QUESTIONS: Question[] = [];
const EMPTY_SESSIONS: QuizSession[] = [];

export function useQuestions() {
  const { data, isLoading, mutate } = useSWR<Question[]>("mtbiq:questions", readQuestions, {
    fallbackData: EMPTY_QUESTIONS,
    revalidateOnFocus: false,
  });
  const refresh = useCallback(() => {
    void mutate(readQuestions(), { revalidate: false });
  }, [mutate]);
  useEffect(() => subscribeStorage(refresh), [refresh]);
  return { questions: data ?? EMPTY_QUESTIONS, ready: !isLoading, refresh };
}

export function useSessions() {
  const { data, isLoading, mutate } = useSWR<QuizSession[]>("mtbiq:sessions", readSessions, {
    fallbackData: EMPTY_SESSIONS,
    revalidateOnFocus: false,
  });
  const refresh = useCallback(() => {
    void mutate(readSessions(), { revalidate: false });
  }, [mutate]);
  useEffect(() => subscribeStorage(refresh), [refresh]);
  return { sessions: data ?? EMPTY_SESSIONS, ready: !isLoading, refresh };
}
