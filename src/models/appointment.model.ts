
import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // Better Auth manages customer accounts.
    // We store its user ID without creating another User model.
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

// Helps find appointments for a service, date and time.
appointmentSchema.index({
  serviceId: 1,
  appointmentDate: 1,
  timeSlot: 1,
  status: 1,
});

const Appointment =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);

export default Appointment;
