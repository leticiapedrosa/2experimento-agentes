import { DataTable, Then, When } from "@cucumber/cucumber";
import type { GeneratedExam, ScoredQuestion } from "../src/domain/examTypes";
import type { Question } from "../src/domain/types";

async function listQuestions(this: any): Promise<Question[]> {
  const res = await this.request.get("/api/questions");
  this.lastStatus = res.status;
  this.lastBody = res.body;
  return res.body as Question[];
}

function findQuestionByDescription<T extends { description: string }>(
  items: T[],
  description: string
): T | undefined {
  return items.find((q) => q.description === description);
}

When(
  "I generate an exam selecting the question with description {string}",
  async function (description: string) {
    const questions = await listQuestions.call(this);
    const q = findQuestionByDescription(questions, description);
    if (!q) throw new Error(`Question not found: ${description}`);

    const res = await this.request
      .post("/api/exams/generate?format=json")
      .set("Accept", "application/json")
      .send({ questionIds: [q.id] });

    this.lastStatus = res.status;
    this.lastBody = res.body;
    this.lastExam = res.body as GeneratedExam;
  }
);

Then(
  "the generated exam should include the question with description {string}",
  function (description: string) {
    const exam = this.lastExam as GeneratedExam | undefined;
    if (!exam) throw new Error("No generated exam found in world");
    const q = findQuestionByDescription(exam.questions, description);
    if (!q) throw new Error(`Generated exam did not include question: ${description}`);
    this.lastQuestion = q as any;
  }
);

Then(
  "that generated question should have alternative scores based on order:",
  function (table: DataTable) {
    const q = this.lastQuestion as ScoredQuestion | undefined;
    if (!q) throw new Error("No current generated question selected");

    const expected = table.hashes().map((row) => ({
      description: String(row.description),
      score: Number(row.score)
    }));

    if (q.alternatives.length !== expected.length) {
      throw new Error(
        `Expected ${expected.length} alternatives, got ${q.alternatives.length}`
      );
    }

    for (let i = 0; i < expected.length; i++) {
      const a = q.alternatives[i];
      const e = expected[i];
      if (a.description !== e.description) {
        throw new Error(
          `Expected alternative #${i + 1} description "${e.description}", got "${a.description}"`
        );
      }
      if (a.score !== e.score) {
        throw new Error(
          `Expected alternative #${i + 1} score ${e.score}, got ${a.score}`
        );
      }
    }
  }
);

Then("the generated question value should be {int}", function (value: number) {
  const q = this.lastQuestion as ScoredQuestion | undefined;
  if (!q) throw new Error("No current generated question selected");
  if (q.questionValue !== value) {
    throw new Error(`Expected questionValue ${value}, got ${q.questionValue}`);
  }
});

