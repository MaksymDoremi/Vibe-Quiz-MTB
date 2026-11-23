export const categories = [
  "Suspension Lab",
  "Brake Zone",
  "Drivetrain Master",
  "Brand Battle",
  "Bike Anatomy",
  "Workshop Mechanic",
  "Trail Skills",
  "Ultimate MTB Challenge",
] as const;

export type Category = (typeof categories)[number];
export type Difficulty = "Beginner" | "Intermediate" | "Expert" | "Mixed";
export type QuestionDifficulty = Exclude<Difficulty, "Mixed">;
export type QuestionType = "single" | "multiple" | "text";
export type QuizMode = "Practice" | "Challenge";

export type AnswerOption = { id: string; text: string };

export type Question = {
  id: string;
  text: string;
  category: Exclude<Category, "Ultimate MTB Challenge">;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  image?: string;
  imageAlt?: string;
  options: AnswerOption[];
  correctOptionIds: string[];
  acceptedAnswers: string[];
  explanation: string;
  createdAt: string;
  updatedAt: string;
};

export type SessionAnswer = {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  category: Question["category"];
  difficulty: QuestionDifficulty;
  image?: string;
  imageAlt?: string;
  options: AnswerOption[];
  selectedOptionIds: string[];
  typedAnswer: string;
  correctOptionIds: string[];
  acceptedAnswers: string[];
  explanation: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
};

export type QuizSession = {
  id: string;
  playerName: string;
  category: Category;
  difficulty: Difficulty;
  mode: QuizMode;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  answers: SessionAnswer[];
};

export type QuizSettings = {
  reduceMotion: boolean;
};
