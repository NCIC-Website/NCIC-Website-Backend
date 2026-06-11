import express from "express";
import { subscribe, getAllSubscribers, unsubscribe } from "./newsletter.controller";
import { authenticate } from "../../middleware/auth.middleware";

const newsletterRouter = express.Router();

// ── Public ──
newsletterRouter.post("/subscribe", subscribe);

// ── Admin (auth required) ──
newsletterRouter.get("/subscribers", authenticate, getAllSubscribers);
newsletterRouter.post("/unsubscribe", authenticate, unsubscribe);

export default newsletterRouter;
