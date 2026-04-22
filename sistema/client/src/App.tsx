import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { QuestionForm } from "./components/QuestionForm";
import { QuestionList } from "./components/QuestionList";
import type { CreateQuestionInput, Question } from "./types";

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"idle" | "create" | "edit">("idle");
  const [selected, setSelected] = useState<Question | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listQuestions();
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const headerSubtitle = useMemo(() => {
    if (loading) return "Loading…";
    if (error) return "Backend not reachable or returned an error.";
    return `${questions.length} question${questions.length === 1 ? "" : "s"}`;
  }, [loading, error, questions.length]);

  async function handleCreate(input: CreateQuestionInput) {
    await api.createQuestion(input);
    setMode("idle");
    await refresh();
  }

  async function handleUpdate(input: CreateQuestionInput) {
    if (!selected) return;
    await api.updateQuestion(selected.id, input);
    setMode("idle");
    setSelected(null);
    await refresh();
  }

  async function handleDelete(q: Question) {
    const ok = window.confirm("Delete this question?");
    if (!ok) return;
    setError(null);
    try {
      await api.deleteQuestion(q.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete question");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-slate-900">
              Question Management
            </h1>
            <p className="mt-1 text-sm text-slate-600">{headerSubtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMode("create");
                setSelected(null);
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New question
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <QuestionList
              questions={questions}
              loading={loading}
              onEdit={(q) => {
                setSelected(q);
                setMode("edit");
              }}
              onDelete={handleDelete}
            />
          </div>

          <div className="lg:col-span-2">
            {mode === "idle" ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                Select a question to edit, or create a new one.
                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                  Backend: <code className="font-mono">localhost:4000</code> · UI
                  proxies API via <code className="font-mono">/api</code>
                </div>
              </div>
            ) : (
              <QuestionForm
                mode={mode === "create" ? "create" : "edit"}
                initial={selected}
                onCancel={() => {
                  setMode("idle");
                  setSelected(null);
                }}
                onSubmit={mode === "create" ? handleCreate : handleUpdate}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

