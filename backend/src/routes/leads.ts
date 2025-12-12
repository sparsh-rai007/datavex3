import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { aiService } from '../services/ai';
import { crmService } from '../services/integrations/crm';
import { emailService } from '../services/integrations/email';

const router = express.Router();

/* ======================================================================
   CSV HELPERS
====================================================================== */
const toCSV = (rows: any[]): string => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value: any) => {
    if (value === null || value === undefined) return '';
    const s = String(value);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const headerLine = headers.join(',');
  const lines = rows.map((row) => headers.map((h) => escape(row[h])).join(','));
  return [headerLine, ...lines].join('\n');
};

const parseCSV = (text: string): Record<string, string>[] => {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const headers = lines[0].split(',').map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.match(/("([^"]|"")*"|[^,]+)/g) || [];
    const record: any = {};

    headers.forEach((header, index) => {
      let v = values[index] || '';
      v = v.trim();
      if (v.startsWith('"') && v.endsWith('"')) {
        v = v.slice(1, -1).replace(/""/g, '"');
      }
      record[header] = v;
    });
    return record;
  });
};

/* ======================================================================
   CREATE LEAD — CONTACT FORM (NO AUTO SCORING)
====================================================================== */
router.post(
  '/',
  [
    body('email').isEmail().normalizeEmail(),
    body('first_name').optional().trim(),
    body('last_name').optional().trim(),
    body('company').optional().trim(),
    body('phone').optional().trim(),
    body('source').optional().trim(),
    body('notes').optional().trim(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        email,
        first_name,
        last_name,
        company,
        phone,
        source = 'website',
        notes,
        status = 'new',
      } = req.body;

      const result = await pool.query(
        `INSERT INTO leads (email, first_name, last_name, company, phone, source, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [email, first_name, last_name, company, phone, source, notes, status]
      );

      // Sync to CRM (fire & forget)
      crmService
        .syncLead(result.rows[0])
        .catch((err: any) => console.error('CRM sync error:', err));

      return res.status(201).json({
        message: 'Lead created successfully',
        lead: result.rows[0],
      });
    } catch (error: any) {
      console.error('Create lead error:', error);
      if (error.code === '23505') {
        return res.status(409).json({ error: 'A lead with this email already exists' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/* ======================================================================
   GET ALL LEADS
====================================================================== */
router.get(
  '/',
  authenticateToken,
  requireRole('admin', 'editor', 'recruiter'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { page = 1, limit = 20, status, source, search } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = 'SELECT * FROM leads';
      const params: any[] = [];
      const conditions: string[] = [];

      if (status) {
        conditions.push(`status = $${params.length + 1}`);
        params.push(status);
      }

      if (source) {
        conditions.push(`source = $${params.length + 1}`);
        params.push(source);
      }

      if (search) {
        conditions.push(
          `(email ILIKE $${params.length + 1} OR first_name ILIKE $${params.length + 1} OR last_name ILIKE $${params.length + 1} OR company ILIKE $${params.length + 1})`
        );
        params.push(`%${search}%`);
      }

      if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(Number(limit), offset);

      const results = await pool.query(query, params);
      const countResults = await pool.query(
        'SELECT COUNT(*) FROM leads' + (conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''),
        conditions.length ? params.slice(0, -2) : []
      );

      res.json({
        leads: results.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(countResults.rows[0].count),
        },
      });
    } catch (error) {
      console.error('Get leads error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/* ======================================================================
   EXPORT LEADS
====================================================================== */
router.get(
  '/export',
  authenticateToken,
  requireRole('admin', 'editor'),
  async (_req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT email, first_name, last_name, company, phone, source, status, score, tags, notes, created_at
         FROM leads ORDER BY created_at DESC`
      );

      const csv = toCSV(result.rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="leads-export.csv"');
      res.send(csv);
    } catch (error) {
      console.error('Export leads error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/* ======================================================================
   IMPORT LEADS
====================================================================== */
router.post(
  '/import',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { data, format = 'csv' } = req.body;
      if (!data) return res.status(400).json({ error: 'No data provided' });

      const records = format === 'csv' ? parseCSV(data) : Array.isArray(data) ? data : [];

      let inserted = 0;
      let updated = 0;

      for (const record of records) {
        if (!record.email) continue;

        const result = await pool.query(
          `INSERT INTO leads (email, first_name, last_name, company, phone, source, status, notes, score, tags)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (email) DO UPDATE SET
              first_name = EXCLUDED.first_name,
              last_name = EXCLUDED.last_name,
              company = EXCLUDED.company,
              phone = EXCLUDED.phone,
              source = EXCLUDED.source,
              status = EXCLUDED.status,
              notes = EXCLUDED.notes,
              score = EXCLUDED.score,
              tags = EXCLUDED.tags,
              updated_at = NOW()
           RETURNING xmax = 0 AS inserted`,
          [
            record.email,
            record.first_name || null,
            record.last_name || null,
            record.company || null,
            record.phone || null,
            record.source || 'import',
            record.status || 'new',
            record.notes || null,
            record.score ? Number(record.score) : null,
            record.tags || null,
          ]
        );

        if (result.rows[0].inserted) inserted++;
        else updated++;
      }

      res.json({ message: 'Import completed', inserted, updated, total: records.length });
    } catch (error) {
      console.error('Import leads error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/* ======================================================================
   GET SINGLE LEAD
====================================================================== */
router.get(
  '/:id',
  authenticateToken,
  requireRole('admin', 'editor', 'recruiter'),
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query('SELECT * FROM leads WHERE id = $1', [req.params.id]);

      if (!result.rows.length) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get lead error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/* ======================================================================
   UPDATE LEAD
====================================================================== */
router.put(
  '/:id',
  authenticateToken,
  requireRole('admin', 'editor', 'recruiter'),
  [
    body('email').optional().isEmail(),
    body('first_name').optional().trim(),
    body('last_name').optional().trim(),
    body('status').optional().isIn(['new', 'contacted', 'qualified', 'converted', 'lost']),
  ],
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
      let idx = 1;

      for (const key of ['email', 'first_name', 'last_name', 'company', 'phone', 'status', 'score', 'tags', 'notes']) {
        if (updates[key] !== undefined) {
          setClause.push(`${key} = $${idx}`);
          values.push(updates[key]);
          idx++;
        }
      }

      if (!setClause.length) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      values.push(id);

      const result = await pool.query(
        `UPDATE leads SET ${setClause.join(', ')}, updated_at = NOW()
         WHERE id = $${idx} RETURNING *`,
        values
      );

      if (!result.rows.length) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update lead error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/* ======================================================================
   ASSESSMENT → SCORE LEAD 
====================================================================== */
/* ======================================================================
   ASSESSMENT → MANUAL LEAD SCORING (NO AI)
====================================================================== */
router.post(
  '/assessment',
  [body('email').isEmail(), body('answers').isObject()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, answers } = req.body;

      /* ------------------------------
         MANUAL SCORING MODEL
      ------------------------------ */

      /* ------------------------------
   UPGRADED SCORING LOGIC  
   50% Budget + 20% Location +  
   20% Experience + 10% Employees
------------------------------ */

        const parseBudgetToUSD = (raw: any): number => {
          if (!raw) return 0;
          let s = String(raw).trim().toLowerCase();

          // Handle "25 lakh", "10 lakh"
          const lakhMatch = raw.toString().toLowerCase().match(/([0-9.]+)\s*lakh/);
          if (lakhMatch) {
            const inr = Number(lakhMatch[1]) * 100000;
            return inr * 0.012; // convert INR → USD approx.
          }

          // Remove INR symbols, commas
          s = s.replace(/,|rs|inr|₹/g, '');

          const num = Number(s.replace(/[^0-9.]/g, ''));
          if (isNaN(num)) return 0;

          // If original looked Indian, convert
          if (/₹|inr|rs/.test(raw.toString().toLowerCase())) {
            return num * 0.012;
          }

          return num;
        };

        // SCORING WEIGHTS
        const WEIGHTS = {
          budget: 50,
          country: 20,
          experience: 20,
          employees: 10,
        };

        // BUDGET SCORING
        const budgetUSD = parseBudgetToUSD(answers.budget);
        let budgetScore = 0;
        if (budgetUSD >= 30000) budgetScore = WEIGHTS.budget;
        else if (budgetUSD >= 10000) budgetScore = Math.round(WEIGHTS.budget * 0.6);
        else if (budgetUSD > 0) budgetScore = Math.round(WEIGHTS.budget * 0.2);

        // LOCATION SCORING
        const highValueCountries = ["usa", "united states", "uk", "england", "canada", "australia", "singapore", "uae"];
        const location = (answers.location || "").toLowerCase();
        let countryScore = highValueCountries.some(c => location.includes(c))
          ? WEIGHTS.country
          : location ? Math.round(WEIGHTS.country * 0.4) : 0;

        // EXPERIENCE SCORING
        const exp = Number(answers.experience) || 0;
        let experienceScore = exp >= 10 ? WEIGHTS.experience :
                              exp >= 5 ? Math.round(WEIGHTS.experience * 0.6) :
                              exp > 0 ? Math.round(WEIGHTS.experience * 0.2) : 0;

        // EMPLOYEES SCORING
        const employees = Number(answers.employees) || 0;
        let employeesScore = employees >= 20 ? WEIGHTS.employees :
                            employees >= 5 ? Math.round(WEIGHTS.employees * 0.6) :
                            employees > 0 ? Math.round(WEIGHTS.employees * 0.2) : 0;

        // FINAL SCORE (max 100)
        const finalScore = Math.min(
          100,
          budgetScore + countryScore + experienceScore + employeesScore
        );

        const tags = [];
        if (budgetScore === WEIGHTS.budget) tags.push("high-budget");
        if (countryScore === WEIGHTS.country) tags.push("premium-region");
        if (experienceScore === WEIGHTS.experience) tags.push("experienced");
        if (employeesScore === WEIGHTS.employees) tags.push("mid-large-team");

      /* ------------------------------
         UPDATE LEAD IN DATABASE
      ------------------------------ */
      const update = await pool.query(
        `UPDATE leads
         SET score = $1,
             tags = $2,
             notes = $3,
             updated_at = NOW()
         WHERE email = $4
         RETURNING *`,
        [
          finalScore,
          tags,
          JSON.stringify(answers),
          email
        ]
      );

      if (!update.rows.length) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      // Optional: Sync CRM
      crmService.syncLead(update.rows[0]).catch(console.error);

      return res.json({
        message: 'Assessment submitted successfully',
        lead: update.rows[0],
      });

    } catch (error) {
      console.error('Assessment scoring error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);


/* ======================================================================
   MANUAL CRM SYNC
====================================================================== */
router.post(
  '/:id/sync',
  authenticateToken,
  requireRole('admin', 'editor'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!crmService.isConfigured()) {
        return res.status(400).json({ error: 'CRM integration is not configured' });
      }

      const result = await pool.query('SELECT * FROM leads WHERE id = $1', [req.params.id]);
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      await crmService.syncLead(result.rows[0]);
      res.json({ message: 'Lead sync initiated' });
    } catch (error) {
      console.error('Lead sync error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/* ======================================================================
   DELETE LEAD
====================================================================== */
router.delete(
  '/:id',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query('DELETE FROM leads WHERE id = $1 RETURNING id', [req.params.id]);

      if (!result.rows.length) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
      console.error('Delete lead error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
