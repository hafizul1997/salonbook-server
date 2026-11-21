
import { Router } from "express";
import {
  getAllUsers,
  updateUserBlockStatus,
  updateMyProfile,
  getMyProfile,
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
// Admin and Customer: Update own profile.
router.patch(
  "/me/profile",
  authenticate,
  authorizeRoles("customer", "admin"),
  updateMyProfile
);
// Admin and Customer: Get own profile.
router.get(
  "/me",
  authenticate,
  authorizeRoles("customer", "admin"),
  getMyProfile
);
export default router;
