import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import { authenticateToken, requireRole } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const dir = 'uploads/logos/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (.png, .jpg, .jpeg, .gif, .svg, .webp) are allowed.'));
    }
  }
});

// POST /api/products/upload-logo - Protected: Admin
router.post(
  '/upload-logo',
  authenticateToken,
  requireRole('admin'),
  (req: Request, res: Response, next: any) => {
    upload.single('logo')(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }
      const logoUrl = `/uploads/logos/${req.file.filename}`;
      res.json({ success: true, logoUrl });
    } catch (error: any) {
      console.error('Logo upload error:', error);
      res.status(500).json({ success: false, error: 'Failed to upload logo' });
    }
  }
);

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
    logo_url,
    color,
    icon_color,
    icon_bg,
    glow,
    features,
    tech_stack
  } = req.body;

  if (!id || !name || !category || !tagline || !description || !detailed_description || !metric || !metric_label || (!icon && !logo_url) || !color) {
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
        metric, metric_label, icon, logo_url, color, icon_color, icon_bg, glow, features, tech_stack
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
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
      icon || null,
      logo_url || null,
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
    logo_url,
    color,
    icon_color,
    icon_bg,
    glow,
    features,
    tech_stack
  } = req.body;

  if (!name || !category || !tagline || !description || !detailed_description || !metric || !metric_label || (!icon && !logo_url) || !color) {
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
          metric = $6, metric_label = $7, icon = $8, logo_url = $9, color = $10, icon_color = $11, icon_bg = $12,
          glow = $13, features = $14, tech_stack = $15, updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
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
      icon || null,
      logo_url || null,
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
