import type { Alternative, CreateQuestionInput } from "../domain/types";

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

function isBooleanLike(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function validateCreateQuestionBody(
  body: unknown
): ValidationResult<CreateQuestionInput> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, message: "Body must be an object" };
  }

  const b = body as Record<string, unknown>;
  if (!isNonEmptyString(b.description)) {
    return { ok: false, message: "description is required" };
  }

  if (!Array.isArray(b.alternatives) || b.alternatives.length === 0) {
    return { ok: false, message: "alternatives must be a non-empty array" };
  }

  const alternatives: Alternative[] = [];
  for (const a of b.alternatives) {
    if (typeof a !== "object" || a === null) {
      return { ok: false, message: "Each alternative must be an object" };
    }
    const aa = a as Record<string, unknown>;
    if (!isNonEmptyString(aa.description)) {
      return { ok: false, message: "Alternative description is required" };
    }
    if (!isBooleanLike(aa.isCorrect)) {
      return { ok: false, message: "Alternative isCorrect must be boolean" };
    }
    alternatives.push({
      description: aa.description,
      isCorrect: aa.isCorrect
    });
  }

  return {
    ok: true,
    value: { description: b.description, alternatives }
  };
}

