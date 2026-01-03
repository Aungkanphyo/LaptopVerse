import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as adminService from "../services/admin.service";

/**
 * @desc Get all users with search, filter, and pagination
 * @route GET /api/v1/admin/users
 * @access Private (Admin)
 */
export const getAllUsersList = asyncHandler(async (req: Request, res: Response) => {
    const { users, totalUsers } = await adminService.getAllUsers(req.query);
    res.status(200).json({
        success: true,
        count: users.length, // Current Page Users Count
        totalUsers, // Total Users Count
        data: users
    });
});

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

/**
 * @desc Update User Role
 * @route PUT /api/v1/admin/users/:id/role
 */
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.body;
    const targetUserId = req.params.id;
    const adminId = req.userId as string; // Current logged-in admin

    const user = await adminService.updateUserRole(targetUserId, role, adminId);

    res.status(200).json({
        success: true,
        message: `User role updated to ${role} successfully.`,
        data: user
    });
});

/**
 * @desc Update User Status (Ban/Unban)
 * @route PUT /api/v1/admin/users/:id/status
 */
export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const targetId = req.params.id;
    const adminId = req.userId as string; // Current logged-in admin

    const user = await adminService.updateUserStatus(targetId, status, adminId);

    res.status(200).json({
        success: true,
        message: `User has been ${status} successfully.`,
        data: user
    });
});