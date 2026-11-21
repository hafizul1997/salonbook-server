
import { Router } from "express";
import { createCheckoutSession } from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Only authenticated customers can create checkout sessions.
router.post(
  "/create-checkout-session",
  authenticate,
  authorizeRoles("customer"),
  createCheckoutSession
);

export default router;
