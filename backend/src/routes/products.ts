import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/products/delisted - Public endpoint to retrieve all delisted product IDs
router.get('/delisted', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id FROM delisted_products');
    const delisted = result.rows.map((row) => row.id);
    res.json({ success: true, delisted });
  } catch (error) {
    console.error('Failed to get delisted products:', error);
    res.status(500).json({ success: false, error: 'Database query failed' });
  }
});

// POST /api/products/delist - Protected endpoint to delist a product
router.post('/delist', authenticateToken, async (req: Request, res: Response) => {
  const { productId } = req.body;

  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing or invalid productId' });
  }

  try {
    await pool.query(
      'INSERT INTO delisted_products (id) VALUES ($1) ON CONFLICT DO NOTHING',
      [productId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(`Failed to delist product ${productId}:`, error);
    res.status(500).json({ success: false, error: 'Database insert failed' });
  }
});

// POST /api/products/list - Protected endpoint to enlist a product back
router.post('/list', authenticateToken, async (req: Request, res: Response) => {
  const { productId } = req.body;

  if (!productId || typeof productId !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing or invalid productId' });
  }

  try {
    await pool.query('DELETE FROM delisted_products WHERE id = $1', [productId]);
    res.json({ success: true });
  } catch (error) {
    console.error(`Failed to enlist product ${productId}:`, error);
    res.status(500).json({ success: false, error: 'Database delete failed' });
  }
});

export default router;
