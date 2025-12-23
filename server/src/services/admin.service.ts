import Order from "../models/order.model";
import User from "../models/user.model";

/**
 * Get Overall Stats (Users, Orders, Revenue)
 */
export const getAdminStats = async () => {
    // Total Users Count
    const totalUsers = await User.countDocuments();

    // Total Orders Count
    const totalOrders = await Order.countDocuments();

    // Total Revenue (Aggregation သုံးပြီး ပေါင်း)
    const revenueStats = await Order.aggregate([
        {
            $match: { orderStatus: { $ne: 'Cancelled' } }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalPrice" }
            }
        }
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

    return {
        totalUsers,
        totalOrders,
        totalRevenue
    };
};

/**
 * Get Sales Statistics for Graph (Last 7 Days)
 */
export const getSalesStats = async () => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const salesData = await Order.aggregate([
        {
            // 7 ရက်အတွင်းက Order တွေကိုပဲ ယူမယ်
            $match: {
                createdAt: { $gte: last7Days }
            }
        },
        {
            // ရက်စွဲအလိုက် Group ဖွဲ့
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                sales: { $sum: "$totalPrice" },
                orderCount: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } } // ရက်စွဲအလိုက် စီမယ်
    ]);

    return salesData;
}