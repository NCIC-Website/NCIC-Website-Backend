import { Request, Response } from "express";
import { BibleCollegeApplication } from "../../modules/bibleCollegeApplication";

function err(e: unknown) { return e instanceof Error ? e.message : String(e); }

export async function submitApplication(req: Request, res: Response) {
  try {
    const required = ["full_name", "email", "phone", "date_of_birth", "gender", "education_level", "program_interest", "learning_mode", "address"];
    const missing = required.filter(f => !req.body[f]?.trim?.() || !req.body[f]);
    
    if (missing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Please complete all required fields: ${missing.join(", ")}.` 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address."
      });
    }

    // Check for duplicate applications
    const existingApp = await BibleCollegeApplication.findOne({ 
      email: req.body.email.toLowerCase().trim() 
    });

    if (existingApp) {
      return res.status(409).json({
        success: false,
        message: "An application with this email already exists. Please contact us if you need to update your application."
      });
    }

    const app = new BibleCollegeApplication(req.body);
    await app.save();
    
    return res.status(201).json({ 
      success: true, 
      message: "Thank you for your application! We will review it and contact you within 5-7 business days.",
      application_id: app._id
    });
  } catch (e) {
    console.error('Bible College application error:', err(e));
    return res.status(500).json({ 
      success: false, 
      message: "Failed to submit application. Please try again later." 
    });
  }
}

export async function getAllApplications(req: Request, res: Response) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const applications = await BibleCollegeApplication.find(filter).sort({ submitted_at: -1 });
    const counts = {
      total: await BibleCollegeApplication.countDocuments(),
      pending: await BibleCollegeApplication.countDocuments({ status: "pending" }),
      reviewed: await BibleCollegeApplication.countDocuments({ status: "reviewed" }),
      accepted: await BibleCollegeApplication.countDocuments({ status: "accepted" }),
      rejected: await BibleCollegeApplication.countDocuments({ status: "rejected" }),
    };
    return res.status(200).json({ success: true, applications, counts });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to retrieve applications.", error: err(e) });
  }
}

export async function updateApplicationStatus(req: Request, res: Response) {
  try {
    const { status } = req.body;
    const valid = ["pending", "reviewed", "accepted", "rejected"];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${valid.join(", ")}.` });
    }
    const app = await BibleCollegeApplication.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
    if (!app) return res.status(404).json({ success: false, message: "Application not found." });
    return res.status(200).json({ success: true, application: app });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to update status.", error: err(e) });
  }
}

export async function deleteApplication(req: Request, res: Response) {
  try {
    const app = await BibleCollegeApplication.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: "Application not found." });
    return res.status(200).json({ success: true, message: "Application deleted." });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to delete application.", error: err(e) });
  }
}
