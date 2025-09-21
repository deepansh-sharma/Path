import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import { connectToDatabase } from "./config/db.js";
import router from "./routes/index.js";
import exportRoutes from "./routes/export.js";

console.log("🚀 Starting Pathology SaaS Server...");
console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`🔧 Port: ${process.env.PORT || 5000}`);

const app = express();

// Global middlewares
console.log("🛡️  Setting up security middleware...");
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "1mb" }));

// Enhanced logging middleware
app.use(morgan("dev"));
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

console.log("🛣️  Setting up API routes...");
// Mount API routes
console.log("Mounting API routes...");
app.use("/api", router);
app.use("/api/export", exportRoutes);

// Basic root
app.get("/", (req, res) => {
  console.log("✅ Health check endpoint accessed");
  res.json({
    status: "ok",
    service: "pathology-saas-server",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Not found handler
app.use((req, res, next) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Enhanced global error handler
app.use((err, req, res, next) => {
  console.error("💥 Global Error Handler Triggered:");
  console.error("Error message:", err.message);
  console.error("Error stack:", err.stack);
  console.error("Request details:", {
    method: req.method,
    path: req.path,
    body: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers,
  });

  // Determine error type and status
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle specific error types
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation Error";
    console.log("🔍 Validation Error Details:", err.errors);
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID format";
    console.log("🔍 Cast Error Details:", err.value);
  } else if (err.code === 11000) {
    status = 409;
    message = "Duplicate entry";
    console.log("🔍 Duplicate Key Error:", err.keyValue);
  } else if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  }

  // Send error response
  const errorResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
    errorResponse.details = err;
  }

  res.status(status).json(errorResponse);
});

// Graceful shutdown handlers
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit the process, just log the error
});

process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  console.error("Stack:", error.stack);
  // Exit the process for uncaught exceptions
  process.exit(1);
});

// Start server after DB connection
const PORT = process.env.PORT || 5000;
console.log("🔌 Connecting to database...");
connectToDatabase()
  .then(() => {
    console.log("✅ Database connected successfully");
    console.log("🎯 Starting HTTP server...");

    app.listen(PORT, () => {
      console.log("🚀 Server started successfully!");
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("📋 Available endpoints:");
      console.log("   - GET  /api/health - Health check");
      console.log("   - POST /api/auth/login - User login");
      console.log("   - GET  /api/labs - Get all labs");
      console.log("   - GET  /api/patients - Get all patients");
      console.log("   - GET  /api/reports - Get all reports");
      console.log("   - GET  /api/samples - Get all samples");
      console.log("   - GET  /api/invoices - Get all invoices");
      console.log("🏥 Pathology SaaS Backend is ready for requests");
      console.log("─".repeat(50));
    });
  })
  .catch((error) => {
    console.error("💥 Failed to start server due to DB error:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("🔄 Please check your database connection and try again");
    process.exit(1);
  });

export default app;
