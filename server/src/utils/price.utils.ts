import { ICoupon } from "../models/coupon.model";

/**
 * Calculate discount amount by coupon type
 */
export const calculateDiscount = (totalAmount: number, coupon: ICoupon): number => {
    let discount = 0;

    if (coupon.discountType === 'percent') {
        discount = (totalAmount * coupon.discountAmount) / 100;

        // Check if there is a Max Discount Cap.
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
        }
    } else {
        // Fixed amount discount
        discount = coupon.discountAmount;
    }

    // Safety Check to ensure that the discount does not exceed the total.
    return Math.min(discount, totalAmount);
}