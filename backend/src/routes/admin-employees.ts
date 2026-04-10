import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

/**
 * Generate a random 8-character password
 */
function generatePassword(length = 8) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

/**
 * Create a new employee
 * POST /api/admin/employees
 */
router.post(
  '/',
  authenticateToken,
  requireRole('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('department').notEmpty().withMessage('Department is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, employeeId, department } = req.body;

    // Split name into first and last
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
      // Check if user already exists
      const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Check if employee ID already exists
      const empIdExists = await pool.query('SELECT id FROM users WHERE employee_id = $1', [employeeId]);
      if (empIdExists.rows.length > 0) {
        return res.status(400).json({ error: 'Employee ID already exists' });
      }

      const temporaryPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      const result = await pool.query(
        `INSERT INTO users (
          email, 
          password_hash, 
          first_name, 
          last_name, 
          role, 
          employee_id, 
          department, 
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING id, email, employee_id`,
        [email, hashedPassword, firstName, lastName, 'employee', employeeId, department, true]
      );

      const newUser = result.rows[0];

      res.status(201).json({
        message: 'Employee created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          employeeId: newUser.employee_id,
        },
        temporaryPassword // ONLY SENT ONCE
      });

    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Get all employees
 * GET /api/admin/employees
 */
router.get('/', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, employee_id, department, is_active FROM users WHERE role = $1',
      ['employee']
    );
    res.json({ employees: result.rows });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


