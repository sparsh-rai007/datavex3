import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { emailService } from '../services/integrations/email';

const router = express.Router();

/**
 * GET /api/leaves
 * If ADMIN, return all employee leaves.
 * If EMPLOYEE, return only their own leaves.
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let query = '';
    let params: any[] = [];

    if (role === 'admin') {
      query = `
        SELECT l.*, u.first_name, u.last_name, u.department 
        FROM leaves l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
      `;
    } else {
      query = `
        SELECT * FROM leaves 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `;
      params = [userId];
    }

    const result = await pool.query(query, params);
    res.json({ leaves: result.rows });

  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/leaves
 * Submit a new leave request (mainly for employees)
 */
router.post(
  '/',
  authenticateToken,
  [
    body('startDate').isDate().withMessage('Valid start date is required'),
    body('endDate').isDate().withMessage('Valid end date is required'),
    body('reason').notEmpty().withMessage('Reason is required'),
    body('leaveType').notEmpty().withMessage('Leave type is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate, reason, leaveType } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO leaves (user_id, start_date, end_date, reason, leave_type) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [userId, startDate, endDate, reason, leaveType]
      );

      // Fetch 2 admins to notify
      const adminResult = await pool.query(`SELECT email FROM users WHERE role = 'admin' LIMIT 2`);
      const adminEmails = adminResult.rows.map(row => row.email);

      // Fetch the employee's name for the email
      const userResult = await pool.query(`SELECT first_name, last_name FROM users WHERE id = $1`, [userId]);
      const employeeName = userResult.rows.length > 0 
        ? `${userResult.rows[0].first_name || ''} ${userResult.rows[0].last_name || ''}`.trim() || 'Employee'
        : 'Employee';

      // Send the email non-blocking
      emailService.sendLeaveRequestNotification(adminEmails, { startDate, endDate, reason }, employeeName)
        .catch(err => console.error('Error sending leave request notification:', err));

      res.status(201).json({
        message: 'Leave request submitted successfully',
        leave: result.rows[0]
      });

    } catch (error) {
      console.error('Error submitting leave request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PUT /api/leaves/:id/status (ADMIN ONLY)
 */
router.put(
<<<<<<< Updated upstream
    '/:id/status',
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can approve/reject leaves' });
        }

        const { id } = req.params;
        const { status } = req.body; // approved, rejected

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        try {
            const result = await pool.query(
                `UPDATE leaves SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
                [status, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Leave request not found' });
            }

            const leave = result.rows[0];

            // Fetch the employee's email to notify them
            const userResult = await pool.query(`SELECT email FROM users WHERE id = $1`, [leave.user_id]);
            if (userResult.rows.length > 0 && userResult.rows[0].email) {
                emailService.sendLeaveStatusUpdateNotification(userResult.rows[0].email, leave, status)
                    .catch(err => console.error('Error sending leave status update notification:', err));
            }

            res.json({ message: `Leave request ${status} successfully`, leave });
        } catch (error) {
            console.error('Error updating leave status:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
=======
  '/:id/status',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can approve/reject leaves' });
>>>>>>> Stashed changes
    }

    const { id } = req.params;
    const { status } = req.body; // approved, rejected

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    try {
      const result = await pool.query(
        `UPDATE leaves SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }

      res.json({ message: `Leave request ${status} successfully`, leave: result.rows[0] });
    } catch (error) {
      console.error('Error updating leave status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
