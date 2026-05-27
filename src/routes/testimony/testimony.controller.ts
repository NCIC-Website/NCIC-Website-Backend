import { Request, Response } from "express";
import mongoose from "mongoose";
import { VideoTestimony } from "../../modules/videoTestimony";
import { WrittenTestimony } from "../../modules/writtenTestimony";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function isCastError(error: unknown): boolean {
  return error instanceof mongoose.Error.CastError;
}

// ─── Video Testimony Controllers ───────────────────────────────────────────

export async function addVideoTestimony(req: Request, res: Response) {
  try {
    const { title, name, youtube_url } = req.body;
    if (!title || !name || !youtube_url) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, name, youtube_url.",
      });
    }

    const testimony = new VideoTestimony({ title, name, youtube_url, is_featured: false, is_published: false });
    await testimony.save();
    return res.status(201).json({ success: true, testimony });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Failed to add video testimony.", error: getErrorMessage(error) });
  }
}

export async function getAllVideoTestimonies(req: Request, res: Response) {
  try {
    const testimonies = await VideoTestimony.find().sort({ created_at: -1 });
    return res.status(200).json({ success: true, testimonies });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve video testimonies.", error: getErrorMessage(error) });
  }
}

export async function getPublishedVideoTestimonies(req: Request, res: Response) {
  try {
    const testimonies = await VideoTestimony.find({ is_published: true }).sort({ is_featured: -1, created_at: -1 });
    return res.status(200).json({ success: true, testimonies });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve video testimonies.", error: getErrorMessage(error) });
  }
}

export async function toggleVideoPublish(req: Request, res: Response) {
  try {
    const { is_published } = req.body;
    if (typeof is_published !== "boolean") {
      return res.status(400).json({ success: false, message: "is_published must be a boolean." });
    }

    const testimony = await VideoTestimony.findByIdAndUpdate(
      req.params.id,
      { $set: { is_published } },
      { new: true },
    );
    if (!testimony) {
      return res.status(404).json({ success: false, message: "Video testimony not found." });
    }
    return res.status(200).json({ success: true, testimony });
  } catch (error) {
    if (isCastError(error)) {
      return res.status(400).json({ success: false, message: "Invalid testimony ID." });
    }
    return res.status(500).json({ success: false, message: "Failed to update video testimony.", error: getErrorMessage(error) });
  }
}

export async function setVideoFeatured(req: Request, res: Response) {
  try {
    const { is_featured } = req.body;
    if (typeof is_featured !== "boolean") {
      return res.status(400).json({ success: false, message: "is_featured must be a boolean." });
    }

    // When setting featured=true, unset any existing featured testimony first
    if (is_featured) {
      await VideoTestimony.updateMany({ is_featured: true }, { $set: { is_featured: false } });
    }

    const testimony = await VideoTestimony.findByIdAndUpdate(
      req.params.id,
      { $set: { is_featured } },
      { new: true },
    );
    if (!testimony) {
      return res.status(404).json({ success: false, message: "Video testimony not found." });
    }
    return res.status(200).json({ success: true, testimony });
  } catch (error) {
    if (isCastError(error)) {
      return res.status(400).json({ success: false, message: "Invalid testimony ID." });
    }
    return res.status(500).json({ success: false, message: "Failed to update video testimony.", error: getErrorMessage(error) });
  }
}

export async function deleteVideoTestimony(req: Request, res: Response) {
  try {
    const testimony = await VideoTestimony.findByIdAndDelete(req.params.id);
    if (!testimony) {
      return res.status(404).json({ success: false, message: "Video testimony not found." });
    }
    return res.status(200).json({ success: true, message: "Video testimony deleted successfully." });
  } catch (error) {
    if (isCastError(error)) {
      return res.status(400).json({ success: false, message: "Invalid testimony ID." });
    }
    return res.status(500).json({ success: false, message: "Failed to delete video testimony.", error: getErrorMessage(error) });
  }
}

// ─── Written Testimony Controllers ─────────────────────────────────────────

export async function submitWrittenTestimony(req: Request, res: Response) {
  try {
    const { name, story } = req.body;
    if (!name || !story) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, story.",
      });
    }

    const testimony = new WrittenTestimony({
      name,
      role: req.body.role,
      phone: req.body.phone,
      email: req.body.email,
      title: req.body.title,
      story,
      is_approved: false,
      is_published: false,
    });
    await testimony.save();
    return res.status(201).json({ success: true, testimony });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Failed to submit testimony.", error: getErrorMessage(error) });
  }
}

export async function getAllWrittenTestimonies(req: Request, res: Response) {
  try {
    const testimonies = await WrittenTestimony.find().sort({ created_at: -1 });
    return res.status(200).json({ success: true, testimonies });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve written testimonies.", error: getErrorMessage(error) });
  }
}

export async function getPublishedWrittenTestimonies(req: Request, res: Response) {
  try {
    const testimonies = await WrittenTestimony.find({ is_approved: true, is_published: true }).sort({ created_at: -1 });
    return res.status(200).json({ success: true, testimonies });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve written testimonies.", error: getErrorMessage(error) });
  }
}

export async function approveWrittenTestimony(req: Request, res: Response) {
  try {
    const { is_approved } = req.body;
    if (typeof is_approved !== "boolean") {
      return res.status(400).json({ success: false, message: "is_approved must be a boolean." });
    }

    // If unapproving, also unpublish
    const updateFields: Record<string, boolean> = { is_approved };
    if (!is_approved) {
      updateFields.is_published = false;
    }

    const testimony = await WrittenTestimony.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true },
    );
    if (!testimony) {
      return res.status(404).json({ success: false, message: "Written testimony not found." });
    }
    return res.status(200).json({ success: true, testimony });
  } catch (error) {
    if (isCastError(error)) {
      return res.status(400).json({ success: false, message: "Invalid testimony ID." });
    }
    return res.status(500).json({ success: false, message: "Failed to update written testimony.", error: getErrorMessage(error) });
  }
}

export async function toggleWrittenPublish(req: Request, res: Response) {
  try {
    const { is_published } = req.body;
    if (typeof is_published !== "boolean") {
      return res.status(400).json({ success: false, message: "is_published must be a boolean." });
    }

    // Only allow publishing if approved
    if (is_published) {
      const testimony = await WrittenTestimony.findById(req.params.id);
      if (!testimony) {
        return res.status(404).json({ success: false, message: "Written testimony not found." });
      }
      if (!testimony.is_approved) {
        return res.status(400).json({ success: false, message: "Cannot publish a testimony that has not been approved." });
      }
    }

    const testimony = await WrittenTestimony.findByIdAndUpdate(
      req.params.id,
      { $set: { is_published } },
      { new: true },
    );
    if (!testimony) {
      return res.status(404).json({ success: false, message: "Written testimony not found." });
    }
    return res.status(200).json({ success: true, testimony });
  } catch (error) {
    if (isCastError(error)) {
      return res.status(400).json({ success: false, message: "Invalid testimony ID." });
    }
    return res.status(500).json({ success: false, message: "Failed to update written testimony.", error: getErrorMessage(error) });
  }
}

export async function deleteWrittenTestimony(req: Request, res: Response) {
  try {
    const testimony = await WrittenTestimony.findByIdAndDelete(req.params.id);
    if (!testimony) {
      return res.status(404).json({ success: false, message: "Written testimony not found." });
    }
    return res.status(200).json({ success: true, message: "Written testimony deleted successfully." });
  } catch (error) {
    if (isCastError(error)) {
      return res.status(400).json({ success: false, message: "Invalid testimony ID." });
    }
    return res.status(500).json({ success: false, message: "Failed to delete written testimony.", error: getErrorMessage(error) });
  }
}
