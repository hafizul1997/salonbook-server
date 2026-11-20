
import { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { mongoDb } from "../config/mongo.js";
import { ObjectId } from "mongodb";
const baseURL = process.env.BETTER_AUTH_URL;

if (!baseURL) {
  throw new Error("BETTER_AUTH_URL is missing");
}

const jwksURL = new URL(
  `${baseURL.replace(/\/$/, "")}/api/auth/jwks`
);

const JWKS = createRemoteJWKSet(jwksURL);

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    // Debug: Check the JWKS endpoint from this server process.
    console.log("JWKS URL:", jwksURL.toString());

    // Verify JWT signature and claims.
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: baseURL,
      audience: baseURL,
      algorithms: ["EdDSA"],
    });

console.log("JWT Subject:", payload.sub);
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string"
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
      return;
    }

    // Get the latest user information from Better Auth.
    // Validate the MongoDB user ID from the JWT.
if (!ObjectId.isValid(payload.sub)) {
  res.status(401).json({
    success: false,
    message: "Invalid user ID in authentication token",
  });
  return;
}

// Get the latest user information from Better Auth.
const userCollection = mongoDb.collection<{
  _id: ObjectId;
  email: string;
  role: string;
  isBlocked?: boolean;
}>("user");

const user = await userCollection.findOne({
  _id: new ObjectId(payload.sub),
});

if (!user) {
  res.status(401).json({
    success: false,
    message: "User account not found",
  });
  return;
}

    if (user.isBlocked === true) {
      res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
      return;
    }

    if (
      typeof user.email !== "string" ||
      typeof user.role !== "string"
    ) {
      res.status(403).json({
        success: false,
        message: "Invalid user account information",
      });
      return;
    }

    req.user = {
      id: payload.sub,
      email: user.email,
      role: user.role,
      isBlocked: Boolean(user.isBlocked),
    };

    next();
  } catch (error) {
    console.error("========== AUTH ERROR ==========");
    console.error(error);
    console.error(
      "Error name:",
      error instanceof Error ? error.name : "Unknown"
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error("================================");

    if (
      error instanceof Error &&
      error.name === "JWTExpired"
    ) {
      res.status(401).json({
        success: false,
        message: "Authentication token has expired",
      });
      return;
    }

    if (
      error instanceof Error &&
      (
        error.name === "JWSInvalid" ||
        error.name === "JWSSignatureVerificationFailed" ||
        error.name === "JWTClaimValidationFailed"
      )
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Authentication verification failed",
    });
  }
};
