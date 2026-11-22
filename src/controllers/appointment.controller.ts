
import { Request, Response } from "express";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

import Appointment from "../models/appointment.model.js";
import Service from "../models/service.model.js";
import { mongoDb } from "../config/mongo.js";

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

    const { serviceId, appointmentDate, timeSlot, message } = req.body;

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

    const appointment = await Appointment.create({
      serviceId,
      customerId,
      appointmentDate: selectedDate,
      timeSlot: timeSlot.trim(),
      message: typeof message === "string" ? message.trim() : "",
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

// Admin views all appointments with customer information.
export const getAllAppointmentsForAdmin = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const appointments = await Appointment.find()
      .populate("serviceId", "serviceName category image")
      .sort({ createdAt: -1 })
      .lean();

    // Collect unique valid MongoDB ObjectIds.
    const customerIds = [
      ...new Set(
        appointments
          .map((appointment) => String(appointment.customerId))
          .filter((id) => ObjectId.isValid(id))
      ),
    ].map((id) => new ObjectId(id));

    // Retrieve customers from Better Auth user collection.
    const users = await mongoDb
      .collection("user")
      .find(
        { _id: { $in: customerIds } },
        {
          projection: {
            name: 1,
            email: 1,
            image: 1,
          },
        }
      )
      .toArray();

    const userMap = new Map(
      users.map((user) => [String(user._id), user])
    );

    // Attach customer information to each appointment.
    const appointmentsWithCustomers = appointments.map((appointment) => {
      const customer = userMap.get(String(appointment.customerId));

      return {
        ...appointment,
        customer: customer
          ? {
              name: customer.name || "",
              email: customer.email || "",
              image: customer.image || "",
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      message: "All appointments retrieved successfully",
      total: appointmentsWithCustomers.length,
      data: appointmentsWithCustomers,
    });
  } catch (error) {
    console.error("Get all appointments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve appointments",
    });
  }
};

// Admin confirms a pending appointment.
export const confirmAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const appointmentId = req.params.id;

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

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        status: "pending",
      },
      {
        $set: { status: "confirmed" },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Pending appointment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Appointment confirmed successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Confirm appointment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to confirm appointment",
    });
  }
};

// Admin cancels a pending or confirmed appointment.
export const adminCancelAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const appointmentId = req.params.id;

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

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        status: { $in: ["pending", "confirmed"] },
      },
      {
        $set: { status: "cancelled" },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Pending or confirmed appointment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Admin cancel appointment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
    });
  }
};
