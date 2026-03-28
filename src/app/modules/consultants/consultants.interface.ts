
export type TConsultancyService = {
  imageUrl?: string;
  name: string;
  email?:string;
  phoneNumber:string;
  specialties: string[];
  experience: string;
  category: string;
  fees: string;
  rating: string;
  createdAt?: Date;
  updatedAt?: Date;
};