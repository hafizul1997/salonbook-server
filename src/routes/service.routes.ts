
import { Router } from "express";
import { getPublicServices } from "../controllers/service.controller";

const router = Router();

router.get("/", getPublicServices);

export default router;
