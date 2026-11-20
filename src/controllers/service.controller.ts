
import { Request, Response } from "express";
import mongoose from "mongoose";
import Service from "../models/service.model.js";

// Get active services for customers.
export const getPublicServices = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const sort =
      typeof req.query.sort === "string"
        ? req.query.sort
        : "";

    // Only active services are visible publicly.
    const filter: {
      status: string;
      serviceName?: RegExp;
    } = {
      status: "active",
    };

    if (search) {
      // Escape special regex characters in search text.
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.serviceName = new RegExp(escapedSearch, "i");
    }

    let query = Service.find(filter);

    if (sort === "price_asc") {
      query = query.sort({ price: 1 });
    } else if (sort === "price_desc") {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const services = await query.lean();

    res.status(200).json({
      success: true,
      message: "Services retrieved successfully",
      total: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Get services error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve services",
    });
  }
};

// Create a new service (Admin only).
export const createService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      serviceName,
      category,
      description,
      price,
      duration,
      image,
      status,
    } = req.body;

    if (
      !serviceName?.trim() ||
      !category?.trim() ||
      !description?.trim() ||
      !image?.trim() ||
      price === undefined ||
      duration === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "All required service fields must be provided",
      });
      return;
    }

    const numericPrice = Number(price);
    const numericDuration = Number(duration);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0 ||
      !Number.isInteger(numericDuration) ||
      numericDuration < 1
    ) {
      res.status(400).json({
        success: false,
        message: "Price and duration must be valid positive numbers",
      });
      return;
    }

    if (
      status !== undefined &&
      !["active", "inactive"].includes(status)
    ) {
      res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
      return;
    }

    const service = await Service.create({
      serviceName: serviceName.trim(),
      category: category.trim(),
      description: description.trim(),
      price: numericPrice,
      duration: numericDuration,
      image: image.trim(),
      status: status ?? "active",
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    console.error("Create service error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create service",
    });
  }
};

// Get all services for admin (active and inactive).
export const getAllServicesForAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const services = await Service.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "All services retrieved successfully",
      total: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Get all admin services error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve services",
    });
  }
};

// Update an existing service (Admin only).
export const updateService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
   const id = req.params.id;

if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
  res.status(400).json({
    success: false,
    message: "Invalid service ID",
  });
  return;
}

    const {
      serviceName,
      category,
      description,
      price,
      duration,
      image,
      status,
    } = req.body;

    const updateData: Record<string, unknown> = {};

    if (serviceName !== undefined) {
      if (
        typeof serviceName !== "string" ||
        !serviceName.trim()
      ) {
        res.status(400).json({
          success: false,
          message: "Service name cannot be empty",
        });
        return;
      }

      updateData.serviceName = serviceName.trim();
    }

    if (category !== undefined) {
      if (
        typeof category !== "string" ||
        !category.trim()
      ) {
        res.status(400).json({
          success: false,
          message: "Category cannot be empty",
        });
        return;
      }

      updateData.category = category.trim();
    }

    if (description !== undefined) {
      if (
        typeof description !== "string" ||
        !description.trim()
      ) {
        res.status(400).json({
          success: false,
          message: "Description cannot be empty",
        });
        return;
      }

      updateData.description = description.trim();
    }

    if (image !== undefined) {
      if (
        typeof image !== "string" ||
        !image.trim()
      ) {
        res.status(400).json({
          success: false,
          message: "Image URL cannot be empty",
        });
        return;
      }

      updateData.image = image.trim();
    }

    if (price !== undefined) {
      const numericPrice = Number(price);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice <= 0
      ) {
        res.status(400).json({
          success: false,
          message: "Price must be a positive number",
        });
        return;
      }

      updateData.price = numericPrice;
    }

    if (duration !== undefined) {
      const numericDuration = Number(duration);

      if (
        !Number.isInteger(numericDuration) ||
        numericDuration < 1
      ) {
        res.status(400).json({
          success: false,
          message: "Duration must be a positive integer",
        });
        return;
      }

      updateData.duration = numericDuration;
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        res.status(400).json({
          success: false,
          message: "Status must be active or inactive",
        });
        return;
      }

      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
      return;
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!service) {
      res.status(404).json({
        success: false,
        message: "Service not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Update service error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update service",
    });
  }
};
