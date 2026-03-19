import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as analyticsService from "../services/analytics.service";
import * as exportService from "../services/export.service";
import { createCsvTransformStream } from "../utils/export.utils";
import { pipeline } from "stream/promises";

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

/**
 * @desc Export Order Reports using True Streaming Architecture (Low Memory Footprint)
 * @route GET /api/v1/admin/analytics/export-orders
 */
export const exportOrderReport = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    // Getting Cursor and Transformer from Service
    const { mongooseCursor, transformer } = await exportService.getOrderExportStream(
        startDate as string,
        endDate as string
    );

    const fields = [
        'Order ID', 'Customer Name', 'Customer Email',
        'Total Price', 'Status', 'Address', 'City', 'Phone', 'Date'
    ];

    const csvStream = createCsvTransformStream(fields);

    // Setting Response Headers (To enable File Download)
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="order_report_${Date.now()}.csv"`);

    // Connecting Pipeline: DB > Format > CSV > Response
    try {
        await pipeline(
            mongooseCursor,
            transformer,
            csvStream,
            res
        );
    } catch (error) {
        console.error('Export Pipeline Failed:', error);

        if(!res.headersSent) {
            res.status(500).json({ message: 'Error generating export report' });
        } else {
            res.end();
        }
    }
});