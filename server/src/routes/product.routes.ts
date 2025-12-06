import { Router } from "express";
import { createNewProduct, deleteProduct, getAllProducts, getSingleProduct, updateProduct } from "../controllers/product.controller";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

// Public Routes (Users can view products)
// GET /api/v1/products (A route that includes Filtering, Searching, and Pagination)
router.route('/').get(getAllProducts);
// GET /api/v1/products/:id (Single Product View)
router.route('/:id').get(getSingleProduct);

// Admin/Manager Routes (Protected Routes for CRUD operations)
router.use(protect); // User login is required for all the following routes.

// POST /api/v1/products/admin (Product Create)
// PUT/DELETE /api/v1/products/admin/:id (Product Update/Delete)
router
    .route('/admin/:id')
    .put(authorize('admin', 'manager'), updateProduct)
    .delete(authorize('admin'), deleteProduct);

router
    .route('/admin')
    .post(authorize('admin', 'manager'), createNewProduct);

export default router;