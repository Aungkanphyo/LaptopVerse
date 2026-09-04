import { Router } from "express";
import { getPublishedGuides, getGuideBySlug } from "../controllers/guide.controller";

const router = Router();

router.get("/", getPublishedGuides);
router.get("/:slug", getGuideBySlug);

export default router;