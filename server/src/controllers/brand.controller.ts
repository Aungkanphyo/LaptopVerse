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

/**
 * @desc    Get all brands for Admin (Includes inactive brands)
 * @route   GET /api/v1/admin/brands
 * @access  Private (Admin)
 */
export const getAllBrandsAdmin = asyncHandler(async (req: Request, res: Response) => {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: brands.length, brands });
});

/**
 * @desc    Update Brand name/description
 * @route   PUT /api/v1/admin/brands/:id
 * @access  Private (Admin)
 */
export const updateBrand = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, logoUrl } = req.body;
    let brand = await Brand.findById(req.params.id);

    if (!brand) return next(new AppError('Brand not found', 404));

    brand.name = name || brand.name;
    if (description !== undefined) brand.description = description;
    if (logoUrl !== undefined) brand.logoUrl = logoUrl;

    await brand.save(); // The pre('save') hook will automatically fix the slug

    res.status(200).json({ success: true, message: 'Brand updated successfully', brand });
});

/**
 * @desc    Toggle Brand Active status (Soft Delete)
 * @route   PATCH /api/v1/admin/brands/:id/toggle-status
 * @access  Private (Admin)
 */
export const toggleBrandStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return next(new AppError('Brand not found', 404));

    brand.isActive = !brand.isActive; // Toggle status (true <-> false)
    await brand.save();

    res.status(200).json({
        success: true,
        message: `Brand ${brand.isActive ? 'activated' : 'deactivated'} successfully`,
        brand
    });
});