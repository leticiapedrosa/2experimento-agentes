import { Before, DataTable, Given, Then, When } from "@cucumber/cucumber";
import request from "supertest";
import { createApp } from "../src/app";
import { QuestionRepository } from "../src/repository/questionRepository";
import type { Alternative, Question } from "../src/domain/types";

function parseAlternatives(table: DataTable): Alternative[] {
  return table.hashes().map((row) => ({
    description: String(row.description ?? ""),
    isCorrect: String(row.isCorrect ?? "").toLowerCase() === "true"
  }));
}

async function listQuestions(this: any): Promise<Question[]> {
  const res = await this.request.get("/api/questions");
  this.lastStatus = res.status;
  this.lastBody = res.body;
  return res.body as Question[];
}

function findByDescription(questions: Question[], description: string) {
  return questions.find((q) => q.description === description);
}

Before(function () {
  this.repo = new QuestionRepository();
  this.app = createApp(this.repo);
  this.request = request(this.app);
  this.lastStatus = undefined;
  this.lastBody = undefined;
  this.lastQuestion = undefined;
});

Given("the system is ready to manage questions", function () {
  // App + repo are created fresh in Before().
});

Given(
  "a question exists with description {string} and the following alternatives:",
  async function (description: string, alternatives: DataTable) {
    const res = await this.request.post("/api/questions").send({
      description,
      alternatives: parseAlternatives(alternatives)
    });
    this.lastStatus = res.status;
    this.lastBody = res.body;
    this.lastQuestion = res.body as Question;
  }
);

When(
  "I create a question with description {string} and the following alternatives:",
  async function (description: string, alternatives: DataTable) {
    const res = await this.request.post("/api/questions").send({
      description,
      alternatives: parseAlternatives(alternatives)
    });
    this.lastStatus = res.status;
    this.lastBody = res.body;
    this.lastQuestion = res.body as Question;
  }
);

When("I list all questions", function () {
  return listQuestions.call(this);
});

When(
  "I update the question {string} to have description {string} and the following alternatives:",
  async function (
    oldDescription: string,
    newDescription: string,
    alternatives: DataTable
  ) {
    const questions = await listQuestions.call(this);
    const existing = findByDescription(questions, oldDescription);
    if (!existing) throw new Error(`Question not found: ${oldDescription}`);

    const res = await this.request.put(`/api/questions/${existing.id}`).send({
      description: newDescription,
      alternatives: parseAlternatives(alternatives)
    });
    this.lastStatus = res.status;
    this.lastBody = res.body;
    this.lastQuestion = res.body as Question;
  }
);

When(
  "I delete the question with description {string}",
  async function (description: string) {
    const questions = await listQuestions.call(this);
    const existing = findByDescription(questions, description);
    if (!existing) throw new Error(`Question not found: ${description}`);

    const res = await this.request.delete(`/api/questions/${existing.id}`);
    this.lastStatus = res.status;
    this.lastBody = res.body;
  }
);

Then("the question should be created successfully", function () {
  if (this.lastStatus !== 201) {
    throw new Error(
      `Expected status 201, got ${this.lastStatus}. Body: ${JSON.stringify(
        this.lastBody
      )}`
    );
  }
});

Then(
  "listing questions should include a question with description {string}",
  async function (description: string) {
    const questions = await listQuestions.call(this);
    const found = findByDescription(questions, description);
    if (!found) {
      throw new Error(
        `Expected to find question "${description}", got: ${questions
          .map((q) => q.description)
          .join(", ")}`
      );
    }
    this.lastQuestion = found;
  }
);

Then(
  "listing questions should not include a question with description {string}",
  async function (description: string) {
    const questions = await listQuestions.call(this);
    const found = findByDescription(questions, description);
    if (found) {
      throw new Error(`Expected not to find question "${description}"`);
    }
  }
);

Then(
  "I should see a question with description {string}",
  async function (description: string) {
    const questions = await listQuestions.call(this);
    const found = findByDescription(questions, description);
    if (!found) {
      throw new Error(`Expected to see question "${description}"`);
    }
  }
);

Then(
  "that question should have the following alternatives:",
  function (alternatives: DataTable) {
    const expected = parseAlternatives(alternatives);
    const q = this.lastQuestion as Question | undefined;
    if (!q) throw new Error("No current question selected for assertion");

    const actual = q.alternatives;
    if (actual.length !== expected.length) {
      throw new Error(
        `Expected ${expected.length} alternatives, got ${actual.length}`
      );
    }

    for (let i = 0; i < expected.length; i++) {
      const e = expected[i];
      const a = actual[i];
      if (a.description !== e.description || a.isCorrect !== e.isCorrect) {
        throw new Error(
          `Alternative mismatch at index ${i}. Expected ${JSON.stringify(
            e
          )}, got ${JSON.stringify(a)}`
        );
      }
    }
  }
);

