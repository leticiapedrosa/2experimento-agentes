export type Alternative = {
  description: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  description: string;
  alternatives: Alternative[];
};

export type CreateQuestionInput = Omit<Question, "id">;
export type UpdateQuestionInput = CreateQuestionInput;

