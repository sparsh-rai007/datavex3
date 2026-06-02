import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/products - Public endpoint to retrieve all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at ASC');
    res.json({ success: true, products: result.rows });
  } catch (error) {
    console.error('Failed to get products:', error);
    res.status(500).json({ success: false, error: 'Database query failed' });
  }
});

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

// POST /api/products - Create a new product (Protected: Admin)
router.post('/', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  const {
    id,
    name,
    category,
    tagline,
    description,
    detailed_description,
    metric,
    metric_label,
    icon,
    color,
    icon_color,
    icon_bg,
    glow,
    features,
    tech_stack
  } = req.body;

  if (!id || !name || !category || !tagline || !description || !detailed_description || !metric || !metric_label || !icon || !color) {
    return res.status(400).json({ success: false, error: 'Missing required product fields' });
  }

  try {
    const checkExist = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (checkExist.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Product with this ID already exists' });
    }

    const query = `
      INSERT INTO products (
        id, name, category, tagline, description, detailed_description,
        metric, metric_label, icon, color, icon_color, icon_bg, glow, features, tech_stack
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      id,
      name,
      category,
      tagline,
      description,
      detailed_description,
      metric,
      metric_label,
      icon,
      color,
      icon_color || null,
      icon_bg || null,
      glow || null,
      JSON.stringify(features || []),
      JSON.stringify(tech_stack || [])
    ];

    const result = await pool.query(query, values);
    res.status(201).json({ success: true, product: result.rows[0] });
  } catch (error) {
    console.error('Failed to create product:', error);
    res.status(500).json({ success: false, error: 'Database insert failed' });
  }
});

// PUT /api/products/:id - Update an existing product (Protected: Admin)
router.put('/:id', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    category,
    tagline,
    description,
    detailed_description,
    metric,
    metric_label,
    icon,
    color,
    icon_color,
    icon_bg,
    glow,
    features,
    tech_stack
  } = req.body;

  if (!name || !category || !tagline || !description || !detailed_description || !metric || !metric_label || !icon || !color) {
    return res.status(400).json({ success: false, error: 'Missing required product fields' });
  }

  try {
    const checkExist = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const query = `
      UPDATE products
      SET name = $1, category = $2, tagline = $3, description = $4, detailed_description = $5,
          metric = $6, metric_label = $7, icon = $8, color = $9, icon_color = $10, icon_bg = $11,
          glow = $12, features = $13, tech_stack = $14, updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *
    `;

    const values = [
      name,
      category,
      tagline,
      description,
      detailed_description,
      metric,
      metric_label,
      icon,
      color,
      icon_color || null,
      icon_bg || null,
      glow || null,
      JSON.stringify(features || []),
      JSON.stringify(tech_stack || []),
      id
    ];

    const result = await pool.query(query, values);
    res.json({ success: true, product: result.rows[0] });
  } catch (error) {
    console.error(`Failed to update product ${id}:`, error);
    res.status(500).json({ success: false, error: 'Database update failed' });
  }
});

// DELETE /api/products/:id - Delete a product (Protected: Admin)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const checkExist = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (checkExist.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Also clean up from delisted_products if it was there
    await pool.query('DELETE FROM delisted_products WHERE id = $1', [id]);
    await pool.query('DELETE FROM products WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete product ${id}:`, error);
    res.status(500).json({ success: false, error: 'Database delete failed' });
  }
});

export default router;
