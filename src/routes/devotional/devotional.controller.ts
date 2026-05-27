import { Request, Response } from "express";
import { Devotional } from "../../modules/devotional";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function getAllDevotionals(req: Request, res: Response) {
  try {
    const devotionals = await Devotional.find()
      .sort({ created_at: -1 });
    return res.status(200).json({ success: true, devotionals });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve devotionals.", error: getErrorMessage(error) });
  }
}

export async function toggleDevotionalPublish(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { is_published } = req.body;

    if (typeof is_published !== "boolean") {
      return res.status(400).json({ success: false, message: "is_published must be a boolean." });
    }

    const devotional = await Devotional.findById(id);
    if (!devotional) {
      return res.status(404).json({ success: false, message: "Devotional not found." });
    }

    devotional.is_published = is_published;
    devotional.publish_date = is_published ? new Date() : null;
    await devotional.save();

    return res.status(200).json({ success: true, devotional });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update devotional.", error: getErrorMessage(error) });
  }
}

export async function getTodayDevotional(req: Request, res: Response) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const devotional = await Devotional.findOne({
      is_published: true,
      publish_date: { $gte: todayStart, $lte: todayEnd },
    });

    if (!devotional) {
      return res.status(404).json({ success: false, message: "No devotional published for today." });
    }

    return res.status(200).json({ success: true, devotional });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve today's devotional.", error: getErrorMessage(error) });
  }
}

// Re-exported from admin controller for backward compatibility on the devotional router
export { addDevotional, addMultipleDevotionals } from "../admin/admin.controller";

export async function getDevotionalById(req: import("express").Request, res: import("express").Response) {
  try {
    const devotional = await Devotional.findById(req.params.id);
    if (!devotional) return res.status(404).json({ success: false, message: "Devotional not found." });
    return res.status(200).json({ success: true, devotional });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve devotional.", error: error instanceof Error ? error.message : String(error) });
  }
}

export async function updateDevotional(req: import("express").Request, res: import("express").Response) {
  try {
    const devotional = await Devotional.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!devotional) return res.status(404).json({ success: false, message: "Devotional not found." });
    return res.status(200).json({ success: true, devotional });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update devotional.", error: error instanceof Error ? error.message : String(error) });
  }
}

export async function deleteDevotional(req: import("express").Request, res: import("express").Response) {
  try {
    const devotional = await Devotional.findByIdAndDelete(req.params.id);
    if (!devotional) return res.status(404).json({ success: false, message: "Devotional not found." });
    return res.status(200).json({ success: true, message: "Devotional deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete devotional.", error: error instanceof Error ? error.message : String(error) });
  }
}
