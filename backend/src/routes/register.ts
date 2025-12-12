import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { pool } from "../db/connection";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

const router = express.Router();

// USER SIGNUP
router.post(
  "/",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be 6+ characters"),
    body("firstName").notEmpty().withMessage("First name required"),
    body("lastName").notEmpty().withMessage("Last name required"),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password, firstName, lastName } = req.body;

      // Check if email already registered
      const userExists = await pool.query("SELECT email FROM users WHERE email=$1", [email]);
      if (userExists.rows.length > 0) {
        return res.status(409).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user   (role = viewer = normal user)
      const result = await pool.query(
        `INSERT INTO users (email, first_name, last_name, password_hash, role,is_active)
         VALUES ($1,$2,$3,$4,'viewer',true)
         RETURNING id,email,first_name,last_name,role`,
        [email, firstName, lastName, hashedPassword]
      );

      const user = result.rows[0];

      // Generate tokens for auto-login
      const payload = { id: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Set refresh token cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        message: "Account created successfully",
        accessToken,
        user
      });

    } catch (err) {
      console.error("REGISTER ERROR:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
