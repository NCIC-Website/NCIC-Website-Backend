import express from "express";
import {
  addVideoTestimony,
  getAllVideoTestimonies,
  getPublishedVideoTestimonies,
  toggleVideoPublish,
  setVideoFeatured,
  deleteVideoTestimony,
  submitWrittenTestimony,
  getAllWrittenTestimonies,
  getPublishedWrittenTestimonies,
  approveWrittenTestimony,
  toggleWrittenPublish,
  deleteWrittenTestimony,
} from "./testimony.controller";

const testimonyRouter = express.Router();

// ─── Video Testimony Routes ─────────────────────────────────────────────────
// Static routes before parameterized routes
testimonyRouter.get("/video/public", getPublishedVideoTestimonies);
testimonyRouter.get("/video", getAllVideoTestimonies);
testimonyRouter.post("/video/add", addVideoTestimony);
testimonyRouter.put("/video/:id/publish", toggleVideoPublish);
testimonyRouter.put("/video/:id/feature", setVideoFeatured);
testimonyRouter.put("/video/:id", async (req, res) => {
  const { VideoTestimony } = await import("../../modules/videoTestimony");
  try {
    const t = await VideoTestimony.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ success: false, message: "Not found." });
    return res.status(200).json({ success: true, testimony: t });
  } catch (e) { return res.status(500).json({ success: false, message: String(e) }); }
});
testimonyRouter.delete("/video/:id", deleteVideoTestimony);

// ─── Written Testimony Routes ───────────────────────────────────────────────
testimonyRouter.get("/written/public", getPublishedWrittenTestimonies);
testimonyRouter.get("/written", getAllWrittenTestimonies);
testimonyRouter.post("/written/submit", submitWrittenTestimony);
testimonyRouter.put("/written/:id/approve", approveWrittenTestimony);
testimonyRouter.put("/written/:id/publish", toggleWrittenPublish);
testimonyRouter.put("/written/:id", async (req, res) => {
  const { WrittenTestimony } = await import("../../modules/writtenTestimony");
  try {
    const t = await WrittenTestimony.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!t) return res.status(404).json({ success: false, message: "Not found." });
    return res.status(200).json({ success: true, testimony: t });
  } catch (e) { return res.status(500).json({ success: false, message: String(e) }); }
});
testimonyRouter.delete("/written/:id", deleteWrittenTestimony);

export default testimonyRouter;
