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

const teachingRouter = express.Router();

// Static routes MUST come before parameterized routes
teachingRouter.get("/public", getPublishedTeachings);
teachingRouter.get("/", getAllTeachings);
teachingRouter.post("/add", addTeaching);
teachingRouter.get("/:id", getTeachingById);
teachingRouter.put("/:id/publish", toggleTeachingPublish);
teachingRouter.put("/:id/feature", toggleTeachingFeatured);
teachingRouter.put("/:id", updateTeaching);
teachingRouter.delete("/:id", deleteTeaching);

export default teachingRouter;
