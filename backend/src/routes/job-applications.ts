import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { aiService } from '../services/ai';
import { emailService } from '../services/integrations/email';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
// Configure multer with file extension preserved
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname); // keep .pdf / .docx
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed.'));
    }
  },
});


// Create job application (public endpoint)
router.post(
  '/',
  upload.single('resume'),
  [
    body('job_id').notEmpty().withMessage('Job ID is required'),
    body('first_name').notEmpty().trim().isLength({ min: 1, max: 100 }),
    body('last_name').notEmpty().trim().isLength({ min: 1, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('phone').optional().trim(),
    body('cover_letter').optional().trim(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { job_id, first_name, last_name, email, phone, cover_letter } = req.body;
      const resumeFile = req.file;

      // Check if job exists and is published
      const jobCheck = await pool.query('SELECT id, status, title FROM jobs WHERE id = $1', [job_id]);
      if (jobCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }
      const job = jobCheck.rows[0];
      if (job.status !== 'published') {
        return res.status(403).json({ error: 'Job is not accepting applications' });
      }

      let resumeUrl = null;
      let parsedResumeData: any = null;

      // If resume uploaded, store it (parsing will happen async)
      if (resumeFile) {
        // Store file URL (in production, upload to S3/DigitalOcean)
        resumeUrl = `/uploads/resumes/${resumeFile.filename}`;
        
        // Try to extract text from PDF/DOC (simplified - in production use proper parser)
        // For now, we'll parse it asynchronously after creation
        try {
          // Basic text extraction attempt (for PDF, you'd need pdf-parse library)
          // For MVP, we'll skip automatic parsing and allow manual parsing later
        } catch (parseError) {
          console.error('Resume text extraction error:', parseError);
        }
      }

      // Score the application
      let score = 0;
      let skills: string[] = [];
      
      if (parsedResumeData) {
        skills = parsedResumeData.skills || [];
        // Simple scoring based on parsed data
        score = Math.min(100, (skills.length * 10) + (parsedResumeData.experience || 0) * 5);
      }

      // Create application
      const result = await pool.query(
        `INSERT INTO job_applications 
         (job_id, first_name, last_name, email, phone, resume_url, cover_letter, skills, score, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          job_id,
          first_name,
          last_name,
          email,
          phone || null,
          resumeUrl,
          cover_letter || null,
          JSON.stringify(skills),
          score,
          'pending',
        ]
      );

      emailService.sendNewApplicationNotification({
        job_title: job.title,
        first_name,
        last_name,
        email,
        phone,
        score,
      }).catch((err: any) => console.error('Application notification error:', err));

      res.status(201).json({
        message: 'Application submitted successfully',
        application: result.rows[0],
      });
    } catch (error: any) {
      console.error('Create application error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all applications (admin)
router.get('/', authenticateToken, requireRole('admin', 'recruiter'), async (req: AuthRequest, res: Response) => {
  try {
    const { job_id, status } = req.query;

    let query = 'SELECT * FROM job_applications';
    const params: any[] = [];
    const conditions: string[] = [];

    if (job_id) {
      conditions.push(`job_id = $${params.length + 1}`);
      params.push(job_id);
    }

    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single application
router.get('/:id', authenticateToken, requireRole('admin', 'recruiter'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM job_applications WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update application
router.put(
  '/:id',
  authenticateToken,
  requireRole('admin', 'recruiter'),
  [body('status').optional().isIn(['pending', 'reviewing', 'interviewed', 'rejected', 'hired'])],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;

      const setClause: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const allowedFields = ['status', 'score', 'notes', 'experience_years'];

      Object.keys(updates).forEach((key) => {
        if (allowedFields.includes(key)) {
          setClause.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
          paramIndex++;
        }
      });

      if (setClause.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      values.push(id);
      const query = `UPDATE job_applications SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update application error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Re-parse resume with AI
router.post(
  '/:id/parse-resume',
  authenticateToken,
  requireRole('admin', 'recruiter'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const app = await pool.query('SELECT * FROM job_applications WHERE id = $1', [id]);
      if (app.rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      if (!app.rows[0].resume_url) {
        return res.status(400).json({ error: 'No resume attached' });
      }

      // In production, fetch from S3
      // For now, we'll need the resume text
      const resumeText = req.body.resumeText;
      if (!resumeText) {
        return res.status(400).json({ error: 'Resume text is required' });
      }

      const parsedData = await aiService.parseResume(resumeText);

      // Update application with parsed data
      await pool.query(
        `UPDATE job_applications 
         SET skills = $1, experience_years = $2, score = $3
         WHERE id = $4`,
        [
          JSON.stringify(parsedData.skills || []),
          parsedData.experience || 0,
          Math.min(100, (parsedData.skills?.length || 0) * 10 + (parsedData.experience || 0) * 5),
          id,
        ]
      );

      res.json({ message: 'Resume parsed successfully', data: parsedData });
    } catch (error) {
      console.error('Parse resume error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

