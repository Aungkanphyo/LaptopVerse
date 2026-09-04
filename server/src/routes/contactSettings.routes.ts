import { Router } from "express";
import { getContactSettings } from "../controllers/contactSettings.controller";

const router = Router();

router.get("/", getContactSettings);

export default router;