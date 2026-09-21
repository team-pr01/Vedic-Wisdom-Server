import config from "..";

export type TR2Config = {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    endpoint: string;
    region: string;
    publicUrl: string;
}
export const r2Config: TR2Config = {
    accountId: config.cloudflare_account_id!,
    accessKeyId: config.r2_access_key_id!,
    secretAccessKey: config.r2_secret_access_key!,
    bucketName: config.r2_bucket_name!,
    endpoint: `https://${config.cloudflare_account_id}.r2.cloudflarestorage.com`,
    region: "auto" as const,
    publicUrl: config.r2_public_url!,
};

// Validate configuration
export const validateR2Config = (): void => {
    const requiredKeys = ['accountId', 'accessKeyId', 'secretAccessKey', 'bucketName', 'publicUrl'];
    const missingKeys = requiredKeys.filter(key => !r2Config[key as keyof typeof r2Config]);

    if (missingKeys.length > 0) {
        throw new Error(`Missing R2 configuration: ${missingKeys.join(', ')}`);
    }
};