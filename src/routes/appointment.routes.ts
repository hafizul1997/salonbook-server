
import { Router } from "express";

import {
  createAppointment,
  getMyAppointments,
  cancelMyAppointment,
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

export default router;
