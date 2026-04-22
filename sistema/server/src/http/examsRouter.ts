import { Router } from "express";
import { randomUUID } from "crypto";
import type { QuestionRepository } from "../repository/questionRepository";
import { generateExam } from "../services/examGenerator";
import { createExamPdf } from "../services/examPdf";
import { ExamStore } from "../services/examStore";
import { generateGabaritoCsv } from "../services/gabaritoCsv";

type GenerateExamBody =
  | {
      questionIds: string[];
      quantity?: never;
      disciplina?: string;
      professor?: string;
      data?: string;
    }
  | {
      quantity: number;
      questionIds?: never;
      disciplina?: string;
      professor?: string;
      data?: string;
    };

function wantsJson(req: any): boolean {
  const accept = String(req.headers?.accept ?? "");
  if (accept.includes("application/json")) return true;
  if (req.query?.format === "json") return true;
  return false;
}

export function createExamsRouter(repo: QuestionRepository) {
  const router = Router();
  const store = new ExamStore();

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
    const examId = randomUUID();
    const meta = {
      disciplina: String((body as any).disciplina ?? ""),
      professor: String((body as any).professor ?? ""),
      data: String((body as any).data ?? "")
    };

    store.put({ examId, meta, exam });

    if (wantsJson(req)) {
      return res.json({ examId, ...meta, ...exam });
    }

    const doc = createExamPdf(exam, examId, {
      disciplina: meta.disciplina || "[Nome]",
      professor: meta.professor || "[Nome]",
      data: meta.data || "[Data]"
    });
    res.setHeader("X-Exam-Id", examId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="exam.pdf"');
    doc.pipe(res);
    doc.end();
  });

  router.get("/:examId/key.csv", (req, res) => {
    const stored = store.get(req.params.examId);
    if (!stored) return res.status(404).json({ error: "Exam not found" });
    const csv = generateGabaritoCsv(stored);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="gabarito-${stored.examId}.csv"`
    );
    res.send(csv);
  });

  return router;
}

