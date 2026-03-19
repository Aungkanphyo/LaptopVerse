import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as refundService from "../services/refund.service";
import { AppError } from "../utils/error.utils";
import { data } from "react-router-dom";

export const approveRefundRequest = asyncHandler(async (req: Request, res: Response) => {
    const { note } = req.body;
    const refundId = req.params.id;
    const adminId = req.userId as string;

    const result = await refundService.approveRefund(refundId, adminId, note);

    res.status(200).json({
        success: true,
        message: "Refund approved and inventory updated",
        data: result
    });
});

/**
 * @desc Reject a refund request
 * @route PUT /api/v1/admin/refunds/:id/reject
 */
export const rejectRefundRequest = asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body;
    const refundId = req.params.id;
    const adminId = req.userId as string;

    if (!reason) {
        throw new AppError("Rejection reason is required", 400);
    }

    const result = await refundService.rejectRefund(refundId, adminId, reason);

    res.status(200).json({
        success: true,
        messsage: "Refund request rejected",
        data: result
    });
});