import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as analyticsService from "../services/analytics.service";

/**
 * @desc Get comprehensive dashboard statistics
 * @route GET /api/v1/admin/analytics/dashboard
 */
export const getDashboardOverview = asyncHandler(async (req: Request, res: Response) => {
    const [stats, salesTrend] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getMonthlySalesTrend()
    ]);

    res.status(200).json({
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: {
            ...stats,
            salesTrend
        }
    });
});