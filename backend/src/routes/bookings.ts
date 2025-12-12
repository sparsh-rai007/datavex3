import express from "express";
import { pool } from "../db/connection";
import { authenticateToken, requireRole } from "../middleware/auth";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  requireRole("admin", "editor"),
  async (_req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM bookings ORDER BY start_time DESC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  }
);

export default router;
