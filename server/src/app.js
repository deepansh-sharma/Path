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
import { 
  globalErrorHandler, 
  handleNotFound, 
  handleUnhandledRejection, 
  handleUncaughtException 
} from "./middleware/errorHandler.js";

console.log("🚀 Starting Pathology SaaS Server...");
console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`🔧 Port: ${process.env.PORT || 5000}`);

const app = express();

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', handleUncaughtException);
process.on('unhandledRejection', handleUnhandledRejection);

// Global middlewares
console.log("🛡️  Setting up security middleware...");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(compression());
app.use(express.json({ 
  limit: "1mb",
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON format',
        code: 'INVALID_JSON'
      });
      return;
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Enhanced logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan("dev"));
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    if (req.body && Object.keys(req.body).length > 0) {
      // Don't log sensitive data
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
      if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
      console.log("📋 Request body:", JSON.stringify(sanitizedBody, null, 2));
    }
    next();
  });
} else {
  app.use(morgan("combined"));
}

// Request ID middleware for tracking
app.use((req, res, next) => {
  req.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});

console.log("🛣️  Setting up API routes...");
// Mount API routes
app.use("/api", router);
app.use("/api/export", exportRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  console.log("✅ Health check endpoint accessed");
  res.json({
    success: true,
    status: "ok",
    service: "pathology-saas-server",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "connected", // This could be dynamic based on actual DB status
      server: "running"
    }
  });
});

// Handle 404 for undefined routes
app.use(handleNotFound);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

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
