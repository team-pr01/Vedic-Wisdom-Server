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
exports.R2StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const r2Storage_config_1 = require("./r2Storage.config");
// Validate config on startup
(0, r2Storage_config_1.validateR2Config)();
// Initialize S3 Client
const s3Client = new client_s3_1.S3Client({
    region: r2Storage_config_1.r2Config.region,
    endpoint: r2Storage_config_1.r2Config.endpoint,
    credentials: {
        accessKeyId: r2Storage_config_1.r2Config.accessKeyId,
        secretAccessKey: r2Storage_config_1.r2Config.secretAccessKey,
    },
    forcePathStyle: true,
});
class R2StorageService {
    /**
     * Uploads an audio file to R2
     */
    static uploadAudio(fileBuffer, originalName, mimetype, uploadPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const extension = originalName.split('.').pop() || 'mp3';
            const uniqueFilename = `${(0, uuid_1.v4)()}.${extension}`;
            const key = `${uploadPath}/${uniqueFilename}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: r2Storage_config_1.r2Config.bucketName,
                Key: key,
                Body: fileBuffer,
                ContentType: mimetype,
            });
            try {
                yield s3Client.send(command);
                return {
                    url: `${r2Storage_config_1.r2Config.publicUrl}/${key}`,
                    key: key
                };
            }
            catch (error) {
                console.error("Error uploading to R2:", error);
                throw new Error("Could not upload audio file.");
            }
        });
    }
    /**
     * Generates a presigned URL for secure playback
     */
    static getSignedPlaybackUrl(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, expiresInSeconds = 3600) {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: r2Storage_config_1.r2Config.bucketName,
                Key: key,
            });
            try {
                return yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: expiresInSeconds });
            }
            catch (error) {
                console.error("Error generating signed URL:", error);
                throw new Error("Could not generate download URL.");
            }
        });
    }
    /**
     * Deletes an audio file from R2
     */
    static deleteAudio(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: r2Storage_config_1.r2Config.bucketName,
                Key: key,
            });
            try {
                yield s3Client.send(command);
            }
            catch (error) {
                console.error("Error deleting from R2:", error);
                throw new Error("Could not delete audio file.");
            }
        });
    }
    /**
     * Checks if a file exists in R2
     */
    static fileExists(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new client_s3_1.HeadObjectCommand({
                    Bucket: r2Storage_config_1.r2Config.bucketName,
                    Key: key,
                });
                yield s3Client.send(command);
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
}
exports.R2StorageService = R2StorageService;
