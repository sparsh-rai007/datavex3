import express from 'express';
import registerRoutes from './routes/register';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { connectDB } from './db/connection';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import healthRoutes from './routes/health';
import leadsRoutes from './routes/leads';
import postsRoutes from './routes/posts';
import jobsRoutes from './routes/jobs';
import jobApplicationsRoutes from './routes/job-applications';
import aiRoutes from './routes/ai';

import { authenticateToken, requireRole } from "./middleware/auth";

import calRouter from "./routes/cal";
import calWebhookRoute from "./routes/cal-webhook";

import bookingsRouter from "./routes/bookings";
import adminBookingsRoute from "./routes/admin-bookings";

import blogRoutes from './routes/blogs';
import socialRoutes from "./routes/social";

import path from 'path';
import adminUsersRoutes from "./routes/admin-users";

import { initBlogsTable } from "./db/initBlogsTable";
import { migrate } from './db/migrate';




dotenv.config();

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// ---------------------------
// CORS + Security
// ---------------------------
app.use(cors({
  origin: [
    "http://localhost:3000",                // local dev
    "https://datavex.ai",                   // production frontend
    "https://www.datavex.ai",               // if using www
    "https://datavex-frontend.pages.dev"    // Cloudflare build URL
  ],
  credentials: true
}));


app.use(helmet());
app.use(morgan('dev'));

// ---------------------------
// RAW body parser BEFORE express.json()
// ---------------------------
app.use("/api/cal/webhook", express.raw({ type: "application/json" }));

// Standard body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
app.use(rateLimiter);

// ---------------------------
// Routes
// ---------------------------
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth/register', registerRoutes);

app.use('/api/leads', leadsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', jobApplicationsRoutes);
app.use('/api/ai', aiRoutes);

app.use('/api/admin', authenticateToken, adminRoutes);

// Cal.com webhooks & API
app.use("/api/cal", calWebhookRoute);
app.use("/api/cal", calRouter);

// Bookings
app.use("/api/bookings", bookingsRouter);   // Fetch bookings
app.use("/api/admin/bookings", adminBookingsRoute); // Approve / Reject

// Blogs
app.use('/api/blogs', blogRoutes);

// Social
app.use("/api/social", socialRoutes);

// File uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use("/api/admin/users", authenticateToken, requireRole("admin"), adminUsersRoutes);
// Error handler
app.use(errorHandler);

// ---------------------------
// Start Server
// ---------------------------
const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected");
   
 
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
