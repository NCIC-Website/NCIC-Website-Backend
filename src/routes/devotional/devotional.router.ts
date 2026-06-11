import express from "express";
import {
  getAllDevotionals, toggleDevotionalPublish, getTodayDevotional,
  addDevotional, addMultipleDevotionals, updateDevotional, deleteDevotional, getDevotionalById,
} from "./devotional.controller";
import { authenticate } from "../../middleware/auth.middleware";

const devotionalRouter = express.Router();

// ── Public ──
devotionalRouter.get("/today", getTodayDevotional);

// ── Admin (auth required) ──
devotionalRouter.get("/", authenticate, getAllDevotionals);
devotionalRouter.post("/add", authenticate, addDevotional);
devotionalRouter.post("/add-multiple", authenticate, addMultipleDevotionals);
devotionalRouter.get("/:id", authenticate, getDevotionalById);
devotionalRouter.put("/:id/publish", authenticate, toggleDevotionalPublish);
devotionalRouter.put("/:id", authenticate, updateDevotional);
devotionalRouter.delete("/:id", authenticate, deleteDevotional);

export default devotionalRouter;
