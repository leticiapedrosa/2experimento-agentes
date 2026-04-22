import { useState } from "react";
import { GenerateExamPage } from "./pages/GenerateExamPage";
import { GradingReportsPage } from "./pages/GradingReportsPage";
import { QuestionManagementPage } from "./pages/QuestionManagementPage";

export default function App() {
  const [page, setPage] = useState<"questions" | "generate" | "grading">(
    "questions"
  );

  const navItem = (id: "questions" | "generate" | "grading") =>
    page === id
      ? "flex w-full items-center justify-between rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
      : "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                S
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  Sistema
                </div>
                <div className="truncate text-xs text-slate-500">
                  Exam management suite
                </div>
              </div>
            </div>

            <nav className="mt-4 space-y-1">
              <button
                onClick={() => setPage("questions")}
                className={navItem("questions")}
              >
                Questions
              </button>
              <button
                onClick={() => setPage("generate")}
                className={navItem("generate")}
              >
                Generate Exam
              </button>
              <button
                onClick={() => setPage("grading")}
                className={navItem("grading")}
              >
                Grading &amp; Reports
              </button>
            </nav>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  {page === "questions"
                    ? "Questions"
                    : page === "generate"
                    ? "Generate Exam"
                    : "Grading & Reports"}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {page === "questions"
                    ? "Create, edit, and organize your question bank."
                    : page === "generate"
                    ? "Select questions and generate a student PDF + gabarito."
                    : "Upload CSVs and produce grades + reports."}
                </p>
              </div>

              <div className="flex gap-2 lg:hidden">
                <button
                  onClick={() => setPage("questions")}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Questions
                </button>
                <button
                  onClick={() => setPage("generate")}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Generate
                </button>
                <button
                  onClick={() => setPage("grading")}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Grading
                </button>
              </div>
            </div>
          </header>

          <main className="min-w-0">
            {page === "questions" ? (
              <QuestionManagementPage />
            ) : page === "generate" ? (
              <GenerateExamPage />
            ) : (
              <GradingReportsPage />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

