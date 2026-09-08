import { Request, Response } from "express";
import { Newsletter } from "../../modules/newsletter";

export async function subscribe(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Email address is required." 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid email address." 
      });
    }

    const existing = await Newsletter.findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.is_active) {
        return res.status(409).json({ 
          success: false, 
          message: "This email is already subscribed to our newsletter." 
        });
      }
      existing.is_active = true;
      existing.subscribed_at = new Date();
      await existing.save();

      return res.status(200).json({ 
        success: true, 
        message: "Welcome back! You have been re-subscribed to our newsletter." 
      });
    }

    const subscriber = new Newsletter({ email: normalizedEmail });
    await subscriber.save();

    return res.status(201).json({ 
      success: true, 
      message: "Thank you for subscribing! You'll receive our latest updates." 
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Subscription failed. Please try again later." 
    });
  }
}

export async function getAllSubscribers(req: Request, res: Response) {
  try {
    const subscribers = await Newsletter.find({ is_active: true }).sort({ subscribed_at: -1 });
    return res.status(200).json({ success: true, subscribers, total: subscribers.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve subscribers.", error: error instanceof Error ? error.message : String(error) });
  }
}

export async function unsubscribe(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase().trim() });
    if (!subscriber) return res.status(404).json({ success: false, message: "Email not found." });

    subscriber.is_active = false;
    await subscriber.save();
    return res.status(200).json({ success: true, message: "Successfully unsubscribed." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to unsubscribe.", error: error instanceof Error ? error.message : String(error) });
  }
}