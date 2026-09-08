import express from "express";
import { getStats } from "../Controllers/adminController.js";
import { authenticate, restrict } from "../auth/verifytoken.js";
const router = express.Router();

router.get("/stats", authenticate, restrict(["admin"]), getStats);

export default router;
