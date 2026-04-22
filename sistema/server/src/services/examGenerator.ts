import type { GeneratedExam, ScoredQuestion } from "../domain/examTypes";
import type { Question } from "../domain/types";

export function scoreAlternativeByIndex(index: number): number {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`Invalid alternative index: ${index}`);
  }
  return 2 ** index;
}

export function scoreQuestion(question: Question): ScoredQuestion {
  const alternatives = question.alternatives.map((a, idx) => ({
    ...a,
    score: scoreAlternativeByIndex(idx)
  }));

  const questionValue = alternatives.reduce(
    (sum, a) => sum + (a.isCorrect ? a.score : 0),
    0
  );

  return {
    id: question.id,
    description: question.description,
    alternatives,
    questionValue
  };
}

export function generateExam(questions: Question[]): GeneratedExam {
  const scored = questions.map(scoreQuestion);
  const totalValue = scored.reduce((sum, q) => sum + q.questionValue, 0);

  return {
    generatedAt: new Date().toISOString(),
    questions: scored,
    totalValue
  };
}

