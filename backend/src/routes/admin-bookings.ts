import express from "express";
import { pool } from "../db/connection";
import { authenticateToken, requireRole } from "../middleware/auth";

const router = express.Router();
// Approve booking
router.post("/:id/approve",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    await pool.query(
      `UPDATE bookings SET approved = true WHERE booking_id = $1`,
      [req.params.id]
    );
    res.json({ status: "approved" });
  }
);

// Reject + Cancel booking
router.post("/:id/reject",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    await pool.query(
      `UPDATE bookings SET approved = false, cancelled = true WHERE booking_id = $1`,
      [req.params.id]
    );
    res.json({ status: "rejected" });
  }
);
router.get(
  "/",
  authenticateToken,
  requireRole("admin"),
  async (_req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM bookings ORDER BY start_time DESC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  }
);

export default router;
