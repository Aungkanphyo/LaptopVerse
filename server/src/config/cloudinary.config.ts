import dotenv from 'dotenv';
import streamifier from 'streamifier';
import { v2 as cloudinary, TransformationOptions, UploadApiResponse } from 'cloudinary';

dotenv.config();

// 1. Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Mandatory setting to output all URLs as HTTPS (secure_url) across the entire Cloudinary SDK
});

export interface ICloudinaryUploadOptions {
    transformation?: TransformationOptions | TransformationOptions[];
}

export interface ICloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    url: string;
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
): Promise<ICloudinaryUploadResult> => {
    return new Promise((resolve, reject) => {
        if (!buffer || buffer.length === 0) {
            return reject(new Error('Invalid or empty buffer provided for Cloudinary upload.'));
        }

        const uploadParams: Record<string, any> = {
            folder: `laptopverse/${folder}`,
            resource_type: 'image',
        };

        if (options?.transformation) {
            uploadParams.transformation = options.transformation;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadParams,
            (error, result: UploadApiResponse | undefined) => {
                if (error) return reject(error);
                
                if (!result) {
                    return reject(new Error('Cloudinary upload failed: No result returned.'));
                }

                resolve({
                    public_id: result.public_id,
                    secure_url: result.secure_url, // HTTPS URL
                    url: result.secure_url,
                });
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

/**
 * @desc Deleting Images from Cloudinary Helper
 * @param public_id - Cloudinary Public ID of the image
 */
export const deleteFromCloudinary = async (public_id: string): Promise<boolean> => {
    if (!public_id) return false;
    
    try {
        const response = await cloudinary.uploader.destroy(public_id);
        return response.result === 'ok';
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        return false;
    }
};