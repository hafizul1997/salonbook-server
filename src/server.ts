import testRoutes from "./routes/test.routes.js";
import "dotenv/config";

import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";
import { connectMongoClient } from "./config/mongo.js";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import healthRoutes from "./routes/health.routes.js";
import serviceRoutes from "./routes/service.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Better Auth must come before express.json()
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SalonBook API Server is running",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/test", testRoutes);
const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  await connectMongoClient();
  await connectDB();

  app.listen(PORT, () => {
    console.log(`SalonBook server running on port ${PORT}`);
  });
};

startServer();
