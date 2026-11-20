
import mongoose, { Schema } from "mongoose";

const serviceSchema = new Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0.01,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Service =
  mongoose.models.Service ||
  mongoose.model("Service", serviceSchema);

export default Service;
