import dotenv from 'dotenv';
import streamifier from 'streamifier';
import { v2 as cloudinary, TransformationOptions } from 'cloudinary';

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface ICloudinaryUploadOptions {
    transformation?: TransformationOptions | TransformationOptions[];
}

/**
 * @desc Generic Cloudinary Buffer Upload Helper (Supports Products, Avatars, etc.)
 * @param buffer - File Buffer from Multer
 * @param folder - Folder name under 'laptopverse/' (default: 'products')
 * @param options - Optional Cloudinary upload options (e.g., transformations)
 */
export const uploadToCloudinary = (
    buffer: Buffer, 
    folder: string = 'products',
    options?: ICloudinaryUploadOptions
): Promise<{ public_id: string; url: string }> => {
    return new Promise((resolve, reject) => {
        const uploadParams: Record<string, any> = {
            folder: `laptopverse/${folder}`,
            resource_type: 'image',
        };

        // Will only be included with custom transformation (for use exclusively with Avatars)
        if (options?.transformation) {
            uploadParams.transformation = options.transformation;
        }
        const uploadStream = cloudinary.uploader.upload_stream(
            uploadParams,
            (error, result) => {
                if (error) return reject(error);
                if (result) {
                    resolve({
                        public_id: result.public_id,
                        url: result.secure_url,
                    });
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    })
};

/**
 * @desc Deleting Images from Cloudinary Helper
 * @param public_id - Cloudinary Public ID of the image
 */
export const deleteFromCloudinary = async(public_id: string): Promise<void> => {
    if (!public_id) return;
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
};
