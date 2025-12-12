import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { crmService } from '../services/integrations/crm';

const toCSV = (rows: any[]): string => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value: any) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };
  const headerLine = headers.join(',');
  const lines = rows.map((row) => headers.map((h) => escape(row[h])).join(','));
  return [headerLine, ...lines].join('\n');
};

const parseCSV = (text: string): Record<string, string>[] => {
  const lines = text.trim().split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.match(/("([^"]|"")*"|[^,]+)/g) || [];
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      value = value.trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/""/g, '"');
      }
      record[header] = value;
    });
    return record;
  });
};

const router = express.Router();

// Get all jobs
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, search, type, department } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT j.*, u.first_name || ' ' || u.last_name as posted_by_name
      FROM jobs j
      LEFT JOIN users u ON j.posted_by = u.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    // Public endpoint - only show published jobs unless authenticated
    if (!req.headers.authorization) {
      conditions.push(`j.status = 'published'`);
    } else if (status) {
      conditions.push(`j.status = $${params.length + 1}`);
      params.push(status);
    }

    if (type) {
      conditions.push(`j.type = $${params.length + 1}`);
      params.push(type);
    }

    if (department) {
      conditions.push(`j.department = $${params.length + 1}`);
      params.push(department);
    }

    if (search) {
      conditions.push(
        `(j.title ILIKE $${params.length + 1} OR j.description ILIKE $${params.length + 1} OR j.slug ILIKE $${params.length + 1})`
      );
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY j.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);
    // Remove alias "j." for the COUNT(*) query, because count query does not use table alias
const cleanConditions = conditions.map(c => c.replace(/j\./g, ''));

const countResult = await pool.query(
  `SELECT COUNT(*) as count FROM jobs${cleanConditions.length > 0 ? ' WHERE ' + cleanConditions.join(' AND ') : ''}`,
  params.slice(0, -2)  // same number of bind variables as the WHERE clause
);


    res.json({
      jobs: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export jobs
router.get('/export', authenticateToken, requireRole('admin', 'recruiter'), async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT title, slug, description, requirements, location, type, status, department, salary_range, created_at
       FROM jobs
       ORDER BY created_at DESC`
    );

    const csv = toCSV(result.rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="jobs-export.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import jobs
router.post('/import', authenticateToken, requireRole('admin', 'recruiter'), async (req: AuthRequest, res: Response) => {
  try {
    const { data, format = 'csv' } = req.body;
    let records: any[] = [];

    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    if (format === 'csv') {
      records = parseCSV(data);
    } else if (format === 'json' && Array.isArray(data)) {
      records = data;
    } else {
      return res.status(400).json({ error: 'Invalid import format' });
    }

    let inserted = 0;
    let updated = 0;

    for (const record of records) {
      if (!record.slug || !record.title) continue;

      const result = await pool.query(
        `INSERT INTO jobs (title, slug, description, requirements, location, type, status, department, salary_range)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           requirements = EXCLUDED.requirements,
           location = EXCLUDED.location,
           type = EXCLUDED.type,
           status = EXCLUDED.status,
           department = EXCLUDED.department,
           salary_range = EXCLUDED.salary_range,
           updated_at = NOW()
         RETURNING xmax = 0 AS inserted`,
        [
          record.title,
          record.slug,
          record.description || null,
          record.requirements || null,
          record.location || null,
          record.type || null,
          record.status || 'draft',
          record.department || null,
          record.salary_range || null,
        ]
      );

      if (result.rows[0]?.inserted) {
        inserted++;
      } else {
        updated++;
      }
    }

    res.json({ message: 'Import completed', inserted, updated, total: records.length });
  } catch (error) {
    console.error('Import jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single job
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT j.*, u.first_name || ' ' || u.last_name as posted_by_name
       FROM jobs j
       LEFT JOIN users u ON j.posted_by = u.id
       WHERE j.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if job is published (for public access)
    if (!req.headers.authorization && result.rows[0].status !== 'published') {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create job
router.post(
  '/',
  authenticateToken,
  requireRole('admin', 'recruiter'),
  [
    body('title').notEmpty().withMessage('Title is required').trim().isLength({ min: 1, max: 255 }),
    body('slug').notEmpty().withMessage('Slug is required').trim().matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Invalid slug format'),
    body('description').notEmpty().withMessage('Description is required'),
    body('status').optional().isIn(['draft', 'published', 'closed']),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        slug,
        description,
        requirements,
        location,
        type,
        status = 'draft',
        department,
        salary_range,
      } = req.body;

      // Check if slug already exists
      const slugCheck = await pool.query('SELECT id FROM jobs WHERE slug = $1', [slug]);
      if (slugCheck.rows.length > 0) {
        return res.status(409).json({ error: 'A job with this slug already exists' });
      }

      const result = await pool.query(
        `INSERT INTO jobs (title, slug, description, requirements, location, type, status, department, salary_range, posted_by, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          title,
          slug,
          description,
          requirements || null,
          location || null,
          type || null,
          status,
          department || null,
          salary_range || null,
          req.user?.id,
          status === 'published' ? new Date() : null,
        ]
      );

      crmService.syncJob({
        id: result.rows[0].id,
        title,
        department,
        location,
        status,
        type,
        description,
      }).catch((err: any) => console.error('CRM job sync error:', err));

      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error('Create job error:', error);
      if (error.code === '23505') {
        return res.status(409).json({ error: 'A job with this slug already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update job
router.put(
  '/:id',
  authenticateToken,
  requireRole('admin', 'recruiter'),
  [
    body('title').optional().trim().isLength({ min: 1, max: 255 }),
    body('slug').optional().trim().matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Invalid slug format'),
    body('status').optional().isIn(['draft', 'published', 'closed']),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;

      // Check if job exists
      const jobCheck = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
      if (jobCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }

      // Check slug uniqueness if slug is being updated
      if (updates.slug && updates.slug !== jobCheck.rows[0].slug) {
        const slugCheck = await pool.query('SELECT id FROM jobs WHERE slug = $1 AND id != $2', [updates.slug, id]);
        if (slugCheck.rows.length > 0) {
          return res.status(409).json({ error: 'A job with this slug already exists' });
        }
      }

      // Build update query
      const setClause: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const allowedFields = [
        'title', 'slug', 'description', 'requirements', 'location', 'type',
        'status', 'department', 'salary_range',
      ];

      Object.keys(updates).forEach((key) => {
        if (allowedFields.includes(key)) {
          setClause.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
          paramIndex++;
        }
      });

      // Handle published_at
      if (updates.status === 'published' && jobCheck.rows[0].status !== 'published') {
        setClause.push(`published_at = $${paramIndex}`);
        values.push(new Date());
        paramIndex++;
      }

      if (setClause.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      values.push(id);
      const query = `UPDATE jobs SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

      const result = await pool.query(query, values);

      crmService.syncJob({
        id: result.rows[0].id,
        title: result.rows[0].title,
        department: result.rows[0].department,
        location: result.rows[0].location,
        status: result.rows[0].status,
        type: result.rows[0].type,
        description: result.rows[0].description,
      }).catch((err: any) => console.error('CRM job sync error:', err));

      res.json(result.rows[0]);
    } catch (error: any) {
      console.error('Update job error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Manually trigger CRM sync for a job
router.post(
  '/:id/sync',
  authenticateToken,
  requireRole('admin', 'recruiter'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!crmService.isConfigured()) {
        return res.status(400).json({ error: 'CRM integration is not configured' });
      }

      const { id } = req.params;
      const jobResult = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);

      if (jobResult.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const job = jobResult.rows[0];

      await crmService.syncJob({
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        status: job.status,
        type: job.type,
        description: job.description,
      });

      res.json({ message: 'Job sync initiated' });
    } catch (error) {
      console.error('Job sync error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete job
router.delete('/:id', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM jobs WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get job applications
router.get('/:id/applications', authenticateToken, requireRole('admin', 'recruiter'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    let query = 'SELECT * FROM job_applications WHERE job_id = $1';
    const params: any[] = [id];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

