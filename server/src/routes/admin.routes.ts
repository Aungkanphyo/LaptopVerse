import { Router } from "express";
import { getAllUsersList, getDashboardOverview, updateUserRole, updateUserStatus } from "../controllers/admin.controller";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

router.use(protect, authorize('admin'));

// GET /api/v1/admin/dashboard-stats
router.get('/dashboard-stats', getDashboardOverview);

// GET /api/v1/admin/users
router.get('/users', getAllUsersList);

// User Management Routes
router.put('/users/:id/role', updateUserRole);
router.put('users/:id/status', updateUserStatus);

export default router;