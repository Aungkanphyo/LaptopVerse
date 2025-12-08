import { Router } from "express";
import { createNewProduct, deleteProduct, getAllProducts, getSingleProduct, updateProduct, createProductReview, getProductReviews, deleteReview } from "../controllers/product.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

// Public Routes (Users can view products)
// GET /api/v1/products (A route that includes Filtering, Searching, and Pagination)
router.route('/').get(getAllProducts);

router.route('/reviews').get(getProductReviews);

// GET /api/v1/products/:id (Single Product View)
router.route('/:id').get(getSingleProduct);

// User Routes
router.route('/review').put(protect, createProductReview); // Only logged-in users can leave a review

// DELETE /api/v1/products/reviews (Review ဖျက်ခြင်း)
router.route('/reviews').delete(protect, deleteReview);

// Admin/Manager Routes (Protected Routes for CRUD operations)

router
    .route('/admin')
    .post(
        protect,
        authorize('admin', 'manager'),
        upload.array('images', 5),
        createNewProduct,
    );

// POST /api/v1/products/admin (Product Create)
// PUT/DELETE /api/v1/products/admin/:id (Product Update/Delete)
router
    .route('/admin/:id')
    .put(
        protect, 
        authorize('admin', 'manager'), 
        upload.array('images', 5), 
        updateProduct
    )
    .delete(protect, authorize('admin'), deleteProduct);

export default router;