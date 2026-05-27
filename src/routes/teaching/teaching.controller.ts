import { Request, Response } from "express";
import mongoose from "mongoose";
import { Teaching } from "../../modules/teaching";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function isCastError(error: unknown): boolean {
  return error instanceof mongoose.Error.CastError;
}

const REQUIRED_FIELDS = ["title", "speaker", "date", "youtube_url", "category"] as const;

export async function addTeaching(req: Request, res: Response) {
  try {
    const missing = REQUIRED_FIELDS.filter((f) => !req.body[f]);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}.`,
      });
    }

    const teaching = new Teaching({ ...req.body, is_published: false });
    await teaching.save();
    return res.status(201).json({ success: true, teaching });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Failed to add teaching.", error: getErrorMessage(error) });
  }
}

export async function getAllTeachings(req: Request, res: Response) {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.is_published !== undefined) {
      filter.is_published = req.query.is_published === "true";
    }

    const teachings = await Teaching.find(filter).sort({ date: -1 });
    return res.status(200).json({ success: true, teachings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve teachings.", error: getErrorMessage(error) });
  }
}

export async function getPublishedTeachings(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { is_published: true };
    if (req.query.category) filter.category = req.query.category;

    const [teachings, total] = await Promise.all([
      Teaching.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
      Teaching.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, data: teachings, total, page, limit });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve teachings.", error: getErrorMessage(error) });
  }
}

export async function getTeachingById(req: Request, res: Response) {
  try {
    const teaching = await Teaching.findById(req.params.id);
    if (!teaching) {
      return res.status(404).json({ success: false, message: "Teaching not found." });
    }
    return res.status(200).json({ success: true, teaching });
  } catch (error) {
    if (isCastError(error)) {
      return res.status(400).json({ success: false, message: "Invalid teaching ID." });
    }
    return res.status(500).json({ success: false, message: "Failed to retrieve teaching.", error: getErrorMessage(error) });
  }
}

export async function updateTeaching(req: Request, res: Response) {
  try {
    const teaching = await Teaching.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!teaching) {
      return res.status(404).json({ success: false, message: "Teaching not found." });
    }
    return res.status(200).json({ success: true, teaching });
  } catch (error) {
    if (isCastError(error)) {
      return res.status(400).json({ success: false, message: "Invalid teaching ID." });
    }
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Failed to update teaching.", error: getErrorMessage(error) });
  }
}

export async function toggleTeachingPublish(req: Request, res: Response) {
  try {
    const { is_published } = req.body;
    if (typeof is_published !== "boolean") {
      return res.status(400).json({ success: false, message: "is_published must be a boolean." });
    }

    const teaching = await Teaching.findByIdAndUpdate(
      req.params.id,
      { $set: { is_published } },
      { new: true }
    );
    if (!teaching) {
      return res.status(404).json({ success: false, message: "Teaching not found." });
    }
    return res.status(200).json({ success: true, teaching });
  } catch (error) {
    if (isCastError(error)) {
      return res.status(400).json({ success: false, message: "Invalid teaching ID." });
    }
    return res.status(500).json({ success: false, message: "Failed to update teaching.", error: getErrorMessage(error) });
  }
}

export async function deleteTeaching(req: Request, res: Response) {
  try {
    const teaching = await Teaching.findByIdAndDelete(req.params.id);
    if (!teaching) {
      return res.status(404).json({ success: false, message: "Teaching not found." });
    }
    return res.status(200).json({ success: true, message: "Teaching deleted successfully." });
  } catch (error) {
    if (isCastError(error)) {
      return res.status(400).json({ success: false, message: "Invalid teaching ID." });
    }
    return res.status(500).json({ success: false, message: "Failed to delete teaching.", error: getErrorMessage(error) });
  }
}

export async function toggleTeachingFeatured(req: Request, res: Response) {
  try {
    const { is_featured } = req.body;
    if (typeof is_featured !== "boolean") {
      return res.status(400).json({ success: false, message: "is_featured must be a boolean." });
    }
    // Max 3 featured — only enforce when adding a new featured
    if (is_featured) {
      const featuredCount = await Teaching.countDocuments({ is_featured: true });
      if (featuredCount >= 3) {
        return res.status(400).json({
          success: false,
          message: "You can only feature up to 3 teachings. Remove a featured teaching first.",
        });
      }
    }
    const teaching = await Teaching.findByIdAndUpdate(
      req.params.id,
      { $set: { is_featured } },
      { new: true }
    );
    if (!teaching) {
      return res.status(404).json({ success: false, message: "Teaching not found." });
    }
    return res.status(200).json({ success: true, teaching });
  } catch (error) {
    if (isCastError(error)) {
      return res.status(400).json({ success: false, message: "Invalid teaching ID." });
    }
    return res.status(500).json({ success: false, message: "Failed to update teaching.", error: getErrorMessage(error) });
  }
}
