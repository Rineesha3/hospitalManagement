import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticketPrice: { type: String, required: true },
    appointmentDate: {
      type: Date,
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    consultationType: {
      type: String,
      enum: ["clinic", "video"],
      default: "clinic",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "rejected", "no-show"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index(
  { doctor: 1, appointmentDate: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: { $nin: ["cancelled", "rejected"] } } }
);

export default mongoose.model("Booking", bookingSchema);
