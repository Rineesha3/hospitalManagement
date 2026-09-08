import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import Contact from "../models/ContactSchema.js";

export const getStats = async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      pendingDoctors,
      approvedDoctors,
      rejectedDoctors,
      suspendedDoctors,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      rejectedBookings,
      noShowBookings,
      unreadContacts,
    ] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      Doctor.countDocuments({}),
      Doctor.countDocuments({ isApproved: "pending" }),
      Doctor.countDocuments({ isApproved: "approved" }),
      Doctor.countDocuments({ isApproved: "rejected" }),
      Doctor.countDocuments({ isApproved: "suspended" }),
      Booking.countDocuments({}),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.countDocuments({ status: "rejected" }),
      Booking.countDocuments({ status: "no-show" }),
      Contact.countDocuments({}),
    ]);

    const revenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: { $toDouble: "$ticketPrice" } } } },
    ]);

    const recentBookings = await Booking.find({})
      .sort("-createdAt")
      .limit(5)
      .populate("doctor", "name specialization")
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      message: "Stats found",
      data: {
        totalPatients,
        totalDoctors,
        pendingDoctors,
        approvedDoctors,
        rejectedDoctors,
        suspendedDoctors,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        rejectedBookings,
        noShowBookings,
        totalContactMessages: unreadContacts,
        totalRevenue: revenueAgg[0]?.total || 0,
        recentBookings,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load stats" });
  }
};
