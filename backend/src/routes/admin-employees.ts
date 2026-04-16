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
    body('department').notEmpty().withMessage('Department is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, department, password } = req.body;

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

      // Use provided password or generate a temporary one
      const passwordToUse = password || generatePassword();
      const hashedPassword = await bcrypt.hash(passwordToUse, 10);

      const result = await pool.query(
        `INSERT INTO users (
          email, 
          password_hash, 
          first_name, 
          last_name, 
          role, 
          department, 
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id, email`,
        [email, hashedPassword, firstName, lastName, 'employee', department, true]
      );

      const newUser = result.rows[0];

      res.status(201).json({
        message: 'Employee created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
        },
        password: passwordToUse // Return the password used (generated or provided)
      });

    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Reset employee password
 * PATCH /api/admin/employees/:id/reset-password
 */
router.patch(
  '/:id/reset-password',
  authenticateToken,
  requireRole('admin'),
  [
    body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND role = $3 RETURNING id',
        [hashedPassword, id, 'employee']
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Invalidate all sessions for this user by deleting refresh tokens
      await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [id]);

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Delete an employee
 * DELETE /api/admin/employees/:id
 */
router.delete('/:id', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id',
      [id, 'employee']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update an employee
 * PUT /api/admin/employees/:id
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole('admin'),
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('department').optional().notEmpty().withMessage('Department cannot be empty'),
    body('is_active').optional().isBoolean().withMessage('Status must be a boolean'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, email, department, is_active } = req.body;

    try {
      // Get current user to handle name splitting if only name is provided
      const currentUserResult = await pool.query('SELECT first_name, last_name FROM users WHERE id = $1 AND role = $2', [id, 'employee']);
      if (currentUserResult.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      let firstName = currentUserResult.rows[0].first_name;
      let lastName = currentUserResult.rows[0].last_name;

      if (name) {
        const nameParts = name.trim().split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ') || '';
      }

      const result = await pool.query(
        `UPDATE users 
         SET first_name = COALESCE($1, first_name), 
             last_name = COALESCE($2, last_name), 
             email = COALESCE($3, email), 
             department = COALESCE($4, department),
             is_active = COALESCE($5, is_active),
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $6 AND role = $7 
         RETURNING id, email, first_name, last_name, role, department, is_active`,
        [firstName, lastName, email, department, is_active, id, 'employee']
      );

      res.json({ message: 'Employee updated successfully', employee: result.rows[0] });
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation for email
        return res.status(400).json({ error: 'Email already in use' });
      }
      console.error('Error updating employee:', error);
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
      'SELECT id, email, first_name, last_name, role, department, is_active FROM users WHERE role = $1',
      ['employee']
    );
    res.json({ employees: result.rows });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


