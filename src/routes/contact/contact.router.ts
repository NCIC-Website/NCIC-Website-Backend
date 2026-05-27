import express from "express";
import { sendMessage, getAllMessages, markAsRead, deleteMessage } from "./contact.controller";

const contactRouter = express.Router();

contactRouter.post("/send", sendMessage);
contactRouter.get("/messages", getAllMessages);
contactRouter.patch("/messages/:id/read", markAsRead);
contactRouter.delete("/messages/:id", deleteMessage);

export default contactRouter;
