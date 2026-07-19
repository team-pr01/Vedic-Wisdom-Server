
export type TDonor = {
  name: string;
  phoneNumber: string;
  amount: string;
  donatedAt: Date;
};

export type TProject = {
  imageUrl?: string;
  title: string;
  description: string;
  location: string;
  startDate?: Date;
  currency: string;
  amountNeeded: number;
  amountRaised?: number;
  donors: TDonor[];
  createdAt?: Date;
  updatedAt?: Date;
};