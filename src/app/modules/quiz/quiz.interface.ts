// quiz.interface.ts

export type TQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
};

export type TLevels = {
  no: number;
  name?: string;  // optional
  passingScore: number; // e.g., 27 (out of 30)
  duration: number;
  questions: TQuestion[];
};

export type TPrize = {
  currency: string;
  firstPrize: number;
  secondPrize: number;
  thirdPrize: number;
  fourthPrize: number;
  fifthPrize: number;
  sixthPrize: number;
  seventhPrize: number;
  eighthPrize: number;
  ninthPrize: number;
  tenthPrize: number;
};

export type TQuiz = {
  type: "free" | "paid";
  name: string;
  levels: TLevels[];
  prize: TPrize;
  status: "draft" | "active";
};