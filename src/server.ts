
import dotenv from "dotenv";
dotenv.config();
import serviceRoutes from "./routes/service.routes";
import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import healthRoutes from "./routes/health.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SalonBook API Server is running",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/services", serviceRoutes);
const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`SalonBook server running on port ${PORT}`);
  });
};

startServer();
