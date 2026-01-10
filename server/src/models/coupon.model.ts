import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "./user.model";

// Create လုပ်တဲ့အခါ သုံးမယ့် Pure Data interface
export interface ICreateCouponInput {
    code: string;
    discountType: 'fixed' | 'percent';
    discountAmount: number;
    maxDiscountAmount?: number;
    minOrderAmount?: number;
    expiryDate: Date;
    usageLimit?: number;
    usageLimitPerUser?: number;
    isActive?: boolean;
}

export interface ICoupon extends Document {
    _id: mongoose.Types.ObjectId;
    code: string;
    discountType: 'fixed' | 'percent';
    discountAmount: number;
    maxDiscountAmount?: number;
    minOrderAmount: number;
    expiryDate: Date;
    usageLimit: number;
    usageLimitPerUser: number; // user တစ်ဦးချင်းစီ အတွက် အသုံးပြုနိုင်မည့် အကြိမ်ရေ
    usedCount: number;
    usersUsed: mongoose.Types.ObjectId[] | IUser[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    // Method to check if the coupon is expired
    isValid(userId: string, orderAmount: number): boolean;
};

const CouponSchema = new Schema<ICoupon>(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            uppercase: true, // code ကို အမြဲတမ်း အက္ခရာအကြီးဖြင့် သိမ်းဆည်းရန်
            trim: true,
            index: true // အမြန်ရှာဖွေနိုင်ရန် index ထည့်ထားသည်
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
            default: 100,
        },
        usageLimitPerUser: {
            type: Number,
            default: 1, // Default to one-time use per customer
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

// --- Compound Indexing ---
// အသုံးပြုသူက code ရိုက်ထည့်လိုက်တဲ့အခါ Active ဖြစ်မဖြစ်နဲ့ Expire ဖြစ်မဖြစ်ကို 
// တစ်ခါတည်း database level မှာ အမြန်ဆုံးရှာနိုင်အောင် index ပေးထားခြင်းဖြစ်ပါတယ်။
CouponSchema.index({ code: 1, isActive: 1, expiryDate: 1 });

CouponSchema.methods.isValid = function (userId: string, orderAmount: number): boolean {
    const now = Date.now();

    if(!this.isActive) return false;

    if(now > this.expiryDate) return false;

    // Check Minimum Order Amount
    if(orderAmount < this.minOrderAmount) return false;

    if(this.usedCount >= this.usageLimit) return false;

    const userUsageCount = this.usersUsed.filter(
        (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()).length;

    if(userUsageCount >= this.usageLimitPerUser) return false;

    return true;
};

const Coupon: Model<ICoupon> = mongoose.model<ICoupon>('Coupon', CouponSchema);
export default Coupon;