import { Request, Response } from "express";
import { ContactMessage } from "../../modules/contactMessage";

function err(e: unknown) { return e instanceof Error ? e.message : String(e); }

export async function sendMessage(req: Request, res: Response) {
  try {
    const { full_name, email, message } = req.body;
    
    // Basic validation
    if (!full_name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required and cannot be empty." 
      });
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid email address." 
      });
    }

    // Message length check
    if (message.length > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: "Message is too long. Please limit to 1000 characters." 
      });
    }

    const msg = new ContactMessage({ 
      full_name: full_name.trim(), 
      email: email.toLowerCase().trim(), 
      message: message.trim() 
    });
    
    await msg.save();

    return res.status(201).json({ 
      success: true, 
      message: "Thank you for your message! We'll get back to you soon." 
    });
  } catch (e) {
    console.error('Contact form error:', err(e));
    return res.status(500).json({ 
      success: false, 
      message: "Failed to send message. Please try again later." 
    });
  }
}

export async function getAllMessages(req: Request, res: Response) {
  try {
    const messages = await ContactMessage.find().sort({ sent_at: -1 });
    const unread = await ContactMessage.countDocuments({ is_read: false });
    return res.status(200).json({ success: true, messages, unread });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to retrieve messages.", error: err(e) });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { $set: { is_read: true } }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: "Message not found." });
    return res.status(200).json({ success: true, message: msg });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to update message.", error: err(e) });
  }
}

export async function deleteMessage(req: Request, res: Response) {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found." });
    return res.status(200).json({ success: true, message: "Message deleted." });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to delete message.", error: err(e) });
  }
}
