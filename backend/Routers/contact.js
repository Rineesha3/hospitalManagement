import express from "express";
import { createContactMessage, getAllContactMessages } from "../Controllers/contactController.js";
import { authenticate, restrict } from "../auth/verifytoken.js";
const router = express.Router();

router.post("/", createContactMessage);
router.get("/", authenticate, restrict(["admin"]), getAllContactMessages);

export default router;
