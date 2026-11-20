
import { Router } from "express";

import {
  getPublicServices,
  createService,
  getAllServicesForAdmin,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Public: Anyone can view active services.
router.get("/", getPublicServices);

// Admin: Create a new service.
router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  createService
);

// Admin: View all services.
router.get(
  "/admin/all",
  authenticate,
  authorizeRoles("admin"),
  getAllServicesForAdmin
);

// Admin: Update a service.
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  updateService
);

// Admin: Delete a service.
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  deleteService
);

export default router;
