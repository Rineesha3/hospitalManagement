import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/UserSchema.js";
import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Review from "../models/ReviewSchema.js";
import Notification from "../models/NotificationSchema.js";

const HISTORY_STATUSES = ["completed", "no-show"];
const CANCELLED_STATUSES = ["cancelled", "rejected"];

const ALLOWED_USER_FIELDS = ["name", "photo", "gender", "bloodType", "password"];

const cascadeDeleteUserData = async (userId) => {
  const bookings = await Booking.find({ user: userId }).select("_id");
  const bookingIds = bookings.map((b) => b._id);
  const affectedDoctorIds = await Review.find({ user: userId }).distinct("doctor");

  await Promise.all([
    Booking.deleteMany({ user: userId }),
    Review.deleteMany({ user: userId }),
    Notification.deleteMany({
      $or: [{ recipient: userId }, { booking: { $in: bookingIds } }],
    }),
  ]);

  await Promise.all(affectedDoctorIds.map((doctorId) => Review.calcAverageRatings(doctorId)));
};

const sanitizeUserUpdate = async (body) => {
  const updateFields = {};
  for (const field of ALLOWED_USER_FIELDS) {
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

export const updateUser = async (req, res) => {
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
      const existingUser = await User.findById(id);
      const isMatch = existingUser && (await bcrypt.compare(currentPassword, existingUser.password));
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }
      body.password = newPassword;
    }
    const updateFields = await sanitizeUserUpdate(body);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).select("-password");
    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || "Failed to update" });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  if (id !== req.userId) {
    return res.status(403).json({ success: false, message: "You're not authorized" });
  }
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (deletedUser) {
      await cascadeDeleteUserData(id);
    }
    res.status(200).json({
      success: true,
      message: "Deleted successfully",
      data: deletedUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete" });
  }
};
export const getSingleUser = async (req, res) => {
  const id = req.params.id;
  if (id !== req.userId) {
    return res.status(403).json({ success: false, message: "You're not authorized" });
  }
  try {
    const user = await User.findById(id).select("-password");
    res.status(200).json({ success: true, message: "User found", data: user });
  } catch (err) {
    res.status(404).json({ success: false, message: "No user found" });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort("-createdAt")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Users found",
      data: users,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Not found" });
  }
};

export const adminDeleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id).select("-password");
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    await cascadeDeleteUserData(req.params.id);
    res.status(200).json({ success: true, message: "User deleted", data: deletedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

export const adminSetUserActive = async (req, res) => {
  const { isActive } = req.body;
  if (typeof isActive !== "boolean") {
    return res.status(400).json({ success: false, message: "isActive must be true or false" });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "suspended"}`,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update user status" });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const { password, ...rest } = user._doc;
    res.status(200).json({
      success: true,
      message: "Profile info is getting",
      data: { ...rest },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong,cannot get" });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate("doctor", "name specialization photo ticketPrice email")
      .sort({ appointmentDate: -1, startTime: -1 });
    res.status(200).json({
      success: true,
      message: "Appointments are getting",
      data: bookings,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong,cannot get" });
  }
};

export const getUserDashboardSummary = async (req, res) => {
  const userId = req.userId;
  try {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const [nextAppointment, statusCounts, previousDoctorIds] = await Promise.all([
      Booking.findOne({
        user: userId,
        status: { $in: ["pending", "confirmed"] },
        appointmentDate: { $gte: todayStart },
      })
        .sort({ appointmentDate: 1, startTime: 1 })
        .populate("doctor", "name specialization photo ticketPrice"),
      Booking.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Booking.find({ user: userId, status: "completed" }).distinct("doctor"),
    ]);

    let upcomingCount = 0;
    let historyCount = 0;
    let cancelledCount = 0;
    for (const { _id: status, count } of statusCounts) {
      if (["pending", "confirmed"].includes(status)) upcomingCount += count;
      else if (HISTORY_STATUSES.includes(status)) historyCount += count;
      else if (CANCELLED_STATUSES.includes(status)) cancelledCount += count;
    }

    const previousDoctors = await Doctor.find({ _id: { $in: previousDoctorIds } }).select(
      "name specialization photo averageRating"
    );

    res.status(200).json({
      success: true,
      message: "Dashboard summary found",
      data: { nextAppointment, upcomingCount, historyCount, cancelledCount, previousDoctors },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load dashboard summary" });
  }
};
