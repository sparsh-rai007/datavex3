import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import cron from "node-cron";

import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";
import { connectDB } from "./db/connection";
import { authenticateToken, requireRole } from "./middleware/auth";

// Routes
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth";
import registerRoutes from "./routes/register";
import leadsRoutes from "./routes/leads";
import postsRoutes from "./routes/posts";
import jobsRoutes from "./routes/jobs";
import jobApplicationsRoutes from "./routes/job-applications";
import aiRoutes from "./routes/ai";
import adminRoutes from "./routes/admin";
import adminUsersRoutes from "./routes/admin-users";
import adminNewsletterRoutes from "./routes/admin-newsletter";
import bookingsRouter from "./routes/bookings";
import adminBookingsRoute from "./routes/admin-bookings";
import blogRoutes from "./routes/blogs";
import blogGenerateRoutes from "./routes/blog-generate";
import blogReviewRoutes from "./routes/blog-review";
import socialRoutes from "./routes/social";
import calRouter from "./routes/cal";
import calWebhookRoute from "./routes/cal-webhook";
import { generateDailyNewsletter } from "./services/dailyNewsletterService";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

const PORT = Number(process.env.PORT) || 5000;

//
// ---------------------------------------------
// Security & Middleware
// ---------------------------------------------
//

// ? Minimal, correct CORS
// Because nginx makes this SAME ORIGIN
app.use(
  cors({
    origin: true, // reflect request origin
    credentials: true,
  })
);

//app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
  })
);

app.use(morgan("dev"));

// Cal.com webhook needs raw body
app.use("/api/cal/webhook", express.raw({ type: "application/json" }));

// Standard parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
app.use(rateLimiter);

//
// ---------------------------------------------
// Routes
// ---------------------------------------------
//

app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/auth/register", registerRoutes);

app.use("/api/leads", leadsRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", jobApplicationsRoutes);
app.use("/api/ai", aiRoutes);

app.use("/api/admin", authenticateToken, adminRoutes);
app.use("/api/admin/users", authenticateToken, requireRole("admin"), adminUsersRoutes);
app.use("/api/admin/newsletter", adminNewsletterRoutes);

app.use("/api/bookings", bookingsRouter);
app.use("/api/admin/bookings", adminBookingsRoute);

app.use("/api/blogs", blogRoutes);
app.use("/api/blog", blogGenerateRoutes);
app.use("/api/blog", blogReviewRoutes);

app.use("/api/social", socialRoutes);

// Cal.com
app.use("/api/cal", calWebhookRoute);
app.use("/api/cal", calRouter);

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Error handler LAST
app.use(errorHandler);

//
// ---------------------------------------------
// Start server
// ---------------------------------------------
//

const startServer = async () => {
  try {
    await connectDB();
    console.log("? Database connected");

    cron.schedule("0 3 * * *", async () => {
      console.log("Starting daily newsletter generation...");
      try {
        await generateDailyNewsletter();
      } catch (error) {
        console.error("Failed daily newsletter generation:", error);
      }
    });
    console.log("Daily newsletter cron scheduled for 03:00 server time");

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`?? Backend listening on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("? Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
