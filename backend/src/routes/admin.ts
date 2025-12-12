import express, { Response } from 'express';
import { pool } from '../db/connection';
import { AuthRequest, requireRole } from '../middleware/auth';

const router = express.Router();

// Dashboard stats
router.get('/dashboard/stats', requireRole('admin', 'editor', 'viewer'), async (req: AuthRequest, res: Response) => {
  try {
    // Get counts
    const [postsCount, leadsCount, jobsCount, applicationsCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM posts'),
      pool.query('SELECT COUNT(*) as count FROM leads'),
      pool.query('SELECT COUNT(*) as count FROM jobs'),
      pool.query('SELECT COUNT(*) as count FROM job_applications'),
    ]);

    // Get status breakdowns
    const [postsByStatus, leadsByStatus, jobsByStatus, applicationsByStatus] = await Promise.all([
      pool.query('SELECT status, COUNT(*) as count FROM posts GROUP BY status'),
      pool.query('SELECT status, COUNT(*) as count FROM leads GROUP BY status'),
      pool.query('SELECT status, COUNT(*) as count FROM jobs GROUP BY status'),
      pool.query('SELECT status, COUNT(*) as count FROM job_applications GROUP BY status'),
    ]);

    // Get leads by source
    const leadsBySource = await pool.query(
      'SELECT source, COUNT(*) as count FROM leads WHERE source IS NOT NULL GROUP BY source ORDER BY count DESC LIMIT 10'
    );

    // Get top posts by views
    const topPosts = await pool.query(
      'SELECT id, title, views, status, created_at FROM posts ORDER BY views DESC LIMIT 5'
    );

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentLeads, recentPosts, recentApplications] = await Promise.all([
      pool.query(
        'SELECT id, email, first_name, last_name, company, status, created_at FROM leads WHERE created_at >= $1 ORDER BY created_at DESC LIMIT 10',
        [sevenDaysAgo]
      ),
      pool.query(
        'SELECT id, title, status, views, created_at FROM posts WHERE created_at >= $1 ORDER BY created_at DESC LIMIT 10',
        [sevenDaysAgo]
      ),
      pool.query(
        'SELECT id, first_name, last_name, email, status, created_at FROM job_applications WHERE created_at >= $1 ORDER BY created_at DESC LIMIT 10',
        [sevenDaysAgo]
      ),
    ]);

    // Calculate conversion rate (leads converted / total leads)
    const convertedLeads = await pool.query(
      "SELECT COUNT(*) as count FROM leads WHERE status = 'converted'"
    );
    const totalLeads = parseInt(leadsCount.rows[0].count);
    const conversionRate = totalLeads > 0 
      ? ((parseInt(convertedLeads.rows[0].count) / totalLeads) * 100).toFixed(2)
      : '0.00';

    res.json({
      stats: {
        posts: parseInt(postsCount.rows[0].count),
        leads: totalLeads,
        jobs: parseInt(jobsCount.rows[0].count),
        applications: parseInt(applicationsCount.rows[0].count),
        conversionRate: parseFloat(conversionRate),
      },
      breakdowns: {
        posts: postsByStatus.rows,
        leads: leadsByStatus.rows,
        jobs: jobsByStatus.rows,
        applications: applicationsByStatus.rows,
      },
      leadsBySource: leadsBySource.rows,
      topPosts: topPosts.rows,
      recentActivity: {
        leads: recentLeads.rows,
        posts: recentPosts.rows,
        applications: recentApplications.rows,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

