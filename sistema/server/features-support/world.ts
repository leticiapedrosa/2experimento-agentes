import { setWorldConstructor, World } from "@cucumber/cucumber";
import type { Express } from "express";
import type supertest from "supertest";

import type { Question } from "../src/domain/types";
import type { QuestionRepository } from "../src/repository/questionRepository";

export class CustomWorld extends World {
  app!: Express;
  request!: supertest.SuperTest<supertest.Test>;
  repo!: QuestionRepository;

  lastStatus?: number;
  lastBody?: unknown;

  lastQuestion?: Question;
}

setWorldConstructor(CustomWorld);

