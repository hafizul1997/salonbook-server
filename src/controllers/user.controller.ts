
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
//Profile update

export const updateMyProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId || !ObjectId.isValid(userId)) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { name, image, phone } = req.body;

    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim())
    ) {
      res.status(400).json({
        success: false,
        message: "Name must be a non-empty string",
      });
      return;
    }

    if (
      image !== undefined &&
      typeof image !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Image must be a string",
      });
      return;
    }

    if (
      phone !== undefined &&
      typeof phone !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Phone must be a string",
      });
      return;
    }

    const updateFields: {
      name?: string;
      image?: string;
      phone?: string;
    } = {};

    if (name !== undefined) updateFields.name = name.trim();
    if (image !== undefined) updateFields.image = image.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();

    if (Object.keys(updateFields).length === 0) {
      res.status(400).json({
        success: false,
        message: "Provide at least one profile field to update",
      });
      return;
    }

    const result = await mongoDb.collection("user").findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const { password, ...safeUser } = result;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: safeUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};
// Get logged-in user's own profile.
export const getMyProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId || !ObjectId.isValid(userId)) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const user = await mongoDb.collection("user").findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          password: 0,
        },
      }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User profile not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        name: user.name || "",
        email: user.email || "",
        image: user.image || "",
        phone: user.phone || "",
        role: user.role || "customer",
      },
    });
  } catch (error) {
    console.error("Get my profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
    });
  }
};