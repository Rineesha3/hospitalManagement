import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Types.ObjectId,
      required: true,
      refPath: "recipientModel",
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ["User", "Doctor"],
    },
    type: {
      type: String,
      enum: [
        "booking_created",
        "booking_confirmed",
        "booking_rejected",
        "booking_cancelled",
        "booking_completed",
        "booking_no_show",
        "doctor_approved",
        "doctor_rejected",
        "doctor_suspended",
      ],
      required: true,
    },
    message: { type: String, required: true },
    booking: { type: mongoose.Types.ObjectId, ref: "Booking" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
