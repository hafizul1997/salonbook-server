
import { Router } from "express";

import {
  getPublicServices,
  createService,
} from "../controllers/service.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Public API: Anyone can view active services.
router.get("/", getPublicServices);

// Admin API: Only authenticated admins can create services.
router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  createService
);

export default router;
