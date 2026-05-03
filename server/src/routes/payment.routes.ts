import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { processPayment, sendStripeApiKey } from "../controllers/payment.controller";
import { getPublicManualPaymentInfo } from "../controllers/manualPaymentSettings.controller";

const router = Router();

router.route('/manual-info').get(getPublicManualPaymentInfo);
router.route('/process').post(protect, processPayment);
router.route('/stripeapikey').get(protect, sendStripeApiKey);

export default router;