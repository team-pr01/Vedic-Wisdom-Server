"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinPackage = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const CoinPackageSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true
});
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
    }
    else {
        this.discountPercentage = 0;
    }
    if (this.amount > 0 && this.discountedPrice > 0) {
        this.pricePerCoin = parseFloat((this.discountedPrice / this.amount).toFixed(2));
    }
    else {
        this.pricePerCoin = 0;
    }
    next();
});
// Pre-update middleware for findOneAndUpdate
CoinPackageSchema.pre("findOneAndUpdate", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const update = this.getUpdate();
        const doc = yield this.model.findOne(this.getQuery());
        if (doc) {
            const basePrice = (_a = update.basePrice) !== null && _a !== void 0 ? _a : doc.basePrice;
            const discountedPrice = (_b = update.discountedPrice) !== null && _b !== void 0 ? _b : doc.discountedPrice;
            const amount = (_c = update.amount) !== null && _c !== void 0 ? _c : doc.amount;
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
});
CoinPackageSchema.index({ isActive: 1, amount: 1 });
CoinPackageSchema.index({ discountPercentage: -1 });
CoinPackageSchema.index({ pricePerCoin: 1 });
exports.CoinPackage = (0, mongoose_1.model)("CoinPackage", CoinPackageSchema);
