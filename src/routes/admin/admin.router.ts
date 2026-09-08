import express from "express";
import { addDevotional, addMultipleDevotionals } from "./admin.controller";
import { authenticate, requireRole } from "../../middleware/auth.middleware";

const adminRouter = express.Router();

// Apply authentication to all admin routes
adminRouter.use(authenticate);
adminRouter.use(requireRole('admin', 'superAdmin'));

// Backward-compatible devotional routes
adminRouter.post("/addDevotional", addDevotional);
adminRouter.post("/addMultipleDevotionals", addMultipleDevotionals);

export default adminRouter;
