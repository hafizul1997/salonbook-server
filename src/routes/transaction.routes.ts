
import { Router } from "express";
import { getAllTransactions } from "../controllers/transaction.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Only authenticated admins can view all transactions
router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  getAllTransactions
);

export default router;
