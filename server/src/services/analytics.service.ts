import Order from "../models/order.model";
import Refund from "../models/refund.model";
import User from "../models/user.model";

export const getDashboardStats = async () => {
    const orderStatsPromise = Order.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                // Adding totalPrice of orders that were not cancelled
                totalGrossRevenue: {
                    $sum: {
                        $cond: [{$ne: ["$orderStatus", "Cancelled"]}, "$totalPrice", 0]
                    }
                },
                processingOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "Processing"] }, 1, 0] } },
                shippedOrders: { $sum: {$cond: [{$eq: ["$orderStatus", "Shipped"]}, 1, 0]} },
                deliveredOrders: {$sum: {$cond: [{$eq: ["$orderStatus", "Delivered"]}, 1, 0]} },
                cancelledOrders: {$sum: {$cond: [{$eq: ["$orderStatus", "Cancelled"]}, 1, 0]} },
            }
        }
    ]);

    const refundStatsPromise = Refund.aggregate([
        {$match: {status: "Completed"}},
        {
            $group: {
                _id: null,
                totalRefundAmount: {$sum: "$totalRefundAmount"},
                refundCount: {$sum: 1},
            }
        }
    ]);

    // Top 5 Selling Products
    const topProductsPromise = Order.aggregate([
        {$match: {orderStatus: {$ne: "Cancelled"}}}, // Exclude cancelled orders
        {$unwind: "$orderItems"},
        {
            $group: {
                _id: "$orderItems.product",
                name: {$first: "$orderItems.name"},
                totalQuantitySold: {$sum: "$orderItems.quantity"},
                totalRevenue: {$sum: {$multiply: ["$orderItems.price", "$orderItems.quantity"]}}
            }
        },
        {$sort: {totalQuantitySold: -1}},
        {$limit: 5}
    ]);

    // Customer Statistics
    const totalUsersPromise = User.countDocuments({role: "user"});
    const activeUsersPromise = User.countDocuments({role: "user", status: "active"});

    // Execution in Parallel
    const [orderStats, refundStats, topProducts, totalUsers, activeUsers] = await Promise.all([
        orderStatsPromise,
        refundStatsPromise,
        topProductsPromise,
        totalUsersPromise,
        activeUsersPromise
    ]);

    const orders = orderStats[0] || { 
        totalOrders: 0, totalGrossRevenue: 0, processingOrders: 0, 
        shippedOrders: 0, deliveredOrders: 0, cancelledOrders: 0 
    };
    const refunds = refundStats[0] || { totalRefundAmount: 0, refundCount: 0 };

    // Net Revenue Calculation
    const netRevenue = orders.totalGrossRevenue - refunds.totalRefundAmount;

    return {
        financials: {
            grossRevenue: orders.totalGrossRevenue,
            totalRefunded: refunds.totalRefundAmount,
            netRevenue: netRevenue
        },
        orders: {
            total: orders.totalOrders,
            processing: orders.processingOrders,
            shipped: orders.shippedOrders,
            delivered: orders.deliveredOrders,
            cancelled: orders.cancelledOrders,
            refunded: refunds.refundCount
        },
        customers: {
            total: totalUsers,
            active: activeUsers
        },
        topSellingProducts: topProducts
    }
};

/**
 * Admin: Monthly Sales Trend Calculation
 * We will take the last 12 months of data
 */
export const getMonthlySalesTrend = async () => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    return await Order.aggregate([
        // Only orders from the last 12 months will be accepted. Orders must not have been cancelled.
        {
            $match: {
                createdAt: { $gte: twelveMonthsAgo },
                orderStatus: { $ne: "Cancelled" }
            }
        },
        // Extracting month and year from date
        {
            $project: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                totalPrice: 1
            }
        },
        {
            $group: {
                _id: { year: "$year", month: "$month" },
                totalRevenue: { $sum: "$totalPrice" },
                orderCount: { $sum: 1 }
            }
        },
        // Sorting (by year and month)
        {
            $sort: { "_id.year": 1, "_id.month": 1 }
        },
        // Clear output format editing
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                revenue: "$totalRevenue",
                orders: "$orderCount",
                date: {
                    $concat: [
                        { $toString: "$_id.year" },
                        "-",
                        { $toString: "$_id.month" }
                    ]
                }
            }
        }
    ]);
};
