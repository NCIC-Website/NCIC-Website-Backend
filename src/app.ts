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
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:8080",
    process.env.FRONTEND_URL,        // your Vercel URL e.g. https://your-app.vercel.app
  ].filter(Boolean) as string[];
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

export default app
