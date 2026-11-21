import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.post(
  "/image",
  authenticate,
  authorizeRoles("admin", "customer"),
  upload.single("image"),
  uploadImage
);

export default router;
