
import { Request, Response } from "express";
import Service from "../models/service.model";

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
