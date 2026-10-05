import mongoose from "mongoose";
import Order, { IOrder, IPopulatedOrder, OrderStatus } from "../models/order.model";
import Product from "../models/product.model";
import { AppError } from "../utils/error.utils";
import { withTransaction } from "../utils/transaction.util";
import User from "../models/user.model";
import sendEmail from "../utils/sendEmail";
import { getPaymentApprovedTemplate, getPaymentRejectedTemplate } from "../utils/emailTemplates";
import { getIO, StockUpdatePayload } from "../config/socket.config";
import { logger } from "../utils/logger";
import Counter from "../models/counter.model";

// Helper function
const generateOrderCode = async (session?: mongoose.ClientSession): Promise<string> => {
    const counter = await Counter.findOneAndUpdate(
        { _id: "order" },
        { $inc: { sequence: 1 } },
        {
            new: true,
            upsert: true,
            session,
        }
    );

    if (!counter) {
        throw new AppError("Failed to generate order sequence", 500);
    }

    const dateStr = new Date()
        .toISOString()
        .slice(2, 10)
        .replace(/-/g, "");
    const sequenceStr = String(counter.sequence).padStart(4, "0");

    return `LV-${dateStr}-${sequenceStr}`;
};

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

export const createOrderService = async (orderData: ICreateOrderInput, userId?: string): Promise<IOrder> => {
    const updatedStockPayload: StockUpdatePayload['products'] = [];
    const order = await withTransaction(async (session) => {
        const { orderItems, shippingInfo, paymentInfo } = orderData;
        const productIds = orderItems.map((item) => item.product);

        const dbProducts = await Product.find({ _id: { $in: productIds } }).session(session);
        const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

        let calculatedItemsPrice = 0;
        const bulkStockOperations: any[] = [];

        // Checking stock availability for each product and performing atomic stock deduction
        for (const item of orderItems) {
            const product = productMap.get(item.product);

            if (!product) {
                throw new AppError(`Product not found with ID: ${item.product}`, 404);
            }

            if (product.stock < item.quantity) {
                throw new AppError(`Insufficient stock for product: ${product.name}`, 400);
            }

            // Prevent price tampering by using DB price instead of client-supplied price
            calculatedItemsPrice += product.price * item.quantity;

            // // Use conditional atomic update to prevent stock discrepancies under high concurrency
            bulkStockOperations.push({
                updateOne: {
                    filter: { _id: item.product, stock: { $gte: item.quantity } },
                    update: { $inc: { stock: -item.quantity } },
                },
            });

            updatedStockPayload.push({
                productId: product._id.toString(),
                newStock: product.stock - item.quantity,
            });
        }

        const bulkWriteRes = await Product.bulkWrite(bulkStockOperations, { session });
        if (bulkWriteRes.modifiedCount !== orderItems.length) {
            throw new AppError("Stock conflict during order creation. Please try again.", 400);
        }

        const isPaid = paymentInfo?.status === 'succeeded';
        const finalTotalPrice = calculatedItemsPrice;
        const orderCode = await generateOrderCode(session);
        const [createdOrder] = await Order.create(
            [
                {
                    orderCode,
                    shippingInfo,
                    orderItems,
                    paymentInfo,
                    itemsPrice: calculatedItemsPrice,
                    totalPrice: finalTotalPrice,
                    paidAt: isPaid ? new Date() : undefined,
                    user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
                },
            ],
            { session }
        );

        return createdOrder;
    });
    try {
        if (updatedStockPayload.length > 0) {
            logger.debug({ payload: updatedStockPayload }, '📢 [Socket.io Server] Emitting stock:updated event');
            getIO().emit('stock:updated', { products: updatedStockPayload });
        }
    } catch (socketErr) {
        logger.error(socketErr, '❌ [Socket.io Server] Emission failed');
    }

    return order;
};

/**
 * @desc Track Order Status for Guests (Requires Order ID & Phone Number for Verification)
 */
export const trackOrderService = async (orderCode: string, phoneNo: string): Promise<IOrder> => {
    const normalizedOrderCode = orderCode.trim().toUpperCase(); 
    const normalizedPhoneNo = phoneNo.trim();
    if (!normalizedOrderCode || !normalizedPhoneNo) {
        throw new AppError('Order Code and Phone Number are required', 400);
    }

    const order = await Order.findOne({ 
        orderCode: normalizedOrderCode, "shippingInfo.phoneNo": normalizedPhoneNo, 
    }).lean();

    if (!order) {
        throw new AppError('Order not found with the provided details', 404);
    }

    return order as unknown as IOrder;
};

/**
 * @desc Get Single Order with Authorization Checks
 */
export const getSingleOrderService = async (
    orderId: string,
    currentUserId?: string,
    currentUserRole?: string
): Promise<IOrder> => {
    const order = await Order.findById(orderId).populate('user', 'name email').lean();

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

    return order as unknown as IOrder;
};

/**
 * @desc Get Orders of Logged-in User
 */
export const getUserOrdersService = async (userId: string): Promise<IOrder[]> => {
    return await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
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
    const matchStage: Record<string, any> = {};

    if (status && status !== 'all') {
        matchStage.orderStatus = status;
    }

    if (keyword) {
        const keywordRegex = new RegExp(keyword, 'i');

        // Validates ObjectId for direct index lookup on _id to avoid COLLSCAN
        const isObjectId = mongoose.Types.ObjectId.isValid(keyword);

        const searchConditions: any[] = [
            { 'trackingInfo.trackingNumber': keywordRegex },
            { 'shippingInfo.phoneNo': keywordRegex },
            { 'shippingInfo.city': keywordRegex },
            { 'shippingInfo.address': keywordRegex },
            { 'orderItems.name': keywordRegex }
        ];

        if (isObjectId) {
            searchConditions.push({ _id: new mongoose.Types.ObjectId(keyword) });
        } else {
            const matchingUsers = await User.find({
                $or: [{ fullName: keywordRegex }, { name: keywordRegex }, { email: keywordRegex }]
            }).select('_id').lean();

            if (matchingUsers.length > 0) {
                searchConditions.push({ user: { $in: matchingUsers.map(u => u._id) } });
            }
        }

        matchStage.$or = searchConditions;
    }

    // Fetches countDocuments, find, and aggregate in a single MongoDB $facet query instead of multiple requests
    const aggregationResult = await Order.aggregate([
        { $match: matchStage },
        {
            $facet: {
                metadata: [
                    { $group: { _id: null, totalOrders: { $sum: 1 }, totalSum: { $sum: "$totalPrice" } } }
                ],
                orders: [
                    { $sort: { createdAt: -1 } }, { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "users",
                            localField: "user",
                            foreignField: "_id",
                            as: "user"
                        }
                    },
                    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            "user.password": 0,
                            "user.role": 0,
                        }
                    }
                ]
            }
        }
    ]);

    const facetData = aggregationResult[0];
    const metadata = facetData.metadata[0] || { totalOrders: 0, totalSum: 0 };
    const orders = facetData.orders;

    const totalOrders = metadata.totalOrders;
    const totalAmount = metadata.totalSum;
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
            // Restocks products using bulkWrite during cancellation to avoid N+1 DB writes
            const bulkRestores = order.orderItems.map((item) => ({
                updateOne: {
                    filter: { _id: item.product },
                    update: { $inc: { stock: item.quantity } },
                },
            }));

            if (bulkRestores.length > 0) {
                await Product.bulkWrite(bulkRestores, { session });
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

    // Triggers SMTP mail sending as a non-blocking (fire-and-forget) event to avoid blocking the response
    const orderIdString = order._id.toString();
    const userEmail = order.user?.email;
    const userName = order.user?.fullName;

    if (userEmail) {
        Promise.resolve().then(async () => {
            try {
                if (paymentStatus === 'succeeded') {
                    await sendEmail({
                        email: userEmail,
                        subject: `Payment Confirmed - Order #${orderIdString}`,
                        html: getPaymentApprovedTemplate(userName, orderIdString, order.totalPrice),
                    });
                } else if (paymentStatus === 'failed') {
                    await sendEmail({
                        email: userEmail,
                        subject: `Payment Verification Issue - Order #${orderIdString}`,
                        html: getPaymentRejectedTemplate(userName, orderIdString, rejectionReason),
                    });
                }
            } catch (error) {
                console.error("Payment notification email failed to send:", error);
            }
        });
    }

    return order as unknown as IPopulatedOrder;
};