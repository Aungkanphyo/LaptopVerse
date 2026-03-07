import Order from "../models/order.model";
import Product from "../models/product.model";
import Refund from "../models/refund.model";
import { AppError } from "../utils/error.utils";
import { withTransaction } from "../utils/transaction.util";
import { createLog } from "./logger.service";
import sendEmail from "../utils/sendEmail";
import { getRefundApprovalTemplate, getRefundRejectionTemplate } from "../utils/emailTemplates";

/**
 * Admin: Approve and close the refund request
 */
export const approveRefund = async (refundId: string, adminId: string, note: string) => {
    const result = await withTransaction(async (session) => {
        // Find and check the refund request
        const refund = await Refund.findById(refundId).populate('user').session(session);
        if (!refund || refund.status !== 'Requested') {
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
        refund.status = 'Completed';
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

    if (result) {
        const user = result.user as any;
        sendEmail({
            email: user.email,
            subject: `[LaptopVerse] Refund Approved - Order #${result.order}`,
            html: getRefundApprovalTemplate(user.name, result.order.toString(), result.totalRefundAmount)
        });
    }

    return result;
};

/**
 * Admin: Refund Request reject
 */
export const rejectRefund = async (refundId: string, adminId: string, reason: string) => {
    const result = await withTransaction(async (session) => {
        // Finding a Refund Request
        const refund = await Refund.findById(refundId).populate('user').session(session);
        if (!refund || refund.status !== 'Requested') {
            throw new AppError("Refund request not found or already processed", 404);
        }

        // Changing the status to Rejected
        refund.status = 'Rejected';
        refund.adminNote = reason;
        refund.processedBy = adminId as any;
        await refund.save({ session });

        // Manual logging
        await createLog({
            admin: adminId,
            action: "REJECT_REFUND",
            resource: "Refund",
            resourceId: refundId,
            details: {
                orderId: refund.order,
                reason: reason
            }
        }, session);

        return refund;
    });

    if (result) {
        const user = result.user as any;
        sendEmail({
            email: user.email,
            subject: `[LaptopVerse] Update regarding your refund request`,
            html: getRefundRejectionTemplate(user.name, result.order.toString(), reason)
        });
    }

    return result;
};