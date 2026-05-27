import express from "express";
import {
  getAllDevotionals,
  toggleDevotionalPublish,
  getTodayDevotional,
  addDevotional,
  addMultipleDevotionals,
  updateDevotional,
  deleteDevotional,
  getDevotionalById,
} from "./devotional.controller";

const devotionalRouter = express.Router();

// Static routes before parameterized routes
devotionalRouter.get("/today", getTodayDevotional);
devotionalRouter.get("/", getAllDevotionals);
devotionalRouter.post("/add", addDevotional);
devotionalRouter.post("/add-multiple", addMultipleDevotionals);
devotionalRouter.get("/:id", getDevotionalById);
devotionalRouter.put("/:id/publish", toggleDevotionalPublish);
devotionalRouter.put("/:id", updateDevotional);
devotionalRouter.delete("/:id", deleteDevotional);

export default devotionalRouter;
