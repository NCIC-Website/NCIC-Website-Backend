import express from "express";
import { addSeries, getAllSeries, getPublishedSeries, updateSeries, toggleSeriesPublish, deleteSeries } from "./teachingSeries.controller";
import { authenticate } from "../../middleware/auth.middleware";

const teachingSeriesRouter = express.Router();

// ── Public ──
teachingSeriesRouter.get("/public", getPublishedSeries);

// ── Admin (auth required) ──
teachingSeriesRouter.get("/", authenticate, getAllSeries);
teachingSeriesRouter.post("/add", authenticate, addSeries);
teachingSeriesRouter.put("/:id/publish", authenticate, toggleSeriesPublish);
teachingSeriesRouter.put("/:id", authenticate, updateSeries);
teachingSeriesRouter.delete("/:id", authenticate, deleteSeries);

export default teachingSeriesRouter;
