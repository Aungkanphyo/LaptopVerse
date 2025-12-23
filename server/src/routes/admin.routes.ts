import { Router } from "express";
import { getDashboardOverview } from "../controllers/admin.controller";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

router.get('/dashboard-stats', protect, authorize('admin'), getDashboardOverview);

export default router;