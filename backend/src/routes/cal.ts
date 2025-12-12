import express from "express";
import { pool } from "../db/connection";
import { authenticateToken, requireRole } from "../middleware/auth";

const router = express.Router();

router.post("/webhook", async (req, res) => {
  try {
    const event = req.body;
    console.log("Cal.com Webhook Event:", event);

    const b = event.data;

    // Handle booking created
    if (event.type === "booking.created") {
      await pool.query(
        `INSERT INTO bookings 
         (booking_id, name, email, start_time, end_time, timezone)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (booking_id) DO NOTHING`,
        [b.id, b.name, b.email, b.start_time, b.end_time, b.timezone]
      );
    }
    router.get("/bookings",
    authenticateToken,
    requireRole("admin"),
    async (req, res) => {
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
    // Handle cancellation
    if (event.type === "booking.cancelled") {
      await pool.query(
        `UPDATE bookings 
         SET cancelled = true 
         WHERE booking_id = $1`,
        [b.id]
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook Error:", err);
    res.sendStatus(500);
  }
});

export default router;
