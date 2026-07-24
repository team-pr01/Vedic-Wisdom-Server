export type TAudioBook = {
  thumbnailUrl: string;
  name: string;
  category : string;
  description: string;
  soldCount : number;
  isPremium: boolean;

  createdAt?: Date;
  updatedAt?: Date;
};