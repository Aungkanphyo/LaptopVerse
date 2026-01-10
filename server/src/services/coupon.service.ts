import Coupon, { ICreateCouponInput } from "../models/coupon.model";
import { AppError } from "../utils/error.utils";
import { createLog } from "./logger.service";
import { ICoupon } from '../models/coupon.model';
import mongoose from "mongoose";

export const createCoupon = async (couponData: ICreateCouponInput, adminId: string): Promise<ICoupon> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const normalizedCode = couponData.code.trim().toUpperCase();
        const existingCoupon = await Coupon.findOne({ code: normalizedCode });

        if(existingCoupon) {
            throw new AppError("Coupon code already exists", 400);
        }

        const coupon = new Coupon({
            ...couponData,
            code: normalizedCode
        });
        await coupon.save();

        await createLog({
            admin: adminId,
            action: "CREATE_COUPON",
            resource: "Coupon",
            resourceId: coupon._id.toString(),
            details: { code: coupon.code, discountType: coupon.discountType }
        }, session);

        await session.commitTransaction();
        return coupon;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};