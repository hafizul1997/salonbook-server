import { Router, Request, Response } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Any authenticated user can access.
router.get(
  "/protected",
  authenticate,
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Authentication successful",
      user: req.user,
    });
  }
);

// Only admin can access.
router.get(
  "/admin-only",
  authenticate,
  authorizeRoles("admin"),
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Admin authorization successful",
      user: req.user,
    });
  }
);

export default router;