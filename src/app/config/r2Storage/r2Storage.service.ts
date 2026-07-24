import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';
import { r2Config, validateR2Config } from "./r2Storage.config";

// Validate config on startup
validateR2Config();

// Initialize S3 Client
const s3Client = new S3Client({
    region: r2Config.region,
    endpoint: r2Config.endpoint,
    credentials: {
        accessKeyId: r2Config.accessKeyId,
        secretAccessKey: r2Config.secretAccessKey,
    },
    forcePathStyle: true,
});

export class R2StorageService {
    /**
     * Uploads an audio file to R2
     */
    static async uploadAudio(
        fileBuffer: Buffer,
        originalName: string,
        mimetype: string,
        uploadPath: string
    ): Promise<{ url: string; key: string }> {
        const extension = originalName.split('.').pop() || 'mp3';
        const uniqueFilename = `${uuidv4()}.${extension}`;
        const key = `${uploadPath}/${uniqueFilename}`;

        const command = new PutObjectCommand({
            Bucket: r2Config.bucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: mimetype,
        });

        try {
            await s3Client.send(command);
            return {
                url: `${r2Config.publicUrl}/${key}`,
                key: key
            };
        } catch (error) {
            console.error("Error uploading to R2:", error);
            throw new Error("Could not upload audio file.");
        }
    }

    /**
     * Generates a presigned URL for secure playback
     */
    static async getSignedPlaybackUrl(
        key: string,
        expiresInSeconds: number = 3600
    ): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: r2Config.bucketName,
            Key: key,
        });

        try {
            return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
        } catch (error) {
            console.error("Error generating signed URL:", error);
            throw new Error("Could not generate download URL.");
        }
    }

    /**
     * Deletes an audio file from R2
     */
    static async deleteAudio(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: r2Config.bucketName,
            Key: key,
        });

        try {
            await s3Client.send(command);
        } catch (error) {
            console.error("Error deleting from R2:", error);
            throw new Error("Could not delete audio file.");
        }
    }

    /**
     * Checks if a file exists in R2
     */
    static async fileExists(key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: r2Config.bucketName,
                Key: key,
            });
            await s3Client.send(command);
            return true;
        } catch (error) {
            return false;
        }
    }
}