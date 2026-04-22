import { useState } from "react";
import { GenerateExamPage } from "./pages/GenerateExamPage";
import { QuestionManagementPage } from "./pages/QuestionManagementPage";

export default function App() {
  const [page, setPage] = useState<"questions" | "generate">("questions");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Sistema</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage questions and generate exams (PDF).
            </p>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setPage("questions")}
              className={
                page === "questions"
                  ? "rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                  : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              }
            >
              Questions
            </button>
            <button
              onClick={() => setPage("generate")}
              className={
                page === "generate"
                  ? "rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                  : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              }
            >
              Generate Exam
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {page === "questions" ? <QuestionManagementPage /> : <GenerateExamPage />}
      </main>
    </div>
  );
}

