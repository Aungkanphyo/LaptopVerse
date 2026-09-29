import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Order, { IOrder, OrderStatus } from "../models/order.model";
import { AppError } from "../utils/error.utils";
import Product from "../models/product.model";
import sendEmail from "../utils/sendEmail";
import { getPaymentApprovedTemplate, getPaymentRejectedTemplate } from "../utils/emailTemplates";
import { safeJsonParse } from "../utils/safeJsonParse.utils";
import { uploadToCloudinary } from "../config/cloudinary.config";
import mongoose from "mongoose";
import User from "../models/user.model";

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

    // Basic Validation Check
    if (!shippingInfo || !orderItems || orderItems.length === 0) {
        return next(new AppError("The information is incomplete. (Invalid Order Data)", 400));
    }

    const itemsPrice = Number(req.body.itemsPrice) || 0;
    const totalPrice = Number(req.body.totalPrice) || 0;

    let slipUrl: string | undefined = undefined;
    let slipPublicId: string | undefined = undefined;

    // Cloudinary File Upload
    if (req.file && req.file.buffer) {
        const result = await uploadToCloudinary(req.file.buffer, "payment_slips");
        slipUrl = result.secure_url || result.url;
        slipPublicId = result.public_id;
    }

    const isPaid = paymentInfo?.status === 'succeeded';

    const finalPaymentInfo = {
        ...paymentInfo,
        ...(slipUrl ? { slipUrl, slipPublicId } : {}),
    };

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo: finalPaymentInfo,
        itemsPrice,
        totalPrice,
        paidAt: isPaid ? new Date() : undefined,
        user: req.userId,
    });

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
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    const currentUserId = req.userId?.toString();
    const currentUserRole = req.user?.role;

    if (!order) {
        return next(new AppError('Order not found with this ID', 404));
    }

    const orderUser = order.user as any;
    const orderOwnerId = orderUser._id.toString();

    // Authorization check
    const isOwner = orderOwnerId === currentUserId;
    const isAdmin = currentUserRole === 'admin';

    if (!isOwner && !isAdmin) {
        return next(
            new AppError('You are not authorized to view this order details.', 403)
        );
    }

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
    const orders = await Order.find({ user: req.userId });

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
    // Extract Query Parameters with defaults
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
    const skip = (page - 1) * limit;

    const status = req.query.status as string;
    const keyword = (req.query.keyword as string || '').trim();
    // Build Dynamic Query Filter Object
    const filterQuery: Record<string, any> = {};
    // Filter by Order Status
    if (status && status !== 'all') {
        filterQuery.orderStatus = status;
    }

    if (keyword) {
        const keywordRegex = new RegExp(keyword, 'i');

        // Customer Matching (Name / Email)
        const matchingUsers = await User.find({
            $or: [
                { fullName: keywordRegex },
                { name: keywordRegex },
                { email: keywordRegex }
            ]
        }).select('_id').lean();

        const userIds = matchingUsers.map(u => u._id);

        const searchConditions: any[] = [
            // Using Mongo $expr & $toString, you can get a Partial Match by just typing the beginning/middle part of the Order ID
            {
                $expr: {$regexMatch: {
                        input: { $toString: "$_id" },
                        regex: keyword,
                        options: "i"
                    }
                }
            },
            { 'trackingInfo.trackingNumber': keywordRegex },
            { 'shippingInfo.phoneNo': keywordRegex },
            { 'shippingInfo.city': keywordRegex },
            { 'shippingInfo.address': keywordRegex },
            { 'orderItems.name': keywordRegex }
        ];

        if (userIds.length > 0) {
            searchConditions.push({ user: { $in: userIds } });
        }

        filterQuery.$or = searchConditions;
    }

    // Parallel Execution for Count, Aggregation Total, and Paginated Records
    const [totalOrders, orders, totalAmountResult] = await Promise.all([
        Order.countDocuments(filterQuery),
        Order.find(filterQuery)
            .populate('user', 'fullName name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(), // Performance Boost: Bypasses Mongoose Hydration
        Order.aggregate([
            { $match: filterQuery },
            { $group: { _id: null, totalSum: { $sum: "$totalPrice" } } }
        ])
    ]);

    const totalAmount = totalAmountResult[0]?.totalSum || 0;
    const totalPages = Math.ceil(totalOrders / limit) || 1;

    res.status(200).json({
        success: true,
        count: orders.length,
        total: totalOrders,
        totalPages,
        page,
        limit,
        totalAmount,
        orders,
    });
});

/**
 * @desc Update Order Status (Processing -> Shipped -> Delivered / Cancelled)
 * @route PUT /api/v1/orders/admin/:id
 * @access Private (Admin)
 */
const ALLOWED_STATUSES: OrderStatus[] = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
export const updateOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { status, courierName, trackingNumber, cancellationReason } = req.body;
    // Validate Status Enum
    if (!status || !ALLOWED_STATUSES.includes(status as OrderStatus)) {
        return next(new AppError('Please provide a valid order status', 400));
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('Order not found with this ID', 404));
    }

    // Prevent modification of finalized orders
    if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
        return next(new AppError(`${order.orderStatus} orders cannot be modified`, 400));
    }

    const previousStatus = order.orderStatus;

    if (previousStatus === status) {
        return next(new AppError(`Order is already in ${status} status`, 400));
    }

    // Start Database Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Transition to SHIPPED
        if (status === 'Shipped') {
            if (previousStatus === 'Processing') {
                await deductStock(order.orderItems, session);
            }

            order.trackingInfo = {
                courierName: courierName || order.trackingInfo?.courierName || '',
                trackingNumber: trackingNumber || order.trackingInfo?.trackingNumber || '',
            };
        }

        // Transition to DELIVERED
        if (status === 'Delivered') {
            if (previousStatus === 'Processing') {
                await deductStock(order.orderItems, session);
            }
            order.deliveredAt = new Date();
        }

        // Transition to CANCELLED
        if (status === 'Cancelled') {
            if (previousStatus === 'Shipped') {
                await restoreStock(order.orderItems, session);
            }
            order.cancellationReason = cancellationReason || 'Cancelled by Admin';
        }

        order.orderStatus = status as OrderStatus;
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            data: order,
        });

    } catch (error) {
        // Error occurs, rollback to original
        await session.abortTransaction();
        session.endSession();
        return next(error);
    }
});

/**
 * @desc Delete Order
 * @route DELETE /api/v1/orders/admin/:id
 * @access Private (Admin)
 */
export const deleteOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('Order not found with this ID', 404));
    }

    await order.deleteOne();

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
    const { paymentStatus, rejectionReason } = req.body; // paymentStatus: 'succeeded' | 'failed'

    const order = await Order.findById(req.params.id).populate<{ user: { fullName: string; email: string } }>('user', 'fullName email');

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    order.paymentInfo.status = paymentStatus;
    if (paymentStatus === 'succeeded') {
        order.paidAt = new Date(Date.now());
    }
    await order.save();

    // Send Email to User
    try {
        const orderIdString = order._id.toString();
        if (paymentStatus === 'succeeded') {
            await sendEmail({
                email: order.user.email,
                subject: `Payment Confirmed - Order #${order._id}`,
                html: getPaymentApprovedTemplate(order.user.fullName, orderIdString, order.totalPrice),
            });
        } else if (paymentStatus === 'failed') {
            await sendEmail({
                email: order.user.email,
                subject: `Payment Verification Issue - Order #${order._id}`,
                html: getPaymentRejectedTemplate(order.user.fullName, orderIdString, rejectionReason),
            });
        }
    } catch (error) {
        console.error("Payment notification email failed to send:", error);
    }

    res.status(200).json({
        success: true,
        message: `Payment status updated to ${paymentStatus}`,
        order,
    });
});


interface IOrderItemStock {
    product: mongoose.Types.ObjectId | string;
    quantity: number;
    name?: string;
}
// Helper Functions
async function deductStock(orderItems: IOrderItemStock[], session: mongoose.ClientSession) {
    for (const item of orderItems) {
        const product = await Product.findById(item.product).session(session);

        if (!product) {
            throw new AppError(`Product not found with ID: ${item.product}`, 404);
        }

        // Check for sufficient stock
        if (product.stock < item.quantity) {
            throw new AppError(`Insufficient stock for product: ${product.name || item.product}`, 400);
        }

        product.stock -= item.quantity;
        await product.save({ session });
    }
}

async function restoreStock(orderItems: IOrderItemStock[], session: mongoose.ClientSession) {
    for (const item of orderItems) {
        // Restocking using the atomic $inc operator
        await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } },
            { session }
        );
    }
}