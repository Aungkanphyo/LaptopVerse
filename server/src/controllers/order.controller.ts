import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Order from "../models/order.model";
import { AppError } from "../utils/error.utils";
import Product from "../models/product.model";

// User Controller function
/**
 * @desc Create New Order
 * @route POST /api/v1/orders/new
 * @access Private (User)
 */
export const newOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    const isPaid = paymentInfo?.status === 'succeeded';

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        ...(isPaid ? { paidAt: Date.now() } : {}),
        user: req.userId, // From protect middleware
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

    if(!isOwner && !isAdmin) {
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
    const filter: { orderStatus?: string } = {};

    // Get orderStatus from URL Query Parameter (e.g: ?status=Processing)
    if(req.query.status) {
        filter.orderStatus = req.query.status.toString();
    }

    const orders = await Order.find(filter);

    // Calculate Total Amount of all orders (For Dashboard Analytics)
    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        count: orders.length,
        totalAmount,
        orders,
    });
});

/**
 * @desc Update Order Status (Processing -> Shipped -> Delivered)
 * @route PUT /api/v1/orders/admin/:id
 * @access Private (Admin)
 */
export const updateOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('Order not found with this ID', 404));
    }

    if (order.orderStatus === 'Delivered') {
        return next(new AppError('You have already delivered this order', 400));
    }

    // Logic to deduct stock when the status changes to 'Shipped
    if (req.body.status === 'Shipped') {
        order.orderItems.forEach(async (o) => {
            await updateStock(o.product.toString(), o.quantity);
        });
    }

    order.orderStatus = req.body.status;

    if (req.body.status === 'Delivered') {
        order.deliveredAt = new Date(Date.now());
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
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

// Helper function
async function updateStock(id: string, quantity: number) {
    const product = await Product.findById(id);
    if(product) {
        product.stock -= quantity;
        await product.save({ validateBeforeSave: false });
    }
}