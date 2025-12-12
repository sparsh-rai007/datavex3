import express, { Request, Response } from 'express';
import { pool, testConnection } from '../db/connection';

const router = express.Router();

const serviceStartedAt = new Date();

// Basic liveness probe
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    startedAt: serviceStartedAt.toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Service status with subsystems
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const dbHealthy = await testConnection();

    res.json({
      status: dbHealthy ? 'ok' : 'degraded',
      services: {
        database: dbHealthy ? 'ok' : 'error',
        ai: process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here' ? 'configured' : 'mock',
        crm: process.env.CRM_PROVIDER && process.env.CRM_PROVIDER !== 'none' ? 'configured' : 'disabled',
        email: process.env.SMTP_HOST ? 'configured' : 'disabled',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Metrics endpoint
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const memory = process.memoryUsage();
    const dbHealthy = await testConnection();

    res.json({
      uptime_seconds: process.uptime(),
      memory: {
        rss: memory.rss,
        heapTotal: memory.heapTotal,
        heapUsed: memory.heapUsed,
        external: memory.external,
      },
      env: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
      },
      services: {
        database: dbHealthy ? 'ok' : 'error',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
});

// Database health check endpoint
router.get('/db', async (req: Request, res: Response) => {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      // Get database info
      const dbInfo = await pool.query(`
        SELECT 
          current_database() as database,
          version() as version,
          current_user as user,
          inet_server_addr() as server_address,
          inet_server_port() as server_port
      `);
      
      // Get table count
      const tableCount = await pool.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      res.json({
        status: 'connected',
        database: dbInfo.rows[0].database,
        version: dbInfo.rows[0].version.split(' ')[0] + ' ' + dbInfo.rows[0].version.split(' ')[1],
        user: dbInfo.rows[0].user,
        server: `${dbInfo.rows[0].server_address || 'localhost'}:${dbInfo.rows[0].server_port || '5432'}`,
        tables: parseInt(tableCount.rows[0].count),
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'disconnected',
        error: 'Database connection failed',
      });
    }
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      error: error.message,
    });
  }
});

export default router;

