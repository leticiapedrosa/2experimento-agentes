import PDFDocument from "pdfkit";
import type { GeneratedExam } from "../domain/examTypes";

type ExamPdfMeta = {
  disciplina: string;
  professor: string;
  data: string;
};

function drawHeaderFirstPage(doc: PDFKit.PDFDocument, meta: ExamPdfMeta) {
  doc.fontSize(18).text("Exam", { align: "center" });
  doc.moveDown(0.6);

  doc
    .roundedRect(50, doc.y, 495, 52, 8)
    .fillAndStroke("#f8fafc", "#e2e8f0");
  doc.fillColor("black");

  const y = doc.y - 42;
  doc.fontSize(11).text(`Disciplina: ${meta.disciplina}`, 62, y + 10);
  doc.fontSize(11).text(`Professor: ${meta.professor}`, 62, y + 28);
  doc.fontSize(11).text(`Data: ${meta.data}`, 350, y + 28, { width: 180 });

  doc.moveDown(1.4);
}

function drawFooter(doc: PDFKit.PDFDocument, examId: string) {
  const bottomY = doc.page.height - doc.page.margins.bottom + 10;
  doc
    .fontSize(9)
    .fillColor("gray")
    .text(`Unique Exam ID: ${examId}`, 50, bottomY, {
      width: 495,
      align: "center"
    });
  doc.fillColor("black");
}

export function createExamPdf(
  exam: GeneratedExam,
  examId: string,
  meta: ExamPdfMeta
): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50
  });

  drawHeaderFirstPage(doc, meta);
  drawFooter(doc, examId);
  doc.on("pageAdded", () => drawFooter(doc, examId));

  doc
    .fontSize(9)
    .fillColor("gray")
    .text(`Generated at: ${exam.generatedAt}`, { align: "center" });
  doc.fillColor("black").moveDown(1.2);

  exam.questions.forEach((q, qIdx) => {
    doc.fontSize(12).text(`${qIdx + 1}. ${q.description}`, { lineGap: 2 });
    doc.moveDown(0.6);

    q.alternatives.forEach((a, aIdx) => {
      const label = String.fromCharCode("A".charCodeAt(0) + aIdx);
      doc
        .fontSize(11)
        .text(`${label}) [${a.score}] ${a.description}`, { indent: 14, lineGap: 3 });
      doc.moveDown(0.2);
    });

    doc.moveDown(0.6);
    doc
      .fontSize(11)
      .text("Final Sum: ________________________________________________", {
        indent: 14
      });
    doc.moveDown(1.2);

    if (doc.y > 720) doc.addPage();
  });

  doc.moveDown(0.5);
  doc.fontSize(12).text("Student information");
  doc.moveDown(0.8);
  doc.fontSize(11).text("Student Name:");
  doc
    .moveDown(0.2)
    .text("____________________________________________________________");
  doc.moveDown(0.8);
  doc.fontSize(11).text("CPF:");
  doc
    .moveDown(0.2)
    .text("____________________________________________________________");

  return doc;
}

