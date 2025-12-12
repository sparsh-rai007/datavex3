import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { aiService } from '../services/ai';
import { pool } from '../db/connection';

const router = express.Router();

// Content suggestion endpoint
router.post(
  '/content/suggest',
  authenticateToken,
  requireRole('admin', 'editor'),
  [
    body('content').notEmpty().withMessage('Content is required'),
    body('title').optional(),
    body('type').optional(),
    body('targetAudience').optional(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content, title, type, targetAudience } = req.body;

      const result = await aiService.suggestContent(content, {
        title,
        type,
        targetAudience,
      });

      res.json(result);
    } catch (error: any) {
      console.error('Content suggestion error:', error);
      res.status(500).json({ error: 'Failed to generate content suggestions' });
    }
  }
);

// SEO suggestion endpoint
router.post(
  '/seo/suggest',
  authenticateToken,
  requireRole('admin', 'editor'),
  [
    body('title').optional(),
    body('metaDescription').optional(),
    body('content').optional(),
    body('keywords').optional().isArray(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, metaDescription, content, keywords } = req.body;

      const result = await aiService.suggestSEO({
        title,
        metaDescription,
        content,
        keywords,
      });

      res.json(result);
    } catch (error: any) {
      console.error('SEO suggestion error:', error);
      res.status(500).json({ error: 'Failed to generate SEO suggestions' });
    }
  }
);



// Resume parsing endpoint
router.post(
  '/resume/parse',
  authenticateToken,
  requireRole('admin', 'recruiter'),
  [body('resumeText').notEmpty().withMessage('Resume text is required')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { resumeText } = req.body;

      const result = await aiService.parseResume(resumeText);

      res.json(result);
    } catch (error: any) {
      console.error('Resume parsing error:', error);
      res.status(500).json({ error: 'Failed to parse resume' });
    }
  }
);

// Chatbot endpoint (public, but rate-limited)
router.post(
  '/chat',
  [
    body('message').notEmpty().withMessage('Message is required'),
    body('history').optional().isArray(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { message, history } = req.body;

      // Reply using AI service
      const reply = await aiService.chat(message, history || []);

      return res.json({ response: reply.message });
    } catch (err: any) {
      console.error('Chatbot error:', err);
      return res.status(500).json({ error: 'Failed to process chat message' });
    }
  }
);




export default router;



