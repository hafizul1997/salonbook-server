
import type { Request, Response } from "express";
import Stripe from "stripe";
import stripe from "../config/stripe.js";
import Appointment from "../models/appointment.model.js";
import Transaction from "../models/transaction.model.js";

export const handleStripeWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    res.status(400).send("Missing Stripe signature or webhook secret");
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    res.status(400).send("Invalid Stripe webhook signature");
    return;
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === "paid") {
        const appointmentId = session.metadata?.appointmentId;

        if (!appointmentId) {
          res.status(400).send("Appointment ID missing from metadata");
          return;
        }

        const transaction = await Transaction.findOne({
          stripeSessionId: session.id,
        });

        if (!transaction) {
          res.status(500).send("Transaction not found");
          return;
        }

        await Transaction.updateOne(
          { stripeSessionId: session.id },
          { $set: { status: "paid" } }
        );

        await Appointment.updateOne(
          {
            _id: appointmentId,
            customerId: transaction.customerId,
          },
          { $set: { paymentStatus: "paid" } }
        );
      }
    }

    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;

      await Transaction.updateOne(
        { stripeSessionId: session.id },
        { $set: { status: "failed" } }
      );
    }

    res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);

    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};
