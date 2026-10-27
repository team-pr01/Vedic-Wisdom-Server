export type TProject = {
  imageUrl?: string;
  title: string;
  description: string;
  location: string;
  startDate?: Date;
  currency: string;
  amountNeeded: number;
  amountRaised?: number;
  createdAt?: Date;
  updatedAt?: Date;
};