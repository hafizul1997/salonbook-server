
import { Router } from "express";

import {
  getAllUsers,
  updateUserBlockStatus,
} from "../controllers/user.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Admin: View all users.
router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  getAllUsers
);

// Admin: Block or unblock a customer.
router.patch(
  "/:id/block",
  authenticate,
  authorizeRoles("admin"),
  updateUserBlockStatus
);

export default router;
