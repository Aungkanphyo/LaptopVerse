import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as adminService from "../services/admin.service";

/**
 * @desc Get Dashboard Overview Data
 * @route GET /api/v1/admin/dashboard-stats
 * @access Private (Admin Only)
 */
export const getDashboardOverview = asyncHandler(async (req: Request, res: Response) => {
    const stats = await adminService.getAdminStats();
    const salesHistory = await adminService.getSalesStats();
    const topProducts = await adminService.getTopSellingProducts();

    res.status(200).json({
        success: true,
        data: {
            summary: stats,
            graphData: salesHistory,
            topProducts
        }
    });
});