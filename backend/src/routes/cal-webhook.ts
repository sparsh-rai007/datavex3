import express from "express";
import { pool } from "../db/connection";
console.log("📌 Loaded cal-webhook.ts");

const router = express.Router();

router.post("/webhook", async (req, res) => {
  try {
    console.log("🔥 RAW WEBHOOK:", JSON.stringify(req.body, null, 2));

    const { triggerEvent, payload } = req.body;

    if (!payload || !payload.bookingId) {
      console.log("❌ Missing payload or bookingId");
      return res.sendStatus(400);
    }

    // Extract booking fields
    const bookingId = payload.bookingId.toString();
    const attendee = payload.attendees?.[0] || {};

    const name = attendee.name || "Unknown";
    const email = attendee.email || null;

    const startTime = payload.startTime;
    const endTime = payload.endTime;
    const timezone = payload.organizer?.timeZone || "UTC";

    console.log("📌 Extracted Data:", {
      bookingId, name, email, startTime, endTime, timezone
    });

    // CREATE or UPDATE booking
    if (triggerEvent === "BOOKING_CREATED" || triggerEvent === "BOOKING_RESCHEDULED") {
      await pool.query(
        `INSERT INTO bookings 
         (booking_id, name, email, start_time, end_time, timezone, cancelled)
         VALUES ($1, $2, $3, $4, $5, $6, false)
         ON CONFLICT (booking_id) DO UPDATE
            SET start_time = EXCLUDED.start_time,
                end_time = EXCLUDED.end_time,
                cancelled = false`,
        [bookingId, name, email, startTime, endTime, timezone]
      );

      console.log("✅ Booking INSERTED / UPDATED");
    }

    // CANCEL booking
    if (triggerEvent === "BOOKING_CANCELLED") {
      await pool.query(
        `UPDATE bookings SET cancelled = true WHERE booking_id = $1`,
        [bookingId]
      );

      console.log("❌ Booking CANCELLED");
    }

    return res.sendStatus(200);

  } catch (err) {
    console.error("Webhook ERROR:", err);
    return res.sendStatus(500);
  }
});

export default router;
