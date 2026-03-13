import { v2 as cloudinary } from "cloudinary";

export const uploadAudioToCloudinary = async (
  filePath: string,
  publicId: string
) => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    public_id: publicId,
    folder: "audiobooks",
    format: "mp3"
  });

  return result;
};