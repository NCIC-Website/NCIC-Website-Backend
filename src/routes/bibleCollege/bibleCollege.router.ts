import express from "express";
import { submitApplication, getAllApplications, updateApplicationStatus, deleteApplication } from "./bibleCollege.controller";

const bibleCollegeRouter = express.Router();

bibleCollegeRouter.post("/apply", submitApplication);
bibleCollegeRouter.get("/applications", getAllApplications);
bibleCollegeRouter.patch("/applications/:id/status", updateApplicationStatus);
bibleCollegeRouter.delete("/applications/:id", deleteApplication);

export default bibleCollegeRouter;
