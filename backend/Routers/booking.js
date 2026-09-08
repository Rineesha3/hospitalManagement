import express from "express";
import {
  createBooking,
  getDoctorBookings,
  updateBookingStatus,
  rescheduleBooking,
  getAllBookingsAdmin,
  getAvailableSlots,
} from "../Controllers/bookingController.js";
import { getReviewableBookings } from "../Controllers/reviewController.js";
import { authenticate, restrict } from "../auth/verifytoken.js";
const router = express.Router();

router.get("/available-slots", getAvailableSlots);
router.get("/reviewable/:doctorId", authenticate, restrict(["patient"]), getReviewableBookings);
router.post("/", authenticate, restrict(["patient"]), createBooking);
router.get("/doctor/my", authenticate, restrict(["doctor"]), getDoctorBookings);
router.get("/admin/all", authenticate, restrict(["admin"]), getAllBookingsAdmin);
router.patch("/:id/status", authenticate, restrict(["doctor", "patient", "admin"]), updateBookingStatus);
router.patch("/:id/reschedule", authenticate, restrict(["patient"]), rescheduleBooking);

export default router;
