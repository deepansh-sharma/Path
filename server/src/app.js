import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import { connectToDatabase } from "./config/db.js";
import router from "./routes/index.js";

const app = express();

// Global middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Mount API routes
app.use("/api", router);

// Basic root
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "pathology-saas-server" });
});

// Not found handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // avoid leaking internal details
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

// Start server after DB connection
const port = process.env.PORT || 5000;
connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start server due to DB error:", error);
    process.exit(1);
  });

export default app;
