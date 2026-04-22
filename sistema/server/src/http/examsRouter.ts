import { Router } from "express";
import type { QuestionRepository } from "../repository/questionRepository";
import { generateExam } from "../services/examGenerator";
import { createExamPdf } from "../services/examPdf";

type GenerateExamBody =
  | { questionIds: string[]; quantity?: never }
  | { quantity: number; questionIds?: never };

function wantsJson(req: any): boolean {
  const accept = String(req.headers?.accept ?? "");
  if (accept.includes("application/json")) return true;
  if (req.query?.format === "json") return true;
  return false;
}

export function createExamsRouter(repo: QuestionRepository) {
  const router = Router();

  router.post("/generate", (req, res) => {
    const body = req.body as Partial<GenerateExamBody>;

    let selectedIds: string[] = [];

    if (Array.isArray((body as any)?.questionIds)) {
      selectedIds = (body as any).questionIds as string[];
    } else if (typeof (body as any)?.quantity === "number") {
      const qty = Math.floor((body as any).quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ error: "quantity must be > 0" });
      }
      selectedIds = repo
        .list()
        .slice(0, qty)
        .map((q) => q.id);
    } else {
      return res
        .status(400)
        .json({ error: "Provide questionIds[] or quantity" });
    }

    const questions = selectedIds
      .map((id) => repo.getById(id))
      .filter(Boolean);

    if (questions.length !== selectedIds.length) {
      return res.status(400).json({ error: "One or more questionIds not found" });
    }

    const exam = generateExam(questions as any);

    if (wantsJson(req)) {
      return res.json(exam);
    }

    const doc = createExamPdf(exam);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="exam.pdf"');
    doc.pipe(res);
    doc.end();
  });

  return router;
}

