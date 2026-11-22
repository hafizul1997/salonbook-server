
import { Router, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import {
  getAllUsers,
  updateUserBlockStatus,
  updateMyProfile,
  getMyProfile,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { auth } from "../config/auth.js";

const router = Router();

router.get("/", authenticate, authorizeRoles("admin"), getAllUsers);

router.patch("/:id/block", authenticate, authorizeRoles("admin"), updateUserBlockStatus);

router.post(
  "/admin/set-password",
  authenticate,
  authorizeRoles("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { newPassword } = req.body as { newPassword?: string };

      if (
        typeof newPassword !== "string" ||
        newPassword.length < 8 ||
        newPassword.length > 128
      ) {
        res.status(400).json({
          success: false,
          message: "Password must be between 8 and 128 characters",
        });
        return;
      }

     const session = await auth.api.getSession({
  headers: fromNodeHeaders(req.headers),
});

if (!session || session.user.id !== req.user?.id) {
  res.status(401).json({
    success: false,
    message: "Admin session verification failed. Please sign in again.",
  });
  return;
}

await auth.api.setPassword({
  body: { newPassword },
  headers: fromNodeHeaders(req.headers),
});

      res.status(200).json({
        success: true,
        message: "Admin password set successfully",
      });
    } catch (error) {
      console.error("Admin password setup failed:", error);

      res.status(401).json({
        success: false,
        message:
          "Password setup failed. Please sign in again with your Admin Google account.",
      });
    }
  }
);

router.patch(
  "/me/profile",
  authenticate,
  authorizeRoles("customer", "admin"),
  updateMyProfile
);

router.get(
  "/me",
  authenticate,
  authorizeRoles("customer", "admin"),
  getMyProfile
);

export default router;
