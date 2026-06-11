import express from "express";
import { submitApplication, getAllApplications, updateApplicationStatus, deleteApplication } from "./bibleCollege.controller";
import { authenticate } from "../../middleware/auth.middleware";

const bibleCollegeRouter = express.Router();

// ── Public ──
bibleCollegeRouter.post("/apply", submitApplication);

// ── Admin (auth required) ──
bibleCollegeRouter.get("/applications", authenticate, getAllApplications);
bibleCollegeRouter.patch("/applications/:id/status", authenticate, updateApplicationStatus);
bibleCollegeRouter.delete("/applications/:id", authenticate, deleteApplication);

export default bibleCollegeRouter;
