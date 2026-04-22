import PDFDocument from "pdfkit";
import type { GeneratedExam } from "../domain/examTypes";

export function createExamPdf(exam: GeneratedExam): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50
  });

  doc.fontSize(18).text("Exam", { align: "center" });
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .fillColor("gray")
    .text(`Generated at: ${exam.generatedAt}`, { align: "center" });
  doc.fillColor("black");
  doc.moveDown(1);

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

  doc
    .moveDown(0.5)
    .fontSize(11)
    .text(`Total Value (for grading): ${exam.totalValue}`);

  return doc;
}

