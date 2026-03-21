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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const userSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    profilePicture: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    countryCode: {
        type: String,
        required: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
    },
    area: {
        type: String,
        required: false,
        trim: true,
    },
    city: {
        type: String,
        required: false,
        trim: true,
    },
    state: {
        type: String,
        required: false,
        trim: true,
    },
    country: {
        type: String,
        required: false,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "admin", "moderator"],
        default: "user",
    },
    assignedPages: {
        type: [String],
        default: [],
    },
    expoPushToken: {
        type: String,
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    accountDeleteReason: {
        type: String,
        default: null,
    },
    isSuspended: {
        type: Boolean,
        default: false,
    },
    suspensionReason: {
        type: String,
        default: null,
    },
    resetPasswordOtp: {
        type: String,
        default: null,
    },
    resetPasswordOtpExpiresAt: {
        type: Date,
        default: null,
    },
    lastLoggedIn: {
        type: Date,
        default: null,
        required: false,
    },
    plan: {
        type: String,
        default: "free",
    },
    // Usage tracking for subscription
    usage: {
        aiChatDaily: { type: Number, default: 0 },
        aiRecipesMonthly: { type: Number, default: 0 },
        vastuAiMonthly: { type: Number, default: 0 },
        kundliMonthly: { type: Number, default: 0 },
        muhurtaMonthly: { type: Number, default: 0 },
        lastDailyReset: Date,
        lastMonthlyReset: Date,
    },
    referralCode: {
        type: String,
        unique: true,
        default: null,
    },
    referralCount: {
        type: Number,
        default: 0,
    },
    premiumUnlocked: {
        type: Boolean,
        default: false,
    },
    coins: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});
// Hash password before saving
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("password")) {
            this.password = yield bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_round));
        }
        next();
    });
});
// Hide password after saving
userSchema.post("save", function (doc, next) {
    doc.password = "";
    next();
});
// Static methods
userSchema.statics.isUserExists = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield this.findOne({ email }).select("+password");
    });
};
userSchema.statics.isPasswordMatched = function (plainTextPassword, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(plainTextPassword, hashedPassword);
    });
};
/* TEXT SEARCH INDEX */
userSchema.index({
    name: "text",
    email: "text",
    phoneNumber: "text",
    userId: "text",
});
/* FILTER INDEXES */
userSchema.index({ role: 1 });
userSchema.index({ country: 1 });
userSchema.index({ state: 1 });
userSchema.index({ city: 1 });
userSchema.index({ area: 1 });
userSchema.index({ premiumUnlocked: 1 });
/* SORT / PAGINATION */
userSchema.index({ createdAt: -1 });
// Export the model
exports.User = (0, mongoose_1.model)("User", userSchema);
