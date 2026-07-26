export type TAudioBook = {
  thumbnailUrl: string;
  name: string;
  category : string;
  description: string;
  soldCount : number;
  isPremium: boolean;
  coinPrice: number;

  createdAt?: Date;
  updatedAt?: Date;
};