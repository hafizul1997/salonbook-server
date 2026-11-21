
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Stripe from "stripe";
import stripe from "../config/stripe.js";
import Appointment from "../models/appointment.model.js";
import Transaction from "../models/transaction.model.js";

export const createCheckoutSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const { appointmentId } = req.body;

    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
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

    if (appointment.status !== "confirmed") {
      res.status(400).json({
        success: false,
        message: "Only confirmed appointments can be paid",
      });
      return;
    }

    if (appointment.paymentStatus === "paid") {
      res.status(400).json({
        success: false,
        message: "Appointment is already paid",
      });
      return;
    }

    const existingTransaction = await Transaction.findOne({
      appointmentId: appointment._id,
      status: "paid",
    });

    if (existingTransaction) {
      res.status(400).json({
        success: false,
        message: "Payment has already been completed",
      });
      return;
    }

const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [  
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "SalonBook Appointment",
            },
            unit_amount: Math.round(appointment.servicePrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointment._id.toString(),
        customerId,
      },
      success_url: "http://localhost:3000/dashboard/appointments?payment=success",
      cancel_url: "http://localhost:3000/dashboard/appointments?payment=cancelled",
    });

    await Transaction.create({
      appointmentId: appointment._id,
      customerId,
      amount: appointment.servicePrice,
      currency: "usd",
      stripeSessionId: session.id,
      status: "failed",
    });

    res.status(200).json({
      success: true,
      message: "Stripe checkout session created successfully",
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
      },
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      res.status(502).json({
        success: false,
        message: "Unable to create Stripe checkout session",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
