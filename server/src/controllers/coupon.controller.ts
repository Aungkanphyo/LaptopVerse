import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as couponService from "../services/coupon.service";
import { APIFeatures } from "../utils/apiFeatures.utils";
import Coupon from "../models/coupon.model";

/**
 * @desc Create new coupon (Admin Only)
 */
export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.createCoupon(req.body, req.userId as string);

    res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        data: coupon
    });
});

/**
 * @desc Get all coupons with Advanced Filtering (Admin Only)
 */
export const getAllCoupons = asyncHandler(async (req: Request, res: Response) => {
    const features = new APIFeatures(Coupon.find(), req.query)
        .search(['code'])
        .filter()
        .sort()
        .paginate();

    const coupons = await features.query;
    const total = await Coupon.countDocuments();

    res.status(200).json({
        success: true,
        count: coupons.length,
        total,
        data: coupons
    });
});

/**
 * @desc update coupon details (Admin Only)
*/
export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.updateCoupon(req.params.id, req.body, req.userId as string);
    
    res.status(200).json({
        success: true,
        message: "Coupon updated successfully",
        data: coupon
    });
});

/**
 * @desc delete coupon (Admin Only)
*/
export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
    await couponService.deleteCoupon(req.params.id, req.userId as string);

    res.status(200).json({
        success: true,
        message: "Coupon deleted successfully"
    });
});