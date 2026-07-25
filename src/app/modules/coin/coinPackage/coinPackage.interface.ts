export type TCoinPackage = {
  amount: number;
  basePrice: number;
  discountedPrice: number;
  discountPercentage: number;
  pricePerCoin: number;
  createdAt?: Date;
  updatedAt?: Date;
}