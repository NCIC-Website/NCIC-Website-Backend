import express from "express";
import {
  addTeaching,
  getAllTeachings,
  getPublishedTeachings,
  getTeachingById,
  updateTeaching,
  toggleTeachingPublish,
  toggleTeachingFeatured,
  deleteTeaching,
} from "./teaching.controller";
import { authenticate } from "../../middleware/auth.middleware";

const teachingRouter = express.Router();

// ── Public (no auth) ──
teachingRouter.get("/public", getPublishedTeachings);

// ── Admin (auth required) ──
teachingRouter.get("/", authenticate, getAllTeachings);
teachingRouter.post("/add", authenticate, addTeaching);
teachingRouter.get("/:id", authenticate, getTeachingById);
teachingRouter.put("/:id/publish", authenticate, toggleTeachingPublish);
teachingRouter.put("/:id/feature", authenticate, toggleTeachingFeatured);
teachingRouter.put("/:id", authenticate, updateTeaching);
teachingRouter.delete("/:id", authenticate, deleteTeaching);

export default teachingRouter;
