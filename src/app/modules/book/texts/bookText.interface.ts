import { ObjectId } from "mongoose";

export type TLocation = {
  levelName: string;
  value: string;
};

export type TSanskritWord = {
  sanskritWord: string;
  shortMeaning: string;
  descriptiveMeaning: string;
};

export type TTranslation = {
  langCode: string;
  translation: string;
  sanskritWordBreakdown?: TSanskritWord[];
  isHumanVerified?: boolean
};

export type TBookText = {
  bookId: ObjectId;
  location: TLocation[];
  originalText: string;
  primaryTranslation: string;
  translations?: TTranslation[];
  tags: string[];
};