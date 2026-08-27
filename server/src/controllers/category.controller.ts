import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Category from "../models/category.model";
import { AppError } from "../utils/error.utils";

/**
 * @desc    Create new category
 * @route   POST /api/v1/admin/categories
 * @access  Private (Admin)
 */
export const createCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ name });
    if(existingCategory) {
        return next(new AppError('Category with this name already exists', 400));
    }

    const category = await Category.create({
        name,
        description,
        user: req.userId
    });

    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category
    });
});

/**
 * @desc    Get all active categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await Category.find({ isActive: true })
        .select('name slug description')
        .sort({ name: 1 }) // Sort alphabetically
        .lean(); // Lean() is used for performance

    res.status(200).json({
        success: true,
        count: categories.length,
        categories
    });
});

/**
 * @desc    Get all categories for Admin (Includes inactive)
 * @route   GET /api/v1/admin/categories
 * @access  Private (Admin)
 */
export const getAllCategoriesAdmin = asyncHandler(async (req: Request, res: Response) => {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: categories.length, categories });
});

/**
 * @desc    Update Category
 * @route   PUT /api/v1/admin/categories/:id
 * @access  Private (Admin)
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description } = req.body;
    let category = await Category.findById(req.params.id);

    if (!category) return next(new AppError('Category not found', 404));

    category.name = name || category.name;
    if (description !== undefined) category.description = description;

    await category.save();

    res.status(200).json({ success: true, message: 'Category updated successfully', category });
});

/**
 * @desc    Toggle Category Active Status (Soft Delete)
 * @route   PATCH /api/v1/admin/categories/:id/toggle-status
 * @access  Private (Admin)
 */
export const toggleCategoryStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new AppError('Category not found', 404));

    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
        success: true,
        message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
        category
    });
});