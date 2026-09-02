import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import { deleteOrder, getAllOrders, getSingleOrder, myOrders, newOrder, updateOrder, verifyPayment } from "../controllers/order.controller";

const router = Router();

// User Routes
router.route('/new').post(protect, newOrder); // POST /api/v1/orders/new
router.route('/my/orders').get(protect, myOrders); // GET /api/v1/orders/my/orders

// Admin Routes
router.route('/admin/all').get(protect, authorize('admin'), getAllOrders); // GET /api/v1/orders/admin/all

// Payment verification admin route
router.route('/admin/:id/verify-payment').put(protect, authorize('admin'), verifyPayment);

router
    .route('/admin/:id')
    .put(protect, authorize('admin'), updateOrder)   // PUT /api/v1/orders/admin/:id (Update Status)
    .delete(protect, authorize('admin'), deleteOrder);          // DELETE /api/v1/orders/admin/:id

router.route('/:id').get(protect, getSingleOrder); // GET /api/v1/orders/:id


export default router;
