import { Router } from "express";
import { getAllUsersList, getDashboardOverview, updateUserRole, updateUserStatus } from "../controllers/admin.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { auditLogger } from "../middlewares/auditLogger.middleware";
import * as couponController from "../controllers/coupon.controller";
import * as analyticsController from "../controllers/analytics.controller";
import * as activityLogController from "../controllers/activityLog.controller";
import { exportLimiter } from '../middlewares/rateLimiter.middleware';
import * as categoryController from "../controllers/category.controller";
import * as brandController from "../controllers/brand.controller";

const router = Router();

// Global middlewares for all admin routes
router.use(protect, authorize('admin'), auditLogger); // Apply middlewares to all admin routes

// GET /api/v1/admin/dashboard-stats
router.get('/dashboard-stats', getDashboardOverview);

// GET /api/v1/admin/users
router.get('/users', getAllUsersList);

// User Management Routes
router.put('/users/:id/role', updateUserRole);
router.put('users/:id/status', updateUserStatus);

// Coupon Management Routes
router.route('/coupons')
    .get(couponController.getAllCoupons) // Get all coupons with advanced filtering
    .post(couponController.createCoupon); // Create new coupon

router.route('/coupons/:id')
    .put(couponController.updateCoupon) // Update coupon details
    .delete(couponController.deleteCoupon); // Delete coupon

// Analytics & Reporting
router.get('/analytics/dashboard', analyticsController.getDashboardOverview);

// CSV Export Route
router.get('/analytics/export-orders', exportLimiter, analyticsController.exportOrderReport);

// Activity Logs (Audit Trail)
router.get('/activity-logs', activityLogController.getActivityLogs); // Get activity logs with filtering and pagination

router.post('/categories', categoryController.createCategory);
router.post('/brands', brandController.createBrand);

export default router;