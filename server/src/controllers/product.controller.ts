// Admin/Manager Controller Functions
import mongoose from 'mongoose';
import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Product from "../models/product.model";
import { AppError } from "../utils/error.utils";
import { deleteFromCloudinary, uploadToCloudinary } from '../config/cloudinary.config';
import { APIFeatures } from '../utils/apiFeatures.utils';

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

    // Type Casting for Number fields
    const numericPrice = parseFloat(price);
    const numericStock = parseInt(stock, 10);
    const numericScreenSize = parseFloat(screenSize);

    if (isNaN(numericPrice) || isNaN(numericStock) || isNaN(numericScreenSize)) {
        return next(new AppError('Price, Stock, and Screen Size must be valid numbers.', 400));
    }

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
        name, description, 
        price: numericPrice, // Casted value
        category, brand, 
        stock: numericStock, // Casted value
        processor, ram, storage, 
        screenSize: numericScreenSize, // Casted value
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

    let currentImages = [...product.images];

    if(req.body.imagesToDelete) {
        const imagesToDelete = Array.isArray(req.body.imagesToDelete) 
            ? req.body.imagesToDelete 
            : [req.body.imagesToDelete];

        const deletePromises = imagesToDelete.map((public_id: string) => deleteFromCloudinary(public_id));
        await Promise.all(deletePromises);

        currentImages = currentImages.filter(img => !imagesToDelete.includes(img.public_id));
    };

    if(req.files && Array.isArray(req.files) && req.files.length > 0) {
        const files = req.files as Express.Multer.File[];
        const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, 'products'));
        const newImages = await Promise.all(uploadPromises);

        currentImages = [...currentImages, ...newImages];
    }

    const dataToUpdate = {
        ...req.body,
        images: currentImages // Updated image list
    };

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(productId, dataToUpdate, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        product: updatedProduct,
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

    if(product.images && product.images.length > 0) {
        const deletePromises = product.images.map(image => deleteFromCloudinary(image.public_id));
        await Promise.all(deletePromises);
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
    /**
     * Initialize APIFeatures
     * Pass to APIFeatures class along with req.query
    */
    const features = new APIFeatures(Product.find(), req.query)
        .search()   // ?keyword=macbook
        .filter()   // ?category=gaming&price[gte]=1000

    const countQuery = features.query.clone(); 
    const totalDocs = await countQuery.countDocuments();

    const products = await features.sort().paginate().query;

    res.status(200).json({
        success: true,
        count: products.length, // လက်ရှိ page မှာ ပါတဲ့ အရေအတွက်
        total: totalDocs,       // Database တစ်ခုလုံးမှာရှိတဲ့ အရေအတွက်
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

/**
 * @desc Create or Update Product Review
 * @route PUT /api/v1/products/review
 * @access Private (User)
 */
export const createProductReview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: new mongoose.Types.ObjectId(req.userId),
        name: req.user?.fullName || 'Anonymous User', // req.user from protect middleware
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.userId?.toString()
    );

    if (isReviewed) {
        // Update existing review
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.userId?.toString()) {
                rev.rating = rating;
                rev.comment = comment;
            }
        });
    } else {
        // Add new review
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });
    product.ratings = avg / product.reviews.length;
    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Review added successfully.',
    });
});

/**
 * @desc Get All Reviews of a Single Product
 * @route GET /api/v1/products/reviews
 * @access Public
 */
export const getProductReviews = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.query.id as string;
    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

/**
 * @desc Delete Review
 * @route DELETE /api/v1/products/reviews
 * @access Private (User/Admin)
 */
export const deleteReview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.query.productId as string;
    const reviewId = req.query.id as string; // Review ID to delete
    const currentUserId = req.userId?.toString();

    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    const reviewToDelete = product.reviews.find(
        (rev) => rev._id?.toString() === reviewId.toString()
    );

    if (!reviewToDelete) {
        return next(new AppError('Review not found or already deleted', 404));
    };

    if (reviewToDelete.user.toString() !== currentUserId) {
        return next(
            new AppError('You are not authorized to delete this review. Only the review owner can delete it.', 403)
        );
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id?.toString() !== reviewId.toString()
    );

    // Recalculate Rating
    let avg = 0;
    let ratings = 0;

    if (reviews.length > 0) {
        reviews.forEach((rev) => {
            avg += rev.rating;
        });
        ratings = avg / reviews.length;
    }
    const numOfReviews = reviews.length;

    // Update product directly
    await Product.findByIdAndUpdate(
        productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        success: true,
        message: 'Review deleted successfully.',
    });
});