import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticateToken, requireRole } from '../middleware/auth';
import { uploadToCloudinary } from '../services/cloudinary';

const router = Router();

// Use memory storage so we get a buffer (no local disk writes)
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (png, jpg, jpeg, gif, svg, webp) are allowed.'));
    }
  },
});

/**
 * POST /api/upload/image
 * Accepts a single image via multipart/form-data field "image".
 * Uploads to Cloudinary and returns { url: "https://res.cloudinary.com/..." }
 */
router.post(
  '/image',
  authenticateToken,
  requireRole('admin', 'editor'),
  (req: Request, res: Response, next: any) => {
    memoryUpload.single('image')(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const url = await uploadToCloudinary(req.file.buffer, 'datavex');
      res.json({ url });
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);

export default router;
