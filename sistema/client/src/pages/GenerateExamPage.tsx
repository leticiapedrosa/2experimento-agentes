import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import type { Question } from "../types";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function GenerateExamPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [lastExamId, setLastExamId] = useState<string | null>(null);
  const [disciplina, setDisciplina] = useState("");
  const [professor, setProfessor] = useState("");
  const [data, setData] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const qs = await api.listQuestions();
        setQuestions(qs);
        setSelected({});
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load questions");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  async function handleGenerate() {
    if (selectedIds.length === 0 || generating) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await api.generateExamPdf({
        questionIds: selectedIds,
        disciplina,
        professor,
        data
      });
      setLastExamId(res.examId);
      downloadBlob(res.blob, "exam.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate exam");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownloadKey() {
    if (!lastExamId) return;
    setError(null);
    try {
      const blob = await api.downloadGabaritoCsv(lastExamId);
      downloadBlob(blob, `gabarito-${lastExamId}.csv`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download gabarito");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Generate Exam</h2>
        <p className="mt-1 text-sm text-slate-600">
          Select questions and generate a downloadable PDF. Alternative scores are
          computed by order (1, 2, 4, 8, …).
        </p>

        {error ? (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-700">
            Selected: <span className="font-semibold">{selectedIds.length}</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={handleGenerate}
              disabled={selectedIds.length === 0 || generating}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {generating ? "Generating…" : "Generate & Download PDF"}
            </button>
            <button
              onClick={handleDownloadKey}
              disabled={!lastExamId}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-50"
            >
              Download Gabarito (CSV)
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Disciplina
            </label>
            <input
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="[Nome]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Professor
            </label>
            <input
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="[Nome]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Data</label>
            <input
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="[Data]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Questions</h3>

        {loading ? (
          <p className="mt-2 text-sm text-slate-600">Loading…</p>
        ) : questions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No questions available. Create some questions first.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-slate-200">
            {questions.map((q) => (
              <label
                key={q.id}
                className="flex cursor-pointer items-start gap-3 py-3"
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                  checked={Boolean(selected[q.id])}
                  onChange={(e) =>
                    setSelected((prev) => ({ ...prev, [q.id]: e.target.checked }))
                  }
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {q.description}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {q.alternatives.length} alternatives
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

