import express from "express";
import cors from "cors";
import { createQuestionsRouter } from "./http/questionsRouter";
import { createExamsRouter } from "./http/examsRouter";
import type { QuestionRepository } from "./repository/questionRepository";

export function createApp(repo: QuestionRepository) {
  const app = express();

  app.use(
    cors({
      origin: [/^http:\/\/localhost:\d+$/],
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type"]
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/questions", createQuestionsRouter(repo));
  app.use("/api/exams", createExamsRouter(repo));

  return app;
}

