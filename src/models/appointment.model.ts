
import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // Better Auth manages customer accounts.
    customerId: {
      type: String,
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    timeSlot: {
      type: String,
      required: true,
      trim: true,
    },

    // Unique key for reserving a date and time slot globally.
    slotKey: {
      type: String,
      trim: true,
    },

    message: {
      type: String,
      trim: true,
      default: "",
    },

    servicePrice: {
      type: Number,
      required: true,
      min: 0.01,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Existing appointment lookup index.
appointmentSchema.index({
  serviceId: 1,
  appointmentDate: 1,
  timeSlot: 1,
  status: 1,
});

// Prevent duplicate active slot keys.
appointmentSchema.index(
  { slotKey: 1 },
  { unique: true, sparse: true }
);

const Appointment =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);

export default Appointment;
