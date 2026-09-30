import mongoose from "mongoose";
import Order, { IOrder, IPopulatedOrder, OrderStatus } from "../models/order.model";
import Product from "../models/product.model";
import { AppError } from "../utils/error.utils";
import { withTransaction } from "../utils/transaction.util";
import User from "../models/user.model";
import sendEmail from "../utils/sendEmail";
import { getPaymentApprovedTemplate, getPaymentRejectedTemplate } from "../utils/emailTemplates";

// Service Layer Interfaces (DTOs)
export interface ICreateOrderInput {
    shippingInfo: any;
    orderItems: Array<{
        name: string;
        quantity: number;
        price: number;
        image: string;
        product: string;
    }>;
    paymentInfo: {
        id?: string;
        status?: string;
        slipUrl?: string;
        slipPublicId?: string;
    };
    itemsPrice: number;
    totalPrice: number;
}

export interface IAdminOrderQueryParams {
    page?: number;
    limit?: number;
    status?: string;
    keyword?: string;
}

export interface IUpdateOrderStatusInput {
    status: OrderStatus;
    courierName?: string;
    trackingNumber?: string;
    cancellationReason?: string;
}

const ALLOWED_STATUSES: OrderStatus[] = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

export const createOrderService = async (orderData: ICreateOrderInput, userId: string): Promise<IOrder> => {
    return await withTransaction(async (session) => {
        const { orderItems, shippingInfo, paymentInfo, itemsPrice, totalPrice } = orderData;

        // Checking stock availability for each product and performing atomic stock deduction
        for (const item of orderItems) {
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                throw new AppError(`Product not found with ID: ${item.product}`, 404);
            }

            if (product.stock < item.quantity) {
                throw new AppError(`Insufficient stock for product: ${product.name}`, 400);
            }

            // Reduce stock
            product.stock -= item.quantity;
            await product.save({ session });
        }

        const isPaid = paymentInfo?.status === 'succeeded';

        // Saving Order Data to the Database using Sessions
        const [order] = await Order.create(
            [
                {
                    shippingInfo,
                    orderItems,
                    paymentInfo,
                    itemsPrice,
                    totalPrice,
                    paidAt: isPaid ? new Date() : undefined,
                    user: new mongoose.Types.ObjectId(userId),
                },
            ],
            { session }
        );

        return order;
    })
};

/**
 * @desc Get Single Order with Authorization Checks
 */
export const getSingleOrderService = async (
    orderId: string,
    currentUserId?: string,
    currentUserRole?: string
): Promise<IOrder> => {
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
        throw new AppError('Order not found with this ID', 404);
    }

    const orderUser = order.user as any;
    const orderOwnerId = orderUser._id ? orderUser._id.toString() : orderUser.toString();

    // Authorization check
    const isOwner = orderOwnerId === currentUserId;
    const isAdmin = currentUserRole === 'admin';

    if (!isOwner && !isAdmin) {
        throw new AppError('You are not authorized to view this order details.', 403);
    }

    return order;
};

/**
 * @desc Get Orders of Logged-in User
 */
export const getUserOrdersService = async (userId: string): Promise<IOrder[]> => {
    return await Order.find({ user: userId }).sort({ createdAt: -1 });
};

/**
 * @desc Get Paginated & Filtered Orders for Admin Management
 */
export const getAllOrdersAdminService = async (params: IAdminOrderQueryParams) => {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 10);
    const skip = (page - 1) * limit;

    const status = params.status;
    const keyword = (params.keyword || '').trim();
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
                $expr: {
                    $regexMatch: {
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

    return {
        orders,
        count: orders.length,
        total: totalOrders,
        totalPages,
        page,
        limit,
        totalAmount,
    };
};

/**
 * @desc Update Order Status & Handle Stock Restoration on Order Cancellation
 */
export const updateOrderStatusAdminService = async (
    orderId: string,
    updateData: IUpdateOrderStatusInput
): Promise<IOrder> => {
    const { status, courierName, trackingNumber, cancellationReason } = updateData;
    // Validate Status Enum
    if (!status || !ALLOWED_STATUSES.includes(status)) {
        throw new AppError('Please provide a valid order status', 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
        throw new AppError('Order not found with this ID', 404);
    }
    // Prevent modification of finalized orders
    if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
        throw new AppError(`${order.orderStatus} orders cannot be modified`, 400);
    }

    if (order.orderStatus === status) {
        throw new AppError(`Order is already in ${status} status`, 400);
    }

    return await withTransaction(async (session) => {
        // Restoring stock to the database that was deducted at the time the order was placed, in the event of an order cancellation
        if (status === 'Cancelled') {
            for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: item.quantity } },
                    { session }
                );
            }
            order.cancellationReason = cancellationReason || 'Cancelled by Admin';
        }

        if (status === 'Shipped') {
            order.trackingInfo = {
                courierName: courierName || order.trackingInfo?.courierName || '',
                trackingNumber: trackingNumber || order.trackingInfo?.trackingNumber || '',
            };
        }

        if (status === 'Delivered') {
            order.deliveredAt = new Date();
        }

        order.orderStatus = status;
        await order.save({ session });

        return order;
    });
};

/**
 * @desc Delete Order
 */
export const deleteOrderService = async (orderId: string): Promise<void> => {
    const order = await Order.findById(orderId);

    if (!order) {
        throw new AppError('Order not found with this ID', 404);
    }

    await order.deleteOne();
};

/**
 * @desc Verify Payment Status & Send Email Notification
 */
export const verifyPaymentService = async (
    orderId: string,
    paymentStatus: 'succeeded' | 'failed',
    rejectionReason?: string
): Promise<IPopulatedOrder> => {
    const order = await Order.findById(orderId).populate<{ user: { fullName: string; email: string } }>('user', 'fullName email');

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    order.paymentInfo.status = paymentStatus;
    if (paymentStatus === 'succeeded') {
        order.paidAt = new Date();
    }

    await order.save();

    // Async Email Notification Triggering
    try {
        const orderIdString = order._id.toString();
        if (paymentStatus === 'succeeded') {
            await sendEmail({
                email: order.user.email,
                subject: `Payment Confirmed - Order #${orderIdString}`,
                html: getPaymentApprovedTemplate(order.user.fullName, orderIdString, order.totalPrice),
            });
        } else if (paymentStatus === 'failed') {
            await sendEmail({
                email: order.user.email,
                subject: `Payment Verification Issue - Order #${orderIdString}`,
                html: getPaymentRejectedTemplate(order.user.fullName, orderIdString, rejectionReason),
            });
        }
    } catch (error) {
        console.error("Payment notification email failed to send:", error);
    }

    return order as unknown as IPopulatedOrder;
};