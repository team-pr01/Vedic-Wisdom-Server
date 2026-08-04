"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = {
    port: process.env.PORT,
    db_url: process.env.DB_URL,
    bcrypt_salt_round: process.env.BCRYPT_SALT_ROUND,
    node_env: process.env.NODE_ENV,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SCERET,
    reset_password_ui_url: process.env.RESET_PASSWORD_UI_URL,
    smtp_email: process.env.SMTP_EMAIL,
    smtp_pass: process.env.SMTP_PASS,
    frontend_url: process.env.FRONTEND_URL,
    backend_url: process.env.BACKEND_URL,
    chat_gpt_api: process.env.chat_gpt_api,
    cloudflare_account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
    r2_access_key_id: process.env.R2_ACCESS_KEY_ID,
    r2_secret_access_key: process.env.R2_SECRET_ACCESS_KEY,
    r2_bucket_name: process.env.R2_BUCKET_NAME,
    r2_public_url: process.env.R2_PUBLIC_URL,
    store_id: process.env.STORE_ID,
    store_passwd: process.env.STORE_PASS,
};
