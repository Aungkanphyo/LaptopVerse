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
import { manualPaymentSettingsSchema, validate } from "../middlewares/validation";
import { getManualPaymentSettingsAdmin, updateManualPaymentSettingsAdmin } from "../controllers/manualPaymentSettings.controller";

const router = Router();

// Global middlewares for all admin routes
router.use(protect, authorize('admin'), auditLogger); // Apply middlewares to all admin routes

// GET /api/v1/admin/dashboard-stats
router.get('/dashboard-stats', getDashboardOverview);

// GET /api/v1/admin/users
router.get('/users', getAllUsersList);

// User Management Routes
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);

// Coupon Management Routes
router.get('/coupons', couponController.getAllCoupons); // Get all coupons with advanced filtering
router.post('/coupons', couponController.createCoupon); // Create new coupon

router.put('/coupons/:id', couponController.updateCoupon); // Update coupon details
router.delete('/coupons/:id', couponController.deleteCoupon); // Delete coupon

// Analytics & Reporting
router.get('/analytics/dashboard', analyticsController.getDashboardOverview);

// CSV Export Route
router.get('/analytics/export-orders', exportLimiter, analyticsController.exportOrderReport);

// Activity Logs (Audit Trail)
router.get('/activity-logs', activityLogController.getActivityLogs); // Get activity logs with filtering and pagination

router.post('/categories', categoryController.createCategory);
router.post('/brands', brandController.createBrand);

// Manual Payment Settings (KPay / AYA Pay / Wave / etc.)
router.get('/manual-payment', getManualPaymentSettingsAdmin);
router.put('/manual-payment', validate(manualPaymentSettingsSchema), updateManualPaymentSettingsAdmin);

// Category Routes
router.get('/categories', categoryController.getAllCategoriesAdmin);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.patch('/categories/:id/toggle-status', categoryController.toggleCategoryStatus);

// Brand Routes
router.get('/brands', brandController.getAllBrandsAdmin);
router.post('/brands', brandController.createBrand);
router.put('/brands/:id', brandController.updateBrand);
router.patch('/brands/:id/toggle-status', brandController.toggleBrandStatus);

export default router;