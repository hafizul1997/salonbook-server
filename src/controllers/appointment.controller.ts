
import { Request, Response } from "express";
import mongoose from "mongoose";

import Appointment from "../models/appointment.model.js";
import Service from "../models/service.model.js";

// Customer creates a new appointment.
export const createAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const {
      serviceId,
      appointmentDate,
      timeSlot,
      message,
    } = req.body;

    // Validate required fields.
    if (
      typeof serviceId !== "string" ||
      !mongoose.Types.ObjectId.isValid(serviceId) ||
      typeof appointmentDate !== "string" ||
      !appointmentDate.trim() ||
      typeof timeSlot !== "string" ||
      !timeSlot.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Valid service, date and time slot are required",
      });
      return;
    }

    // Validate appointment date.
    const selectedDate = new Date(appointmentDate);

    if (Number.isNaN(selectedDate.getTime())) {
      res.status(400).json({
        success: false,
        message: "Invalid appointment date",
      });
      return;
    }

    if (selectedDate.getTime() <= Date.now()) {
      res.status(400).json({
        success: false,
        message: "Appointment date must be in the future",
      });
      return;
    }

    // Check whether the selected service exists and is active.
    const service = await Service.findOne({
      _id: serviceId,
      status: "active",
    });

    if (!service) {
      res.status(404).json({
        success: false,
        message: "Active service not found",
      });
      return;
    }

    // Prevent duplicate active bookings for the same slot.
    const existingAppointment = await Appointment.findOne({
      serviceId,
      appointmentDate: selectedDate,
      timeSlot: timeSlot.trim(),
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingAppointment) {
      res.status(409).json({
        success: false,
        message: "This appointment slot is already booked",
      });
      return;
    }

    // Create appointment using the database service price.
    const appointment = await Appointment.create({
      serviceId,
      customerId,
      appointmentDate: selectedDate,
      timeSlot: timeSlot.trim(),
      message:
        typeof message === "string" ? message.trim() : "",
      servicePrice: service.price,
      paymentStatus: "unpaid",
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create appointment",
    });
  }
};

 // Customer views their own appointments.
export const getMyAppointments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const appointments = await Appointment.find({
      customerId,
    })
      .populate("serviceId", "serviceName category image")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Your appointments retrieved successfully",
      total: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("Get customer appointments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve your appointments",
    });
  }
};

 // Customer cancels their own pending appointment.
export const cancelMyAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const appointmentId = req.params.id;

    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      typeof appointmentId !== "string" ||
      !mongoose.Types.ObjectId.isValid(appointmentId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
      return;
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      customerId,
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
      return;
    }

    if (appointment.status !== "pending") {
      res.status(400).json({
        success: false,
        message: "Only pending appointments can be cancelled",
      });
      return;
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
    });
  }
};
