import { NextFunction, Request, Response } from "express";
import Guide from "../models/guide.model";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/error.utils";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary.config";
import mongoose from "mongoose";

export const getPublishedGuides = asyncHandler(async (req: Request, res: Response) => {
    const guides = await Guide.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: guides.length, guides });
});

export const getGuideBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const guide = await Guide.findOne({ slug: req.params.slug, isPublished: true });
    if (!guide) return next(new AppError("Guide not found", 404));
    res.status(200).json({ success: true, guide });
});

export const getGuideByIdAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid Guide ID format", 400));
    }
    const guide = await Guide.findById(id)
        .select("title summary content category readTime image isPublished createdAt")
        .lean();
    if (!guide) {
        return next(new AppError("Guide not found", 404));
    }
    res.status(200).json({
        success: true,
        guide,
    });
});

export const getAllGuidesAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { status, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 10);
    const skip = (pageNum - 1) * limitNum;
    const filter: Record<string, any> = {};
    if (status === "published") {
        filter.isPublished = true;
    } else if (status === "drafts" || status === "draft") {
        filter.isPublished = false;
    }
    const total = await Guide.countDocuments(filter);
    const guides = await Guide.find(filter)
        .select("-content")        // Projection: remove Large Text Field
        .sort({ createdAt: -1 })   // use Compound Index ({ isPublished: 1, createdAt: -1 })
        .skip(skip)                // Pagination Offset
        .limit(limitNum)           // Pagination Limit
        .lean();
    res.status(200).json({
        success: true,
        count: guides.length,
        pagination: {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            limit: limitNum,
        },
        guides,
    });
});

export const createGuide = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body || {};
    let imageData;
    if (req.file) {
        imageData = await uploadToCloudinary(req.file.buffer, "guides");
    }
    const guide = await Guide.create({
        ...req.body,
        isPublished: req.body.isPublished === "true" || req.body.isPublished === true,
        image: imageData,
        user: req.userId,
    });
    res.status(201).json({ success: true, message: "Guide created successfully", guide });
});

export const updateGuide = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body || {};
    const guide = await Guide.findById(req.params.id);
    if (!guide) return next(new AppError("Guide not found", 404));
    const oldPublicId = guide.image?.public_id;
    let isImageChanged = false;
    if (req.file) {
        guide.image = await uploadToCloudinary(req.file.buffer, "guides");
        isImageChanged = true;
    } else if (body.removeImage === "true") {
        guide.image = undefined;
        isImageChanged = true;
    }
    const updateableFields = ["title", "category", "readTime", "summary", "content"] as const;
    updateableFields.forEach((field) => {
        if (body[field] !== undefined) {
            (guide as any)[field] = body[field];
        }
    });
    if (body.isPublished !== undefined) {
        guide.isPublished = String(body.isPublished) === "true";
    }
    const updatedGuide = await guide.save();
    if (isImageChanged && oldPublicId) {
        deleteFromCloudinary(oldPublicId).catch((err) => {
            console.error(`Cloudinary deletion failed for ID: ${oldPublicId}`, err);
        });
    }
    res.status(200).json({
        success: true,
        message: "Guide updated successfully",
        guide: updatedGuide
    });
});

export const deleteGuide = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const guide = await Guide.findByIdAndDelete(req.params.id);
    if (!guide) return next(new AppError("Guide not found", 404));
    if (guide.image?.public_id) {
        await deleteFromCloudinary(guide.image.public_id);
    }
    res.status(200).json({ success: true, message: "Guide deleted successfully" });
});