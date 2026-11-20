
import { Router } from "express";

import {
  createAppointment,
  getMyAppointments,
  cancelMyAppointment,
  getAllAppointmentsForAdmin,
  confirmAppointment,
  adminCancelAppointment,
} from "../controllers/appointment.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Customer creates a new appointment.
router.post(
  "/",
  authenticate,
  authorizeRoles("customer"),
  createAppointment
);

// Customer views their own appointments.
router.get(
  "/my",
  authenticate,
  authorizeRoles("customer"),
  getMyAppointments
);

// Customer cancels their own pending appointment.
router.patch(
  "/:id/cancel",
  authenticate,
  authorizeRoles("customer"),
  cancelMyAppointment
);

// Admin views all customer appointments.
router.get(
  "/admin/all",
  authenticate,
  authorizeRoles("admin"),
  getAllAppointmentsForAdmin
);

// Admin confirms a pending appointment.
router.patch(
  "/admin/:id/confirm",
  authenticate,
  authorizeRoles("admin"),
  confirmAppointment
);

// Admin cancels a pending or confirmed appointment.
router.patch(
  "/admin/:id/cancel",
  authenticate,
  authorizeRoles("admin"),
  adminCancelAppointment
);

export default router;
