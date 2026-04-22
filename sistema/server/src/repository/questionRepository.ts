import { randomUUID } from "crypto";
import type {
  CreateQuestionInput,
  Question,
  UpdateQuestionInput
} from "../domain/types";

export class QuestionRepository {
  private items: Question[] = [];

  clear() {
    this.items = [];
  }

  list(): Question[] {
    return [...this.items];
  }

  getById(id: string): Question | undefined {
    return this.items.find((q) => q.id === id);
  }

  getByDescription(description: string): Question | undefined {
    return this.items.find((q) => q.description === description);
  }

  create(input: CreateQuestionInput): Question {
    const created: Question = {
      id: randomUUID(),
      description: input.description,
      alternatives: input.alternatives
    };
    this.items.push(created);
    return created;
  }

  update(id: string, input: UpdateQuestionInput): Question | undefined {
    const idx = this.items.findIndex((q) => q.id === id);
    if (idx === -1) return undefined;
    const updated: Question = { id, ...input };
    this.items[idx] = updated;
    return updated;
  }

  delete(id: string): boolean {
    const before = this.items.length;
    this.items = this.items.filter((q) => q.id !== id);
    return this.items.length !== before;
  }
}

