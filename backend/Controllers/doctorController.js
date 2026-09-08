import bcrypt from "bcryptjs";
import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Review from "../models/ReviewSchema.js";
import Notification from "../models/NotificationSchema.js";
import { notify } from "./notificationController.js";
import { getEarliestAvailableSlot } from "../utils/slotGenerator.js";

const cascadeDeleteDoctorData = async (doctorId) => {
  const bookings = await Booking.find({ doctor: doctorId }).select("_id");
  const bookingIds = bookings.map((b) => b._id);
  await Promise.all([
    Booking.deleteMany({ doctor: doctorId }),
    Review.deleteMany({ doctor: doctorId }),
    Notification.deleteMany({
      $or: [{ recipient: doctorId }, { booking: { $in: bookingIds } }],
    }),
  ]);
};

const ALLOWED_DOCTOR_FIELDS = [
  "name",
  "phone",
  "photo",
  "bio",
  "about",
  "specialization",
  "ticketPrice",
  "qualifications",
  "experiences",
  "timeSlots",
  "gender",
  "password",
];

const sanitizeDoctorUpdate = async (body) => {
  const updateFields = {};
  for (const field of ALLOWED_DOCTOR_FIELDS) {
    if (body[field] !== undefined) updateFields[field] = body[field];
  }
  if (updateFields.password) {
    if (updateFields.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    const salt = await bcrypt.genSalt(10);
    updateFields.password = await bcrypt.hash(updateFields.password, salt);
  } else {
    delete updateFields.password;
  }
  return updateFields;
};

export const updatedDoctor = async (req, res) => {
  const id = req.params.id;
  if (id !== req.userId) {
    return res.status(403).json({ success: false, message: "You're not authorized" });
  }

  try {
    const { currentPassword, newPassword, ...rest } = req.body;
    const body = { ...rest };
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Current password is required" });
      }
      const existingDoctor = await Doctor.findById(id);
      const isMatch = existingDoctor && (await bcrypt.compare(currentPassword, existingDoctor.password));
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }
      body.password = newPassword;
    }
    const updateFields = await sanitizeDoctorUpdate(body);
    if (req.file) {
      updateFields.photo = req.file.filename;
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).select("-password");
    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updatedDoctor,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || "Failed to update" });
  }
};


export const deletedDoctor = async (req, res) => {
  const id = req.params.id;
  if (id !== req.userId) {
    return res.status(403).json({ success: false, message: "You're not authorized" });
  }
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(id);
    if (deletedDoctor) {
      await cascadeDeleteDoctorData(id);
    }
    res.status(200).json({
      success: true,
      message: "Deleted successfully",
      data: deletedDoctor,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete" });
  }
};
export const getSingleDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    const doctor = await Doctor.findById(id)
      .populate("reviews")
      .select("-password");
    res
      .status(200)
      .json({ success: true, message: "Doctor found", data: doctor });
  } catch (err) {
    res.status(404).json({ success: false, message: "No doctor found" });
  }
};
export const getAllDoctor = async (req, res) => {
  try {
    const {
      query,
      specialization,
      minRating,
      minPrice,
      maxPrice,
      gender,
      sort = "rating_desc",
      page = 1,
      limit = 20,
    } = req.query;

    const conditions = [{ isApproved: "approved" }];
    if (query) {
      conditions.push({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { specialization: { $regex: query, $options: "i" } },
        ],
      });
    }
    if (specialization) {
      conditions.push({ specialization: { $regex: `^${specialization}$`, $options: "i" } });
    }
    if (gender) conditions.push({ gender });
    if (minRating) conditions.push({ averageRating: { $gte: Number(minRating) } });
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      conditions.push({ ticketPrice: priceFilter });
    }
    const filter = { $and: conditions };

    if (sort === "earliest_available") {
      const candidates = await Doctor.find(filter).select("-password").limit(100);
      const withSlots = await Promise.all(
        candidates.map(async (doc) => ({ doctor: doc, next: await getEarliestAvailableSlot(doc) }))
      );
      withSlots.sort((a, b) => {
        if (!a.next && !b.next) return 0;
        if (!a.next) return 1;
        if (!b.next) return -1;
        return a.next.date === b.next.date
          ? a.next.startTime.localeCompare(b.next.startTime)
          : a.next.date.localeCompare(b.next.date);
      });
      const data = withSlots
        .slice(0, 20)
        .map(({ doctor, next }) => ({ ...doctor.toObject(), nextAvailableSlot: next }));
      return res.status(200).json({ success: true, message: "Doctors found", data });
    }

    const sortMap = {
      rating_desc: { averageRating: -1 },
      price_asc: { ticketPrice: 1 },
      price_desc: { ticketPrice: -1 },
    };
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));

    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .select("-password")
        .sort(sortMap[sort] || sortMap.rating_desc)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Doctor.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Doctors found",
      data: doctors,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Not found" });
  }
};

export const getDoctorDashboardSummary = async (req, res) => {
  const doctorId = req.userId;
  try {
    const doctor = await Doctor.findById(doctorId).select("averageRating totalRating");
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    const [todaysAppointments, pendingCount, completedCount, revenueAgg] = await Promise.all([
      Booking.find({
        doctor: doctorId,
        appointmentDate: { $gte: todayStart, $lt: todayEnd },
        status: { $in: ["confirmed", "pending"] },
      })
        .populate("user", "name photo")
        .sort("startTime"),
      Booking.countDocuments({ doctor: doctorId, status: "pending" }),
      Booking.countDocuments({ doctor: doctorId, status: "completed" }),
      Booking.aggregate([
        { $match: { doctor: doctor._id, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: { $toDouble: "$ticketPrice" } } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      message: "Dashboard summary found",
      data: {
        todaysAppointments,
        pendingCount,
        completedCount,
        revenue: revenueAgg[0]?.total || 0,
        averageRating: doctor.averageRating,
        totalRating: doctor.totalRating,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load dashboard summary" });
  }
};

export const getDoctorProfile = async (req, res) => {
  const doctorId = req.userId;
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    const appointments = await Booking.find({ doctor: doctorId })
      .populate("user", "name email photo gender")
      .sort({ appointmentDate: -1, startTime: -1 });
    const { password, ...rest } = doctor._doc;
    res.status(200).json({
      success: true,
      message: "Profile info is getting",
      data: { ...rest, appointments },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong,cannot get" });
  }
};
export const getAllDoctorsAdmin = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      filter.isApproved = status;
    }
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));

    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .select("-password")
        .sort("-createdAt")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Doctor.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Doctors found",
      data: doctors,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Not found" });
  }
};

export const approveDoctor = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  if (!["approved", "rejected", "pending", "suspended"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { isApproved: status },
      { new: true }
    ).select("-password");
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (status === "approved") {
      await notify(doctor._id, "Doctor", "doctor_approved", "Congratulations! Your doctor registration has been approved.");
    } else if (status === "rejected") {
      await notify(doctor._id, "Doctor", "doctor_rejected", "Your doctor registration was rejected. Please contact support for details.");
    } else if (status === "suspended") {
      await notify(doctor._id, "Doctor", "doctor_suspended", "Your doctor account has been suspended by an administrator.");
    }

    res.status(200).json({
      success: true,
      message: "Doctor status updated",
      data: doctor,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update doctor status" });
  }
};

export const adminDeleteDoctor = async (req, res) => {
  try {
    const deleted = await Doctor.findByIdAndDelete(req.params.id).select("-password");
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    await cascadeDeleteDoctorData(req.params.id);
    res.status(200).json({ success: true, message: "Doctor deleted", data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete doctor" });
  }
};

export const updateDoctorProfile = async (req, res) => {
  const doctorId = req.userId;

  try {
    const { currentPassword, newPassword, ...rest } = req.body;
    const body = { ...rest };
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Current password is required" });
      }
      const existingDoctor = await Doctor.findById(doctorId);
      const isMatch = existingDoctor && (await bcrypt.compare(currentPassword, existingDoctor.password));
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }
      body.password = newPassword;
    }
    const updateFields = await sanitizeDoctorUpdate(body);
    if (req.file) {
      updateFields.photo = req.file.filename;
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      data: updatedDoctor,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Failed to update doctor profile",
    });
  }
};
