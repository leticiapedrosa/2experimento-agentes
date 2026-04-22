import type { StoredExam } from "./examStore";

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function generateGabaritoCsv(stored: StoredExam): string {
  const headers = ["ExamId", ...stored.exam.questions.map((_, i) => `Q${i + 1}`)];
  const row = [
    stored.examId,
    ...stored.exam.questions.map((q) => String(q.questionValue))
  ];

  return `${headers.map(csvEscape).join(",")}\n${row.map(csvEscape).join(",")}\n`;
}

