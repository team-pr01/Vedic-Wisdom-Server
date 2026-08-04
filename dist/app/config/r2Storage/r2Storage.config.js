"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateR2Config = exports.r2Config = void 0;
const __1 = __importDefault(require(".."));
exports.r2Config = {
    accountId: __1.default.cloudflare_account_id,
    accessKeyId: __1.default.r2_access_key_id,
    secretAccessKey: __1.default.r2_secret_access_key,
    bucketName: __1.default.r2_bucket_name,
    endpoint: `https://${__1.default.cloudflare_account_id}.r2.cloudflarestorage.com`,
    region: "auto",
    publicUrl: __1.default.r2_public_url,
};
// Validate configuration
const validateR2Config = () => {
    const requiredKeys = ['accountId', 'accessKeyId', 'secretAccessKey', 'bucketName', 'publicUrl'];
    const missingKeys = requiredKeys.filter(key => !exports.r2Config[key]);
    if (missingKeys.length > 0) {
        throw new Error(`Missing R2 configuration: ${missingKeys.join(', ')}`);
    }
};
exports.validateR2Config = validateR2Config;
