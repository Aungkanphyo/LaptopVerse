import { ICoupon } from "../models/coupon.model";
import Order from "../models/order.model";
import Product from "../models/product.model";
import { AppError } from "../utils/error.utils";
import { calculateDiscount } from "../utils/price.utils";
import { withTransaction } from "../utils/transaction.util";
import * as couponService from "./coupon.service";

export const createOrder = async (orderData: any, userId: string) => {
    return await withTransaction(async (session) => {
        const { items, couponCode } = orderData;
        let totalAmount = 0;
        let discountAmount = 0;
        let appliedCoupon: ICoupon | null = null;

        // Loop through all items and check (Stock & Total Price)
        for (const item of items) {
            const product = await Product.findById(item.productId).session(session);
            if (!product) throw new AppError(`Product ${item.product} not found`, 404);

            if (product.stock < item.quantity) {
                throw new AppError(`Insufficient stock for ${product.name}`, 400);
            }

            // Atomically subtracting stock
            product.stock -= item.quantity;
            await product.save({ session });

            totalAmount += product.price * item.quantity;
        }

        // Coupon Logic (if there is a code)
        if (couponCode) {
            // Valid check
            appliedCoupon = await couponService.validateCoupon(couponCode, userId, totalAmount);
            
            // Calculate Discount
            discountAmount = calculateDiscount(totalAmount, appliedCoupon);

            // Updating Coupon Usage (Session must be sent for Race Condition)
            await couponService.applyCouponUsage(appliedCoupon._id.toString(), userId, session);
        }

        const finalAmount = totalAmount - discountAmount;

        // Create order record
        const order = new Order({
            user: userId,
            items,
            totalAmount,
            discountAmount,
            finalAmount,
            coupon: appliedCoupon?._id,
            status: 'pending'
        });

        await order.save({ session });

        return order;
    })
}