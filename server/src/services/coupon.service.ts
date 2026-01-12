import Coupon, { ICreateCouponInput } from "../models/coupon.model";
import { AppError } from "../utils/error.utils";
import { createLog } from "./logger.service";
import { ICoupon } from '../models/coupon.model';
import mongoose from "mongoose";
import { withTransaction } from "../utils/transaction.util";

export const createCoupon = async (couponData: ICreateCouponInput, adminId: string): Promise<ICoupon> => {
    return await withTransaction(async (session) => {
        const normalizedCode = couponData.code.trim().toUpperCase();
        const existingCoupon = await Coupon.findOne({ code: normalizedCode }).session(session);

        if(existingCoupon) {
            throw new AppError("Coupon code already exists", 400);
        }

        const coupon = new Coupon({
            ...couponData,
            code: normalizedCode
        });
        await coupon.save({ session });

        await createLog({
            admin: adminId,
            action: "CREATE_COUPON",
            resource: "Coupon",
            resourceId: coupon._id.toString(),
            details: { code: coupon.code, discountType: coupon.discountType }
        }, session);

        return coupon;
    });
};

export const validateCoupon = async (code: string, userId: string, orderAmount: number) => {
    const normalizedCode = code.toUpperCase();

    const coupon = await Coupon.findOne({
        code: normalizedCode,
        isActive: true,
        expiryDate: {  $gte: new Date() },
        $expr: { $lt: ["$usedCount", "$usageLimit"] }
    });

    if (!coupon) {
        throw new AppError("Invalid, expired or inactive coupon code", 404);
    }

    if(!coupon.isValid(userId, orderAmount)) {
        throw new AppError("Coupon conditions not met", 400);
    };

    return coupon;
};

export const applyCouponUsage = async (couponId: string, userId: string) => {
    return await withTransaction(async (session) => {
        const coupon = await Coupon.findOneAndUpdate(
            {
                _id: couponId,
                isActive: true,
                expr: { $lt: ["$usedCount", "$usageLimit"] }
            },
            {
                $inc: { usedCount: 1 },
                $push: { usersUsed: userId }
            },
            { new: true, session }
        );

        if(!coupon) {
            throw new AppError("Coupon usage limit reached or deactivated", 404);
        }

        await createLog({
            admin: userId,
            action: "APPLY_COUPON",
            resource: "Coupon",
            resourceId: couponId,
            details: { code: coupon.code }
        }, session);

        return coupon;
    });
};