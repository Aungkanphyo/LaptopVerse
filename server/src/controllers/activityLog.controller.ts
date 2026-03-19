import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as activityLogService from "../services/activityLog.service";

/**
 * @desc Get all activity logs with filtering and pagination
 * @route GET /api/v1/admin/activity-logs
 */
export const getActivityLogs = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { action, resource, adminId } = req.query;

    const result = await activityLogService.getActivityLogs(page, limit, { action, resource, adminId });

    res.status(200).json({
        success: true,
        message: "Activity logs fetched successfully",
        data: result
    })
});