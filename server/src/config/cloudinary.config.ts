import dotenv from 'dotenv';
import streamifier from 'streamifier';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @desc Uploading Images to Cloudinary via Buffer (Upload Helper)
 * @param buffer - File Buffer from Multer
 * @param folder - Folder name in Cloudinary
 */
export const uploadToCloudinary = (buffer: Buffer, folder: string = 'products'): Promise<{ public_id: string; url: string }> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `laptopverse/${folder}`, // Folder structure
                resource_type: 'image',
            },
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
 * @desc Deleting Images from Cloudinary (Delete Helper - for Update/Delete product)
 */
export const deleteFromCloudinary = async(public_id: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
};
