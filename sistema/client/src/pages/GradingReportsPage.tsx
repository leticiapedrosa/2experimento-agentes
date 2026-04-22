import Papa from "papaparse";
import { useMemo, useState } from "react";

type KeyRow = {
  ExamId: string;
  [k: string]: string;
};

type StudentRow = {
  "Exam ID": string;
  "Student Name": string;
  [k: string]: string;
};

type GradeMode = "strict" | "flexible";

function popcount(n: number): number {
  let x = n >>> 0;
  let c = 0;
  while (x) {
    x &= x - 1;
    c++;
  }
  return c;
}

function flexibleRatio(expected: number, student: number): number {
  const correctMask = expected >>> 0;
  const studentMask = student >>> 0;
  const correctBits = popcount(correctMask);
  if (correctBits === 0) return studentMask === 0 ? 1 : 0;
  const maskAll = correctMask | studentMask;
  const tp = popcount(studentMask & correctMask);
  const fp = popcount(studentMask & (maskAll ^ correctMask));
  const ratio = (tp - fp) / correctBits;
  return Math.max(0, Math.min(1, ratio));
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function parseCsv<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err)
    });
  });
}

export function GradingReportsPage() {
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [responsesFile, setResponsesFile] = useState<File | null>(null);
  const [mode, setMode] = useState<GradeMode>("strict");
  const [error, setError] = useState<string | null>(null);

  const [keyRows, setKeyRows] = useState<KeyRow[] | null>(null);
  const [studentRows, setStudentRows] = useState<StudentRow[] | null>(null);

  async function handleParse() {
    setError(null);
    try {
      if (!keyFile || !responsesFile) {
        setError("Please upload both CSV files.");
        return;
      }
      const k = await parseCsv<KeyRow>(keyFile);
      const s = await parseCsv<StudentRow>(responsesFile);
      setKeyRows(k);
      setStudentRows(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV files");
    }
  }

  const report = useMemo(() => {
    if (!keyRows || !studentRows) return null;
    if (keyRows.length === 0) return { rows: [], totalPossible: 0 };

    const keyByExamId = new Map<string, KeyRow>();
    for (const r of keyRows) keyByExamId.set(String(r.ExamId ?? "").trim(), r);

    const firstKey = keyRows[0];
    const questionCols = Object.keys(firstKey).filter((k) => /^Q\d+$/i.test(k));
    questionCols.sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

    const rows = studentRows.map((sr) => {
      const examId = String(sr["Exam ID"] ?? "").trim();
      const studentName = String(sr["Student Name"] ?? "").trim();
      const key = keyByExamId.get(examId);

      if (!key) {
        return {
          examId,
          studentName,
          finalGrade: 0,
          note: "Exam ID not found in key"
        };
      }

      let pointsEarned = 0;
      let pointsPossible = 0;

      questionCols.forEach((qcol, idx) => {
        const expected = Number(key[qcol] ?? 0);
        const ansCol = `Answer${idx + 1}`;
        const student = Number((sr as any)[ansCol] ?? 0);

        pointsPossible += expected;

        if (mode === "strict") {
          pointsEarned += student === expected ? expected : 0;
        } else {
          pointsEarned += flexibleRatio(expected, student) * expected;
        }
      });

      const finalGrade =
        pointsPossible > 0 ? (pointsEarned / pointsPossible) * 10 : 0;

      return { examId, studentName, finalGrade, note: "" };
    });

    const totalPossible = questionCols.reduce(
      (sum, c) => sum + Number(firstKey[c] ?? 0),
      0
    );

    return { rows, totalPossible };
  }, [keyRows, studentRows, mode]);

  function exportReport() {
    if (!report) return;
    const header = ["Student Name", "Exam ID", "Final Grade"];
    const lines = [
      header.join(","),
      ...report.rows.map((r) =>
        [
          `"${String(r.studentName).replace(/"/g, '""')}"`,
          `"${String(r.examId).replace(/"/g, '""')}"`,
          String(Math.round(r.finalGrade * 100) / 100)
        ].join(",")
      )
    ].join("\n");
    downloadText(lines + "\n", "grades-report.csv");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Grading &amp; Reports
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload the official answer key (gabarito) CSV and a student responses
          CSV (Exam ID, Student Name, Answer1, Answer2, …). Choose Strict or
          Flexible grading.
        </p>

        {error ? (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Official Answer Key (CSV)
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Columns: ExamId, Q1, Q2, ...
            </p>
            <input
              type="file"
              accept=".csv,text/csv"
              className="mt-3 w-full text-sm"
              onChange={(e) => setKeyFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Student Responses (CSV)
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Columns: Exam ID, Student Name, Answer1, Answer2, ...
            </p>
            <input
              type="file"
              accept=".csv,text/csv"
              className="mt-3 w-full text-sm"
              onChange={(e) => setResponsesFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">
              Grading mode
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "strict"}
                  onChange={() => setMode("strict")}
                />
                Strict (Mais Rigorosa)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "flexible"}
                  onChange={() => setMode("flexible")}
                />
                Flexible (Menos Rigorosa)
              </label>
            </div>
            <button
              onClick={handleParse}
              className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Generate report
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Grades report</h3>
            <p className="mt-1 text-xs text-slate-600">
              Final grade is normalized to 0–10.
            </p>
          </div>
          <button
            onClick={exportReport}
            disabled={!report || report.rows.length === 0}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Download report CSV
          </button>
        </div>

        {!report ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
            Upload the CSV files above to generate the report.
          </div>
        ) : report.rows.length === 0 ? (
          <div className="mt-4 text-sm text-slate-600">No rows found.</div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Student Name</th>
                  <th className="px-3 py-2 font-medium">Exam ID</th>
                  <th className="px-3 py-2 font-medium">Final Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {report.rows.map((r, idx) => (
                  <tr key={idx} className="bg-white hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-800">{r.studentName}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700">
                      {r.examId}
                    </td>
                    <td className="px-3 py-2 text-slate-800">
                      {Math.round(r.finalGrade * 100) / 100}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

