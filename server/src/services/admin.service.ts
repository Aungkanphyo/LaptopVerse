import Order from "../models/order.model";
import Product from "../models/product.model";
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
};

/**
 * Get Top 5 Selling Products
 */
export const getTopSellingProducts = async () => {
    const topProducts = await Order.aggregate([
        { $unwind: "$orderItems" }, // Order ထဲက item တစ်ခုချင်းစီကို ခွဲထုတ်တယ်
        {
            
            $group: {
                _id: "$orderItems.product", // Product ရဲ့ id အလိုက် group တွေခွဲပြီးတော့ဖွဲ့တယ်
                name: { $first: "$orderItems.name" },
                totalQuantity: {
                    $sum: {
                        $convert: {
                            input: "$orderItems.quantity",
                            to: "int",
                            onError: 0, // နံပါတ်မဟုတ်တဲ့စာသားတွေ့ရင် 0 လို့သတ်မှတ်ပြီး skip လုပ်မယ်
                            onNull: 0
                        }
                    }
                },
                totalRevenue: {
                    $sum: {
                        $multiply: [
                            {
                                $convert: {
                                    input: "$orderItems.price",
                                    to: "double",
                                    onError: 0,
                                    onNull: 0
                                }
                            },
                            {
                                $convert: {
                                    input: "$orderItems.quantity",
                                    to: "int",
                                    onError: 0,
                                    onNull: 0
                                }
                            }
                        ]
                    }
                }
            }
        },
        { $sort: { totalQuantity: -1 } }, // descending အလိုက်စီထားတယ်
        { $limit: 5 }
    ]);

    return topProducts;
}

export const getLowStockProducts = async () => {
    const lowStockThreshold = 5;

    const lowStockProducts = await Product.find({
        stock: { $lte: lowStockThreshold }
    }).select('name stock price');

    return lowStockProducts;
};