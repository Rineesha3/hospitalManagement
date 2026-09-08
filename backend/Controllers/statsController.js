import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";

export const getPublicStats = async (req, res) => {
  try {
    const [consultationsCompleted, patientsServed, licensedDoctors] = await Promise.all([
      Booking.countDocuments({ status: "completed" }),
      User.countDocuments({ role: "patient" }),
      Doctor.countDocuments({ isApproved: "approved" }),
    ]);

    res.status(200).json({
      success: true,
      message: "Public stats found",
      data: { consultationsCompleted, patientsServed, licensedDoctors },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load stats" });
  }
};
