import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  res.json({
    status: "ok",
    uptime: process.uptime(),
    db: dbState === 1 ? "connected" : "not_connected",
    timestamp: new Date().toISOString(),
  });
});

export default router;
