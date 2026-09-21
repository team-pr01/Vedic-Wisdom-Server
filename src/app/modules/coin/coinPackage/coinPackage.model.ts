/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from "mongoose";
import { TCoinPackage } from "./coinPackage.interface";

const CoinPackageSchema = new Schema<TCoinPackage>(
    {
        amount: {
            type: Number,
            required: true,
            min: 1,
            unique: true,
            index: true
        },
        basePrice: {
            type: Number,
            required: true,
            min: 1
        },
        discountedPrice: {
            type: Number,
            required: true,
            min: 1
        },
        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        pricePerCoin: {
            type: Number,
            default: 0,
            min: 0
        },
    },
    {
        timestamps: true
    }
);

// Pre-validate middleware to check discounted price
CoinPackageSchema.pre("validate", function (next) {
    if (this.discountedPrice > this.basePrice) {
        this.invalidate("discountedPrice", "Discounted price cannot be greater than base price");
    }
    next();
});

// Pre-save middleware to calculate discountPercentage and pricePerCoin
CoinPackageSchema.pre("save", function (next) {
    if (this.basePrice > 0 && this.discountedPrice > 0) {
        const discount = this.basePrice - this.discountedPrice;
        this.discountPercentage = parseFloat(((discount / this.basePrice) * 100).toFixed(2));
    } else {
        this.discountPercentage = 0;
    }

    if (this.amount > 0 && this.discountedPrice > 0) {
        this.pricePerCoin = parseFloat((this.discountedPrice / this.amount).toFixed(2));
    } else {
        this.pricePerCoin = 0;
    }

    next();
});

// Pre-update middleware for findOneAndUpdate
CoinPackageSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate() as any;
    const doc = await this.model.findOne(this.getQuery());

    if (doc) {
        const basePrice = update.basePrice ?? doc.basePrice;
        const discountedPrice = update.discountedPrice ?? doc.discountedPrice;
        const amount = update.amount ?? doc.amount;

        // Validate discounted price
        if (discountedPrice > basePrice) {
            const error = new Error("Discounted price cannot be greater than base price");
            return next(error);
        }

        let discountPercentage = 0;
        let pricePerCoin = 0;

        if (basePrice > 0 && discountedPrice > 0) {
            const discount = basePrice - discountedPrice;
            discountPercentage = parseFloat(((discount / basePrice) * 100).toFixed(2));
        }

        if (amount > 0 && discountedPrice > 0) {
            pricePerCoin = parseFloat((discountedPrice / amount).toFixed(2));
        }

        update.discountPercentage = discountPercentage;
        update.pricePerCoin = pricePerCoin;
    }
    next();
});

CoinPackageSchema.index({ isActive: 1, amount: 1 });
CoinPackageSchema.index({ discountPercentage: -1 });
CoinPackageSchema.index({ pricePerCoin: 1 });

export const CoinPackage = model<TCoinPackage>("CoinPackage", CoinPackageSchema);