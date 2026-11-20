
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { mongoDb } from "../config/mongo.js";

// Admin: Get all users.
export const getAllUsers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await mongoDb
      .collection("user")
      .find(
        {},
        {
          projection: {
            password: 0,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      message: "All users retrieved successfully",
      total: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
    });
  }
};

// Admin: Block or unblock a customer.
export const updateUserBlockStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { isBlocked } = req.body;

    if (
      typeof userId !== "string" ||
      !ObjectId.isValid(userId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    if (typeof isBlocked !== "boolean") {
      res.status(400).json({
        success: false,
        message: "isBlocked must be true or false",
      });
      return;
    }

    const result = await mongoDb.collection("user").updateOne(
      {
        _id: new ObjectId(userId),
        role: "customer",
      },
      {
        $set: { isBlocked },
      }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: isBlocked
        ? "Customer blocked successfully"
        : "Customer unblocked successfully",
    });
  } catch (error) {
    console.error("Update user block status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update customer status",
    });
  }
};
