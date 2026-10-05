import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/error.utils";
import { safeJsonParse } from "../utils/safeJsonParse.utils";
import { uploadToCloudinary } from "../config/cloudinary.config";
import * as orderService from "../services/order.service";
import { OrderStatus } from "../models/order.model";

// User Controller function
/**
 * @desc Create New Order
 * @route POST /api/v1/orders/new
 * @access Private (User)
 */
export const newOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const shippingInfo = safeJsonParse(req.body.shippingInfo);
    const orderItems = safeJsonParse(req.body.orderItems);
    const paymentInfo = safeJsonParse(req.body.paymentInfo);

   if (!shippingInfo || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
        return next(new AppError("The information is incomplete. (Invalid Order Data)", 400));
    }

    const itemsPrice = Number(req.body.itemsPrice) || 0;
    const totalPrice = Number(req.body.totalPrice) || 0;

    let slipUrl: string | undefined = undefined;
    let slipPublicId: string | undefined = undefined;

    // Payment Slip File Upload Processing
    if (req.file && req.file.buffer) {
        const result = await uploadToCloudinary(req.file.buffer, "payment_slips");
        slipUrl = result.secure_url || result.url;
        slipPublicId = result.public_id;
    }

    const finalPaymentInfo = {
        ...paymentInfo,
        ...(slipUrl ? { slipUrl, slipPublicId } : {}),
    };

    const order = await orderService.createOrderService(
        {
            shippingInfo,
            orderItems,
            paymentInfo: finalPaymentInfo,
            itemsPrice,
            totalPrice,
        },
        req.userId as string
    );

    res.status(201).json({
        success: true,
        order,
    });
});

/**
 * @desc Get Single Order Details
 * @route GET /api/v1/orders/:id
 * @access Private (User/Admin)
 */
export const getSingleOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const order = await orderService.getSingleOrderService(
        req.params.id,
        req.userId?.toString(),
        req.user?.role
    );

    res.status(200).json({
        success: true,
        order,
    });
});

/**
 * @desc Get Logged in User Orders (My Orders)
 * @route GET /api/v1/orders/my/orders
 * @access Private (User)
 */
export const myOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const orders = await orderService.getUserOrdersService(req.userId as string);

    res.status(200).json({
        success: true,
        orders,
    });
});

// Admin Controller function
/**
 * @desc Get All Orders
 * @route GET /api/v1/orders/admin/all
 * @access Private (Admin)
 */
export const getAllOrders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string, 10);
    const limit = parseInt(req.query.limit as string, 10);
    const status = req.query.status as string;
    const keyword = req.query.keyword as string;
    const paymentStatus = req.query.paymentStatus as string;

    const result = await orderService.getAllOrdersAdminService({
        page,
        limit,
        status,
        keyword,
        paymentStatus,
    });

    res.status(200).json({
        success: true,
        ...result,
    });
});

/**
 * @desc Update Order Status (Processing -> Shipped -> Delivered / Cancelled)
 * @route PUT /api/v1/orders/admin/:id
 * @access Private (Admin)
 */
export const updateOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { status, courierName, trackingNumber, cancellationReason } = req.body;

    const order = await orderService.updateOrderStatusAdminService(req.params.id, {
        status,
        courierName,
        trackingNumber,
        cancellationReason,
    });

    res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: order,
    });
});

/**
 * @desc Delete Order (Admin)
 * @route DELETE /api/v1/orders/admin/:id
 * @access Private (Admin)
 */
export const deleteOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await orderService.deleteOrderService(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Order Deleted Successfully',
    });
});

/**
 * @desc    Verify Payment Status (Admin) & Send Email Notification
 * @route   PUT /api/v1/orders/admin/:id/verify-payment
 * @access  Private (Admin)
 */
// Admin Payment Verification Endpoint
export const verifyPayment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { paymentStatus, rejectionReason } = req.body;

    if (!['succeeded', 'failed'].includes(paymentStatus)) {
        return next(new AppError("Invalid payment status value.", 400));
    }

    const order = await orderService.verifyPaymentService(
        req.params.id,
        paymentStatus,
        rejectionReason
    );

    res.status(200).json({
        success: true,
        message: `Payment status updated to ${paymentStatus}`,
        order,
    });
});

/**
 * @desc Track Guest/User Order using Order ID and Phone Number
 * @route POST /api/v1/orders/track
 * @access Public
 */
export const trackOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderCode, phoneNo } = req.body;

    if (typeof orderCode !== "string" || typeof phoneNo !== "string" || !orderCode.trim() || !phoneNo.trim()) {
        return next(new AppError("Please provide both Order ID and Phone Number", 400));
    }

    const order = await orderService.trackOrderService(orderCode, phoneNo);

    res.status(200).json({
        success: true,
        order,
    });
});