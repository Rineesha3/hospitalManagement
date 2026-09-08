import express from "express";
import { getPublicStats } from "../Controllers/statsController.js";
const router = express.Router();

router.get("/public", getPublicStats);

export default router;
