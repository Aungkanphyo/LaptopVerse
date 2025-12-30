import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as adminService from "../services/admin.service";

/**
 * @desc Get Dashboard Overview Data
 * @route GET /api/v1/admin/dashboard-stats
 * @access Private (Admin Only)
 */
export const getDashboardOverview = asyncHandler(async (req: Request, res: Response) => {
    const [summary, graphData, topProducts, lowStock, distribution, recentOrders] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getSalesStats(),
        adminService.getTopSellingProducts(),
        adminService.getLowStockProducts(),
        adminService.getOrderStatusDistribution(),
        adminService.getRecentOrders()
    ]);

    res.status(200).json({
        success: true,
        data: {
            summary,
            graphData,
            topProducts,
            lowStock,
            distribution,
            recentOrders
        }
    });
});