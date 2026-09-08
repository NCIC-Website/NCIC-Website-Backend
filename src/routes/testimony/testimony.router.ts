import express from "express";
import {
  addVideoTestimony, getAllVideoTestimonies, getPublishedVideoTestimonies,
  toggleVideoPublish, setVideoFeatured, deleteVideoTestimony,
  submitWrittenTestimony, getAllWrittenTestimonies, getPublishedWrittenTestimonies,
  approveWrittenTestimony, toggleWrittenPublish, deleteWrittenTestimony
} from "./testimony.controller";
import { authenticate } from "../../middleware/auth.middleware";

const testimonyRouter = express.Router();

// ── Public ──
testimonyRouter.get("/video/public", getPublishedVideoTestimonies);
testimonyRouter.get("/written/public", getPublishedWrittenTestimonies);
testimonyRouter.post("/written/submit", submitWrittenTestimony);

// ── Admin (auth required) ──
testimonyRouter.get("/video", authenticate, getAllVideoTestimonies);
testimonyRouter.post("/video/add", authenticate, addVideoTestimony);
testimonyRouter.put("/video/:id/publish", authenticate, toggleVideoPublish);
testimonyRouter.put("/video/:id/feature", authenticate, setVideoFeatured);
testimonyRouter.put("/video/:id", authenticate, async (req, res) => {
  const { VideoTestimony } = await import("../../modules/videoTestimony");
  try {
    const t = await VideoTestimony.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ success: false, message: "Not found." });
    return res.status(200).json({ success: true, testimony: t });
  } catch (e) { return res.status(500).json({ success: false, message: String(e) }); }
});
testimonyRouter.delete("/video/:id", authenticate, deleteVideoTestimony);

testimonyRouter.get("/written", authenticate, getAllWrittenTestimonies);
testimonyRouter.put("/written/:id/approve", authenticate, approveWrittenTestimony);
testimonyRouter.put("/written/:id/publish", authenticate, toggleWrittenPublish);
testimonyRouter.put("/written/:id", authenticate, async (req, res) => {
  const { WrittenTestimony } = await import("../../modules/writtenTestimony");
  try {
    const t = await WrittenTestimony.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!t) return res.status(404).json({ success: false, message: "Not found." });
    return res.status(200).json({ success: true, testimony: t });
  } catch (e) { return res.status(500).json({ success: false, message: String(e) }); }
});
testimonyRouter.delete("/written/:id", authenticate, deleteWrittenTestimony);

export default testimonyRouter;
