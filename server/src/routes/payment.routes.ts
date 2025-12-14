import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { processPayment, sendStripeApiKey } from "../controllers/payment.controller";

const router = Router();

router.route('/process').post(protect, processPayment);
router.route('/stripeapikey').get(protect, sendStripeApiKey);

export default router;