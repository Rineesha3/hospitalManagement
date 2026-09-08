import {
  updateUser,
  deleteUser,
  getAllUser,
  getSingleUser,
  getUserProfile,
  getMyAppointments,
  adminDeleteUser,
  adminSetUserActive,
  getUserDashboardSummary,
} from "../Controllers/userController.js";
import express from "express";
import { authenticate, restrict } from "../auth/verifytoken.js";
const router = express.Router();
router.get("/", authenticate, restrict(["admin"]), getAllUser);
router.delete("/admin/:id", authenticate, restrict(["admin"]), adminDeleteUser);
router.patch("/admin/:id/status", authenticate, restrict(["admin"]), adminSetUserActive);
router.get("/profile/me", authenticate, restrict(["patient"]), getUserProfile);
router.get("/dashboard-summary", authenticate, restrict(["patient"]), getUserDashboardSummary);
router.get(
  "/appointments/my-appointments",
  authenticate,
  restrict(["patient"]),
  getMyAppointments
);
router.get("/:id", authenticate, restrict(["patient"]), getSingleUser);
router.put("/:id", authenticate, restrict(["patient"]), updateUser);
router.delete("/:id", authenticate, restrict(["patient"]), deleteUser);

export default router;
