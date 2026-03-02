import { ICoupon } from "../models/coupon.model";
import Product from "../models/product.model";
import { AppError } from "../utils/error.utils";
import { withTransaction } from "../utils/transaction.util";

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

    })
}