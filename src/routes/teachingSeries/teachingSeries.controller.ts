import { Request, Response } from "express";
import mongoose from "mongoose";
import { TeachingSeries } from "../../modules/teachingSeries";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function isCastError(error: unknown): boolean {
  return error instanceof mongoose.Error.CastError;
}

export async function addSeries(req: Request, res: Response) {
  try {
    const { title, playlist_url } = req.body;
    if (!title || !playlist_url) {
      return res.status(400).json({ success: false, message: "title and playlist_url are required." });
    }
    const series = new TeachingSeries({ ...req.body, is_published: false });
    await series.save();
    return res.status(201).json({ success: true, series });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Failed to add series.", error: getErrorMessage(error) });
  }
}

export async function getAllSeries(req: Request, res: Response) {
  try {
    const series = await TeachingSeries.find().sort({ created_at: -1 });
    return res.status(200).json({ success: true, series });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve series.", error: getErrorMessage(error) });
  }
}

export async function getPublishedSeries(req: Request, res: Response) {
  try {
    const series = await TeachingSeries.find({ is_published: true }).sort({ created_at: -1 });
    return res.status(200).json({ success: true, series });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve series.", error: getErrorMessage(error) });
  }
}

export async function updateSeries(req: Request, res: Response) {
  try {
    const series = await TeachingSeries.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!series) return res.status(404).json({ success: false, message: "Series not found." });
    return res.status(200).json({ success: true, series });
  } catch (error) {
    if (isCastError(error)) return res.status(400).json({ success: false, message: "Invalid series ID." });
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Failed to update series.", error: getErrorMessage(error) });
  }
}

export async function toggleSeriesPublish(req: Request, res: Response) {
  try {
    const { is_published } = req.body;
    if (typeof is_published !== "boolean") {
      return res.status(400).json({ success: false, message: "is_published must be a boolean." });
    }
    const series = await TeachingSeries.findByIdAndUpdate(
      req.params.id,
      { $set: { is_published } },
      { new: true }
    );
    if (!series) return res.status(404).json({ success: false, message: "Series not found." });
    return res.status(200).json({ success: true, series });
  } catch (error) {
    if (isCastError(error)) return res.status(400).json({ success: false, message: "Invalid series ID." });
    return res.status(500).json({ success: false, message: "Failed to update series.", error: getErrorMessage(error) });
  }
}

export async function deleteSeries(req: Request, res: Response) {
  try {
    const series = await TeachingSeries.findByIdAndDelete(req.params.id);
    if (!series) return res.status(404).json({ success: false, message: "Series not found." });
    return res.status(200).json({ success: true, message: "Series deleted successfully." });
  } catch (error) {
    if (isCastError(error)) return res.status(400).json({ success: false, message: "Invalid series ID." });
    return res.status(500).json({ success: false, message: "Failed to delete series.", error: getErrorMessage(error) });
  }
}
