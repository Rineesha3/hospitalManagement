import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";
import { notify } from "./notificationController.js";
import { getAvailableSlotsForDate, normalizeDateToUTCMidnight } from "../utils/slotGenerator.js";

const TRANSITIONS = {
  doctor: {
    pending: ["confirmed", "rejected"],
    confirmed: ["completed", "no-show", "cancelled"],
  },
  patient: {
    pending: ["cancelled"],
    confirmed: ["cancelled"],
  },
};

const NOTIFY_MESSAGES = {
  confirmed: "Your appointment has been confirmed.",
  rejected: "Your appointment request was declined.",
  cancelled: "Your appointment has been cancelled.",
  completed: "Your appointment has been marked completed.",
  "no-show": "You were marked as a no-show for your appointment.",
};

const NOTIFY_TYPES = {
  confirmed: "booking_confirmed",
  rejected: "booking_rejected",
  cancelled: "booking_cancelled",
  completed: "booking_completed",
  "no-show": "booking_no_show",
};

export const getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) {
    return res.status(400).json({ success: false, message: "doctorId and date are required" });
  }
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    const slots = await getAvailableSlotsForDate(doctor, date);
    res.status(200).json({ success: true, message: "Available slots found", data: slots });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch available slots" });
  }
};

export const createBooking = async (req, res) => {
  const { doctorId, appointmentDate, startTime, endTime, consultationType } = req.body;
  if (!doctorId || !appointmentDate || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: "doctorId, appointmentDate, startTime and endTime are required",
    });
  }
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    if (doctor.isApproved !== "approved") {
      return res.status(400).json({
        success: false,
        message: "This doctor is not currently accepting appointments",
      });
    }

    const existingActiveBooking = await Booking.findOne({
      doctor: doctorId,
      user: req.userId,
      status: { $in: ["pending", "confirmed"] },
    });
    if (existingActiveBooking) {
      return res.status(400).json({
        success: false,
        message: "You already have an active appointment with this doctor. Cancel it before booking again.",
      });
    }

    const availableSlots = await getAvailableSlotsForDate(doctor, appointmentDate);
    if (!availableSlots.some((s) => s.startTime === startTime && s.endTime === endTime)) {
      return res.status(400).json({
        success: false,
        message: "This time slot is not available",
      });
    }

    const booking = await Booking.create({
      doctor: doctorId,
      user: req.userId,
      ticketPrice: String(doctor.ticketPrice ?? 0),
      appointmentDate: normalizeDateToUTCMidnight(appointmentDate),
      startTime,
      endTime,
      consultationType: consultationType === "video" ? "video" : "clinic",
    });

    await notify(
      doctor._id,
      "Doctor",
      "booking_created",
      "You have a new appointment request.",
      booking._id
    );

    res.status(200).json({
      success: true,
      message: "Appointment booked successfully",
      data: booking,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This slot was just booked, please pick another.",
      });
    }
    res.status(500).json({ success: false, message: "Failed to book appointment" });
  }
};

export const getDoctorBookings = async (req, res) => {
  try {
    const { status = "" } = req.query;
    const filter = { doctor: req.userId };
    if (status) filter.status = status;
    const bookings = await Booking.find(filter)
      .populate("user", "name email photo gender")
      .sort("-createdAt");
    res.status(200).json({ success: true, message: "Bookings found", data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

export const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const validStatuses = ["pending", "confirmed", "completed", "cancelled", "rejected", "no-show"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }
  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const isOwningDoctor = booking.doctor.toString() === req.userId;
    const isOwningPatient = booking.user.toString() === req.userId;

    if (req.role !== "admin") {
      if (req.role === "doctor" && !isOwningDoctor) {
        return res.status(403).json({ success: false, message: "You're not authorized" });
      }
      if (req.role === "patient" && !isOwningPatient) {
        return res.status(403).json({ success: false, message: "You're not authorized" });
      }

      const allowed = TRANSITIONS[req.role]?.[booking.status] || [];
      if (!allowed.includes(status)) {
        return res.status(403).json({
          success: false,
          message: `You cannot move a ${booking.status} booking to ${status}`,
        });
      }

      if (["completed", "no-show"].includes(status)) {
        const slotEnd = new Date(booking.appointmentDate);
        const [h, m] = booking.endTime.split(":").map(Number);
        slotEnd.setUTCHours(h, m, 0, 0);
        if (slotEnd.getTime() > Date.now()) {
          return res.status(400).json({
            success: false,
            message: "This appointment hasn't ended yet",
          });
        }
      }
    }

    booking.status = status;
    if (["cancelled", "rejected"].includes(status) && reason) {
      booking.cancellationReason = reason;
    }
    await booking.save();

    if (NOTIFY_MESSAGES[status]) {
      await notify(booking.user, "User", NOTIFY_TYPES[status], NOTIFY_MESSAGES[status], booking._id);
    }

    res.status(200).json({ success: true, message: "Booking updated", data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update booking" });
  }
};

export const rescheduleBooking = async (req, res) => {
  const { id } = req.params;
  const { appointmentDate, startTime, endTime } = req.body;
  if (!appointmentDate || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: "appointmentDate, startTime and endTime are required",
    });
  }
  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "You're not authorized" });
    }
    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending appointments can be rescheduled",
      });
    }

    const doctor = await Doctor.findById(booking.doctor);
    const availableSlots = await getAvailableSlotsForDate(doctor, appointmentDate);
    if (!availableSlots.some((s) => s.startTime === startTime && s.endTime === endTime)) {
      return res.status(400).json({ success: false, message: "This time slot is not available" });
    }

    booking.appointmentDate = normalizeDateToUTCMidnight(appointmentDate);
    booking.startTime = startTime;
    booking.endTime = endTime;
    await booking.save();
    res.status(200).json({ success: true, message: "Appointment rescheduled", data: booking });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This slot was just booked, please pick another.",
      });
    }
    res.status(500).json({ success: false, message: "Failed to reschedule appointment" });
  }
};

export const getAllBookingsAdmin = async (req, res) => {
  try {
    const { status = "", page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("doctor", "name specialization email")
        .populate("user", "name email")
        .sort("-createdAt")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Bookings found",
      data: bookings,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};
