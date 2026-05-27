import express, { Express, Request, Response, NextFunction } from "express";
import mongoose, { ConnectOptions } from "mongoose";
import bodyParser from "body-parser";
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

// CORS middleware — must be before all other middleware and routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = ["http://localhost:5173", "http://localhost:8080"];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

mongoose
  .connect(dev.db.dbUrl, { useNewUrlParser: true } as ConnectOptions)
  .then(async (res) => {
    console.log("Connected to db");
    await createInitialAdmin();
  })
  .catch((err) => {
    console.log("dbUrl ", dev.db.dbUrl);
    console.log("Error while connecting to db " + err);
});

// Start the daily devotional publishing scheduler
startDailyDevotionalPublish();

import { authenticate, requireRole } from "./middleware/auth.middleware";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/test", testRouter);
app.use("/auth", authRoutes);

// Public endpoints (no auth needed — used by the public website)
app.use("/devotional/today", devotionalRouter);
app.use("/teaching/public", teachingRouter);
app.use("/teaching-series/public", teachingSeriesRouter);
app.use("/testimony/video/public", testimonyRouter);
app.use("/testimony/written/public", testimonyRouter);
app.use("/testimony/written/submit", testimonyRouter);
app.use("/newsletter/subscribe", newsletterRouter);
app.use("/contact/send", contactRouter);
app.use("/bible-college/apply", bibleCollegeRouter);

// Protected admin routes
app.use("/admin", authenticate, adminRouter);
app.use("/devotional", authenticate, devotionalRouter);
app.use("/teaching", authenticate, teachingRouter);
app.use("/teaching-series", authenticate, teachingSeriesRouter);
app.use("/testimony", authenticate, testimonyRouter);
app.use("/newsletter", authenticate, newsletterRouter);
app.use("/contact", authenticate, contactRouter);
app.use("/bible-college", authenticate, bibleCollegeRouter);

export default app
