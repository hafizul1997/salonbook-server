
import type { Request, Response } from "express";

export const uploadImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      res.status(500).json({
        success: false,
        message: "ImgBB API key is not configured",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please select an image to upload",
      });
      return;
    }

    const formData = new FormData();

    formData.append(
      "image",
      req.file.buffer.toString("base64")
    );

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json() as {
      success?: boolean;
      data?: {
        url?: string;
        display_url?: string;
      };
      error?: {
        message?: string;
      };
    };

    if (!response.ok || !result.success || !result.data?.url) {
      res.status(502).json({
        success: false,
        message: result.error?.message || "Image upload failed",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: result.data.url,
        displayUrl: result.data.display_url,
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error during image upload",
    });
  }
};
