import { NextFunction, Request, Response } from "express";
import Guide from "../models/guide.model";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/error.utils";

export const getPublishedGuides = asyncHandler(async (req: Request, res: Response) => {
  const guides = await Guide.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, count: guides.length, guides });
});

export const getGuideBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const guide = await Guide.findOne({ slug: req.params.slug, isPublished: true });
  if (!guide) return next(new AppError("Guide not found", 404));
  res.status(200).json({ success: true, guide });
});

export const getAllGuidesAdmin = asyncHandler(async (req: Request, res: Response) => {
  const guides = await Guide.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: guides.length, guides });
});

export const createGuide = asyncHandler(async (req: Request, res: Response) => {
  const guide = await Guide.create({ ...req.body, user: req.userId });
  res.status(201).json({ success: true, message: "Guide created successfully", guide });
});

export const updateGuide = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const guide = await Guide.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!guide) return next(new AppError("Guide not found", 404));
  res.status(200).json({ success: true, message: "Guide updated successfully", guide });
});

export const deleteGuide = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const guide = await Guide.findByIdAndDelete(req.params.id);
  if (!guide) return next(new AppError("Guide not found", 404));
  res.status(200).json({ success: true, message: "Guide deleted successfully" });
});