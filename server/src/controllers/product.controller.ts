// Admin/Manager Controller Functions
import mongoose from 'mongoose';
import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Product from "../models/product.model";
import { AppError } from "../utils/error.utils";
import { uploadToCloudinary } from '../config/cloudinary.config';

/**
 * @desc Create new product
 * @route POST /api/v1/products/admin
 * @access Private (Admin, Manager)
 */
export const createNewProduct = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
    // Retrieve Data from Request Body
    const {
        name, description, price, category, brand, stock,
        processor, ram, storage, screenSize
    } = req.body;

    // Retrieve Admin ID from req.user (get from protect middleware)
    const userId = req.userId;

    if (!userId) return next(new AppError('Creator ID missing.', 500));

    // Images Handling (Multi-upload)
    let imageUrls: { public_id: string; url: string }[] = [];

    // req.files is an Array of Files (Received from Multer)
    if(req.files && Array.isArray(req.files)) {
        const files = req.files as Express.Multer.File[];

        // Loop through files and upload to Cloudinary concurrently
        const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, 'products'));

        // Wait for all uploads to finish
        imageUrls = await Promise.all(uploadPromises);
    }

    // Create Product
    const product = await Product.create({
        name, description, price, category, brand, stock, 
        processor, ram, storage, screenSize,
        user: userId, // Creator (Admin/Manager)
        images: imageUrls,  
    });

    res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        product,
    });
});

/**
 * @desc Update Product
 * @route PUT /api/v1/products/admin/:id
 * @access Private (Admin, Manager)
 */
export const updateProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;
    const updateData = req.body;

    // Search the product
    let product = await Product.findById(productId);

    if(!product) {
        return next(new AppError(`Product not found with ID: ${productId}`, 404));
    }

    // Update the product
    product = await Product.findByIdAndUpdate(productId, updateData, {
        new: true, // Return the updated document
        runValidators: true, // Run Mongoose Schema Validators
    });

    res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        product,
    });
});

/**
 * @desc Delete Product
 * @route DELETE /api/v1/products/admin/:id
 * @access Private (Admin, Manager)
 */
export const deleteProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError(`Product not found with ID: ${productId}`, 404));
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully.',
    });
});

// Public Controller Functions
/**
 * @desc View all product (Filter, Search, Pagination ပါဝင်မည်)
 * @route GET /api/v1/products
 * @access Public
 */
export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    const products = await Product.find().select('-reviews');
    const count = await Product.countDocuments();

    res.status(200).json({
        success: true,
        count,
        products,
    });
});

/**
 * @desc Viewing a single product
 * @route GET /api/v1/products/:id
 * @access Public
 */
export const getSingleProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;

    const product = await Product.findById(productId).select('+reviews'); // show with reviews

    if (!product) {
        return next(new AppError(`Product not found with ID: ${productId}`, 404));
    }

    res.status(200).json({
        success: true,
        product,
    });
});