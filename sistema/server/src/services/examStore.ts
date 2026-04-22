import type { GeneratedExam } from "../domain/examTypes";

export type StoredExam = {
  examId: string;
  meta: {
    disciplina: string;
    professor: string;
    data: string;
  };
  exam: GeneratedExam;
};

export class ExamStore {
  private byId = new Map<string, StoredExam>();

  put(stored: StoredExam) {
    this.byId.set(stored.examId, stored);
  }

  get(examId: string): StoredExam | undefined {
    return this.byId.get(examId);
  }
}

