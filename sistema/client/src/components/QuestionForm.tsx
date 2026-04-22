import { useEffect, useMemo, useState } from "react";
import type { Alternative, CreateQuestionInput, Question } from "../types";

type Props = {
  mode: "create" | "edit";
  initial?: Question | null;
  onCancel: () => void;
  onSubmit: (input: CreateQuestionInput) => Promise<void>;
};

function emptyAlternative(): Alternative {
  return { description: "", isCorrect: false };
}

export function QuestionForm({ mode, initial, onCancel, onSubmit }: Props) {
  const [description, setDescription] = useState("");
  const [alternatives, setAlternatives] = useState<Alternative[]>([
    emptyAlternative(),
    emptyAlternative()
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && initial) {
      setDescription(initial.description);
      setAlternatives(
        initial.alternatives.length > 0
          ? initial.alternatives.map((a) => ({ ...a }))
          : [emptyAlternative()]
      );
      setError(null);
    }
    if (mode === "create") {
      setDescription("");
      setAlternatives([emptyAlternative(), emptyAlternative()]);
      setError(null);
    }
  }, [mode, initial]);

  const canSubmit = useMemo(() => {
    if (description.trim().length === 0) return false;
    if (alternatives.length === 0) return false;
    if (alternatives.some((a) => a.description.trim().length === 0)) return false;
    return true;
  }, [description, alternatives]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || saving) return;

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        description: description.trim(),
        alternatives: alternatives.map((a) => ({
          description: a.description.trim(),
          isCorrect: a.isCorrect
        }))
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "create" ? "Create question" : "Edit question"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Provide a description and at least one alternative.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700">
          Question description
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          placeholder='e.g. "What is 2 + 2?"'
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-slate-700">Alternatives</h3>
          <button
            type="button"
            onClick={() => setAlternatives((prev) => [...prev, emptyAlternative()])}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Add alternative
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {alternatives.map((alt, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center"
            >
              <div className="flex-1">
                <label className="sr-only">Alternative description</label>
                <input
                  value={alt.description}
                  onChange={(e) =>
                    setAlternatives((prev) =>
                      prev.map((p, i) =>
                        i === idx ? { ...p, description: e.target.value } : p
                      )
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  placeholder={`Alternative ${idx + 1}`}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={alt.isCorrect}
                  onChange={(e) =>
                    setAlternatives((prev) =>
                      prev.map((p, i) =>
                        i === idx ? { ...p, isCorrect: e.target.checked } : p
                      )
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                Correct
              </label>

              <button
                type="button"
                onClick={() =>
                  setAlternatives((prev) => prev.filter((_, i) => i !== idx))
                }
                className="rounded-lg px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                disabled={alternatives.length <= 1}
                title={alternatives.length <= 1 ? "At least one alternative required" : "Remove"}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={!canSubmit || saving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : mode === "create" ? "Create" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

