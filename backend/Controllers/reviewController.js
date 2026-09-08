import Review from "../models/ReviewSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId });
    res
      .status(200)
      .json({ success: true, message: "Successful", data: reviews });
  } catch (error) {
    res.status(404).json({ success: false, message: "Not found" });
  }
};

export const getReviewableBookings = async (req, res) => {
  const { doctorId } = req.params;
  try {
    const completedBookings = await Booking.find({
      doctor: doctorId,
      user: req.userId,
      status: "completed",
    }).select("_id appointmentDate startTime");

    const reviewedBookingIds = new Set(
      (await Review.find({ booking: { $in: completedBookings.map((b) => b._id) } }).select("booking")).map((r) =>
        r.booking.toString()
      )
    );

    const reviewable = completedBookings.filter((b) => !reviewedBookingIds.has(b._id.toString()));
    res.status(200).json({ success: true, message: "Reviewable bookings found", data: reviewable });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch reviewable bookings" });
  }
};

export const createReview = async (req, res) => {
  const doctorId = req.params.doctorId;
  const { bookingId, rating, reviewText } = req.body;
  if (!bookingId) {
    return res.status(400).json({ success: false, message: "bookingId is required" });
  }
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "You're not authorized" });
    }
    if (booking.doctor.toString() !== doctorId) {
      return res.status(400).json({ success: false, message: "Booking does not belong to this doctor" });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "You can only review a completed appointment" });
    }

    const savedReview = await new Review({
      doctor: doctorId,
      user: req.userId,
      booking: bookingId,
      rating,
      reviewText,
    }).save();

    await Doctor.findByIdAndUpdate(doctorId, {
      $push: { reviews: savedReview._id },
    });
    res
      .status(200)
      .json({ success: true, message: "Review submitted", data: savedReview });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "You already reviewed this appointment" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};
