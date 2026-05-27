import express from "express";
import { addDevotional, addMultipleDevotionals } from "./admin.controller";

const adminRouter = express.Router();

// Backward-compatible devotional routes (also available at /devotional/add)
adminRouter.post("/addDevotional", addDevotional);
adminRouter.post("/addMultipleDevotionals", addMultipleDevotionals);

export default adminRouter;
