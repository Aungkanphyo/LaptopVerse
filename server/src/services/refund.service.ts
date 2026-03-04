import Order from "../models/order.model";
import Product from "../models/product.model";
import Refund from "../models/refund.model";
import { AppError } from "../utils/error.utils";
import { withTransaction } from "../utils/transaction.util";
import { createLog } from "./logger.service";

/**
 * Admin: Approve and close the refund request
 */
export const approveRefund = async (refundId: string, adminId: string, note: string) => {
    return await withTransaction(async (session) => {
        // Find and check the refund request
        const refund = await Refund.findById(refundId).session(session);
        if (!refund || refund.status !== 'requested') {
            throw new AppError("Invalid or already processed refund request", 400);
        }

        // Inventory Restoration
        for (const item of refund.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } },
                { session }
            );
        }

        // Changing Refund Status to Completed
        refund.status = 'completed';
        refund.adminNote = note;
        refund.processedBy = adminId as any;
        await refund.save({ session });
        
        // Updating Order Status
        await Order.findByIdAndUpdate(
            refund.order,
            { status: 'refunded' },
            { session }
        );

        // Manual Audit Logging
        await createLog({
            admin: adminId,
            action: "APPROVE_REFUND",
            resource: "Refund",
            resourceId: refundId,
            details: {
                orderId: refund.order,
                amount: refund.totalRefundAmount,
                note
            }
        }, session);

        return refund;
    });
};