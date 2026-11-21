
import type { Request, Response } from "express";
import Transaction from "../models/transaction.model.js";

export const getAllTransactions = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const transactions = await Transaction.find()
      .populate({
        path: "appointmentId",
        populate: {
          path: "serviceId",
          select: "serviceName category price",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All transactions retrieved successfully",
      total: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("Get all transactions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions",
    });
  }
};
