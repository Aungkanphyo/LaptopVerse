import mongoose, { Model, Schema } from "mongoose";
import { string } from "zod";

export interface ICoupon extends Document {
    code: string;
    discountType: 'fixed' | 'percent';
    discountAmount: number;
    maxDiscountAmount?: number;
    minOrderAmount: number;
    expiryDate: Date;
    usageLimit: number;
    usedCount: number;
    usersUsed: mongoose.Types.ObjectId[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

const CouponSchema = new Schema<ICoupon>(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            uppercase: true, // code ကို အမြဲတမ်း အက္ခရာအကြီးဖြင့် သိမ်းဆည်းရန်
            trim: true
        },
        discountType: {
            type: String,
            enum: ['fixed', 'percent'],
            required: true,
        },
        discountAmount: {
            type: Number,
            required: [true, "Discount amount is required"],
            min: [0, "Discount cannot be negative"],
        },
        maxDiscountAmount: {
            type: Number, // percent discount အတွက်သာ လိုအပ်သည်
            default: 0,
        },
        minOrderAmount: {
            type: Number,
            default: 0,
        },
        expiryDate: {
            type: Date,
            required: [true, "Expiry date is required"],
        },
        usageLimit: {
            type: Number,
            default: 1, // coupon ကို အသုံးပြုနိုင်မည့် အကြိမ်ရေ
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        usersUsed: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

CouponSchema.methods.isExpired = function (): boolean {
    return Date.now() > this.expiryDate.getTime();
};

const Coupon: Model<ICoupon> = mongoose.model<ICoupon>('Coupon', CouponSchema);
export default Coupon;