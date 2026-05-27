import express from "express";
import {
  addSeries,
  getAllSeries,
  getPublishedSeries,
  updateSeries,
  toggleSeriesPublish,
  deleteSeries,
} from "./teachingSeries.controller";

const teachingSeriesRouter = express.Router();

// Static before parameterized
teachingSeriesRouter.get("/public", getPublishedSeries);
teachingSeriesRouter.get("/", getAllSeries);
teachingSeriesRouter.post("/add", addSeries);
teachingSeriesRouter.put("/:id/publish", toggleSeriesPublish);
teachingSeriesRouter.put("/:id", updateSeries);
teachingSeriesRouter.delete("/:id", deleteSeries);

export default teachingSeriesRouter;
