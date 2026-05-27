import express from "express";
import { subscribe, getAllSubscribers, unsubscribe } from "./newsletter.controller";

const newsletterRouter = express.Router();

newsletterRouter.post("/subscribe", subscribe);
newsletterRouter.get("/subscribers", getAllSubscribers);
newsletterRouter.post("/unsubscribe", unsubscribe);

export default newsletterRouter;
