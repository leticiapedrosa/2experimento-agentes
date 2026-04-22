import PDFDocument from "pdfkit";
import type { GeneratedExam } from "../domain/examTypes";

type ExamPdfMeta = {
  disciplina: string;
  professor: string;
  data: string;
};

function drawHeader(doc: PDFKit.PDFDocument, meta: ExamPdfMeta) {
  const top = doc.page.margins.top;
  doc.fontSize(11).text(`Disciplina: ${meta.disciplina}`, 50, top - 30);
  doc.fontSize(11).text(`Professor: ${meta.professor}`, 50, top - 15);
  doc.fontSize(11).text(`Data: ${meta.data}`, 350, top - 15, { width: 200 });
  doc.moveTo(50, top - 5).lineTo(545, top - 5).strokeColor("#e2e8f0").stroke();
  doc.strokeColor("black");
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

  const applyDecorations = () => {
    drawHeader(doc, meta);
    drawFooter(doc, examId);
  };

  applyDecorations();
  doc.on("pageAdded", applyDecorations);

  doc.y = 70;
  doc.fontSize(16).text("Exam", { align: "center" });
  doc
    .moveDown(0.2)
    .fontSize(9)
    .fillColor("gray")
    .text(`Generated at: ${exam.generatedAt}`, { align: "center" });
  doc.fillColor("black").moveDown(0.8);

  exam.questions.forEach((q, qIdx) => {
    doc.fontSize(12).text(`${qIdx + 1}. ${q.description}`);
    doc.moveDown(0.3);

    q.alternatives.forEach((a, aIdx) => {
      const label = String.fromCharCode("A".charCodeAt(0) + aIdx);
      doc
        .fontSize(11)
        .text(`${label}) [${a.score}] ${a.description}`, { indent: 14 });
    });

    doc.moveDown(0.4);
    doc
      .fontSize(11)
      .text("Final Sum: ________________________________", { indent: 14 });
    doc
      .fontSize(10)
      .fillColor("gray")
      .text(`Question Value (for grading): ${q.questionValue}`, { indent: 14 });
    doc.fillColor("black");
    doc.moveDown(1);

    if (doc.y > 720) doc.addPage();
  });

  doc.moveDown(0.5);
  doc.fontSize(12).text("Student information");
  doc.moveDown(0.4);
  doc.fontSize(11).text("Student Name: __________________________________________");
  doc.moveDown(0.3);
  doc.fontSize(11).text("CPF: ____________________________________________________");

  doc
    .moveDown(0.5)
    .fontSize(11)
    .text(`Total Value (for grading): ${exam.totalValue}`);

  return doc;
}

