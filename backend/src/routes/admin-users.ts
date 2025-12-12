import express from "express";
import { pool } from "../db/connection";
import { authenticateToken, requireRole } from "../middleware/auth";
import bcrypt from "bcryptjs";

const router = express.Router();

/**
 * GET all admin users
 */
router.get("/", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, role, created_at 
       FROM users 
       WHERE role IN ('admin', 'editor')
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load admin users" });
  }
});

/**
 * CREATE new admin/editor user
 */
router.post("/", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [firstName, lastName, email, hashed, role, true]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Admin user creation failed:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

/**
 * UPDATE user role
 */
router.put("/:id/role", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;

    await pool.query(
      `UPDATE users SET role=$1 WHERE id=$2`,
      [role, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

/**
 * DELETE user
 */
router.delete("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    await pool.query(`DELETE FROM users WHERE id=$1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
