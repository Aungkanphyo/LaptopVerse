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