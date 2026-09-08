import express, { Express, Request, Response, NextFunction } from "express";
import mongoose, { ConnectOptions } from "mongoose";
import bodyParser from "body-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import dev from "../config/default";
import { startDailyDevotionalPublish } from "./modules/dailyDevotional";

import testRouter from "./routes/test/test.router";
import { createInitialAdmin } from "./modules/createSystemAdmin";
import authRoutes from "./routes/auth/auth.router";
import adminRouter from "./routes/admin/admin.router";
import devotionalRouter from "./routes/devotional/devotional.router";
import teachingRouter from "./routes/teaching/teaching.router";
import teachingSeriesRouter from "./routes/teachingSeries/teachingSeries.router";
import testimonyRouter from "./routes/testimony/testimony.router";
import newsletterRouter from "./routes/newsletter/newsletter.router";
import contactRouter from "./routes/contact/contact.router";
import bibleCollegeRouter from "./routes/bibleCollege/bibleCollege.router";

const app: Express = express();

// HTTPS Redirect Middleware (for production behind proxy)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.youtube.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'", "https://www.youtube.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow YouTube embeds
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit login attempts
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  skipSuccessfulRequests: true,
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit contact form submissions
  message: { success: false, message: 'Too many messages sent, please try again later.' }
});

app.use(globalLimiter);

// CORS middleware — must be before all other middleware and routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:8080",
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Admin-Secret");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Trust proxy (for accurate IP addresses behind reverse proxy)
app.set('trust proxy', 1);

mongoose
  .connect(dev.db.dbUrl)
  .then(async (res) => {
    console.log("Connected to db");
    console.log("Database name:", res.connection.db?.databaseName);
    await createInitialAdmin();
  })
  .catch((err) => {
    console.log("dbUrl ", dev.db.dbUrl);
    console.log("Error while connecting to db " + err);
});

// Start the daily devotional publishing scheduler
startDailyDevotionalPublish();

// Request parsing with size limits
app.use(bodyParser.json({ limit: '10mb' })); // Increased for image uploads
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// MongoDB injection protection
app.use(mongoSanitize({
  replaceWith: '_'
}));

// Apply rate limiting to specific routes
app.use("/auth", authLimiter);
app.use("/contact", contactLimiter);

app.use("/test", testRouter);
app.use("/auth", authRoutes);

// All routers mounted without global auth — each router handles its own auth internally
app.use("/devotional", devotionalRouter);
app.use("/teaching", teachingRouter);
app.use("/teaching-series", teachingSeriesRouter);
app.use("/testimony", testimonyRouter);
app.use("/newsletter", newsletterRouter);
app.use("/contact", contactRouter);
app.use("/bible-college", bibleCollegeRouter);
app.use("/admin", adminRouter);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app
