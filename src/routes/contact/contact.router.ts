import express from "express";
import { sendMessage, getAllMessages, markAsRead, deleteMessage } from "./contact.controller";
import { authenticate } from "../../middleware/auth.middleware";

const contactRouter = express.Router();

// ── Public ──
contactRouter.post("/send", sendMessage);

// ── Admin (auth required) ──
contactRouter.get("/messages", authenticate, getAllMessages);
contactRouter.patch("/messages/:id/read", authenticate, markAsRead);
contactRouter.delete("/messages/:id", authenticate, deleteMessage);

export default contactRouter;
