import express from "express";

import { 
    addContentManger, 
    getAllContentManagers,
    addDevotional,
    addMultipleDevotionals
} from "./admin.controller";

const adminRouter = express.Router();

// Admin Login Route
adminRouter.post('/addContentManager', addContentManger );
adminRouter.get('/getAllContentManagers', getAllContentManagers );
adminRouter.post('/addDevotional', addDevotional );
adminRouter.post('/addMultipleDevotionals', addMultipleDevotionals );

export default adminRouter;