import type { CreateQuestionInput, Question, UpdateQuestionInput } from "./types";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (res.status === 204) return undefined as T;

  const data = (await res.json()) as unknown;
  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "error" in data
        ? String((data as any).error)
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  listQuestions(): Promise<Question[]> {
    return http<Question[]>("/api/questions");
  },
  createQuestion(input: CreateQuestionInput): Promise<Question> {
    return http<Question>("/api/questions", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  updateQuestion(id: string, input: UpdateQuestionInput): Promise<Question> {
    return http<Question>(`/api/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(input)
    });
  },
  deleteQuestion(id: string): Promise<void> {
    return http<void>(`/api/questions/${id}`, { method: "DELETE" });
  },
  async generateExamPdf(questionIds: string[]): Promise<Blob> {
    const res = await fetch("/api/exams/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionIds })
    });
    if (!res.ok) {
      const maybe = await res
        .json()
        .catch(() => ({ error: `Request failed (${res.status})` }));
      const msg =
        typeof maybe === "object" && maybe && "error" in maybe
          ? String((maybe as any).error)
          : `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return await res.blob();
  }
};

