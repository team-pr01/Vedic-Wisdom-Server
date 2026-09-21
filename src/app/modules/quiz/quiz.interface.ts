export type TQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
}

export type TQuiz = {
  type : "free" | "paid";
  title: string;
  description?: string;
  questions: TQuestion[];
}