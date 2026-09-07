import { Router } from "express";
import { getPublishedGuides, getGuideBySlug, getAllGuidesAdmin, getGuideByIdAdmin, createGuide, updateGuide, deleteGuide } from "../controllers/guide.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.get("/admin/all", protect, authorize("admin", "manager"), getAllGuidesAdmin);

router
  .route("/admin")
  .post(
    protect,
    authorize("admin", "manager"),
    upload.single("image"), // Single Image Upload
    createGuide
  );

router
  .route("/admin/:id")
  .get(protect, authorize("admin", "manager"), getGuideByIdAdmin)
  .put(
    protect,
    authorize("admin", "manager"),
    upload.single("image"), // Single Image Upload
    updateGuide
  )
  .delete(protect, authorize("admin"), deleteGuide);

router.get("/", getPublishedGuides);
router.get("/:slug", getGuideBySlug);

export default router;