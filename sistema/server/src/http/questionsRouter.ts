import { Router } from "express";
import type { QuestionRepository } from "../repository/questionRepository";
import { validateCreateQuestionBody } from "./validation";

export function createQuestionsRouter(repo: QuestionRepository) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json(repo.list());
  });

  router.post("/", (req, res) => {
    const validation = validateCreateQuestionBody(req.body);
    if (!validation.ok) {
      return res.status(400).json({ error: validation.message });
    }
    const created = repo.create(validation.value);
    return res.status(201).json(created);
  });

  router.put("/:id", (req, res) => {
    const validation = validateCreateQuestionBody(req.body);
    if (!validation.ok) {
      return res.status(400).json({ error: validation.message });
    }
    const updated = repo.update(req.params.id, validation.value);
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  });

  router.delete("/:id", (req, res) => {
    const ok = repo.delete(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    return res.status(204).send();
  });

  return router;
}

