"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
// 1. Parse the JSON string
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountString) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not set in .env");
}
const serviceAccount = JSON.parse(serviceAccountString);
// 2. CRITICAL FIX: Replace the literal \n characters with actual line breaks.
// Without this, Firebase will throw "Invalid PEM formatted message"
if (serviceAccount.privateKey) {
    serviceAccount.privateKey = serviceAccount.privateKey.replace(/\\n/g, '\n');
}
// 3. Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
exports.default = admin;
