import type { Alternative, Question } from "./types";

export type ScoredAlternative = Alternative & {
  score: number;
};

export type ScoredQuestion = Omit<Question, "alternatives"> & {
  alternatives: ScoredAlternative[];
  questionValue: number;
};

export type GeneratedExam = {
  generatedAt: string;
  questions: ScoredQuestion[];
  totalValue: number;
};

