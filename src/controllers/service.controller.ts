
import { Request, Response } from "express";
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

    const filter: {
      status: string;
      serviceName?: RegExp;
    } = { status: "active" };

    if (search) {
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
