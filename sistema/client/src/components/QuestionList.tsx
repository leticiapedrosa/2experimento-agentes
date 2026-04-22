import type { Question } from "../types";

type Props = {
  questions: Question[];
  loading: boolean;
  onEdit: (q: Question) => void;
  onDelete: (q: Question) => void;
};

export function QuestionList({ questions, loading, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">Loading questions…</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
        <p className="text-sm text-slate-600">No questions yet.</p>
        <p className="mt-1 text-xs text-slate-500">
          Create your first question to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <div
          key={q.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-900">
                {q.description}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {q.alternatives.length} alternatives
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(q)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(q)}
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Alternative</th>
                  <th className="px-3 py-2 font-medium">isCorrect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {q.alternatives.map((a, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-3 py-2 text-slate-800">{a.description}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          a.isCorrect
                            ? "inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                            : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                        }
                      >
                        {String(a.isCorrect)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

