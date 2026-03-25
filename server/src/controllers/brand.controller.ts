import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Brand from "../models/brand.model";
import { AppError } from "../utils/error.utils";

/**
 * @desc    Create new brand
 * @route   POST /api/v1/admin/brands
 * @access  Private (Admin)
 */
export const createBrand = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, logoUrl } = req.body;

    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
        return next(new AppError('Brand with this name already exists', 400));
    }

    const brand = await Brand.create({
        name,
        description,
        logoUrl,
        user: req.userId
    });

    res.status(201).json({
        success: true,
        message: 'Brand created successfully',
        brand
    });
});

/**
 * @desc    Get all active brands
 * @route   GET /api/v1/brands
 * @access  Public
 */
export const getBrands = asyncHandler(async (req: Request, res: Response) => {
    const brands = await Brand.find({ isActive: true })
        .select('name slug description logoUrl')
        .sort({ name: 1 }) // Sort alphabetically
        .lean(); // Lean() is used for performance

    res.status(200).json({
        success: true,
        count: brands.length,
        brands
    });
});