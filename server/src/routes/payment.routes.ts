import { Router } from "express";
import { getPublicManualPaymentInfo } from "../controllers/manualPaymentSettings.controller";

const router = Router();

router.route('/manual-info').get(getPublicManualPaymentInfo);

export default router;