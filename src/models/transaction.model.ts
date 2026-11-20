
import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    // Better Auth user ID
    customerId: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    currency: {
      type: String,
      required: true,
      lowercase: true,
      default: "usd",
    },

    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["paid", "failed"],
      default: "failed",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

export default Transaction;
