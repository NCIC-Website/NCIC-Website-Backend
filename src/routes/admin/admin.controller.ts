import { Request, Response } from "express";
import { Devotional } from "../../modules/devotional";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function addDevotional(req: Request, res: Response) {
  try {
    const { title_am, verse_reference_am, verse_text_am, devotional_note_am, confession_am } = req.body;
    if (!title_am || !verse_reference_am || !verse_text_am || !devotional_note_am || !confession_am) {
      return res.status(400).json({
        success: false,
        message: "title_am, verse_reference_am, verse_text_am, devotional_note_am, and confession_am are required.",
      });
    }
    const newDevotional = new Devotional({ ...req.body, is_published: false, publish_date: null });
    const saved = await newDevotional.save();
    return res.status(201).json({ success: true, message: "Devotional added successfully.", devotional: saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to add devotional.", error: getErrorMessage(error) });
  }
}

export async function addMultipleDevotionals(req: Request, res: Response) {
  try {
    const devotionals = req.body;
    if (!Array.isArray(devotionals) || devotionals.length === 0) {
      return res.status(400).json({ success: false, message: "Request body must be a non-empty array of devotionals." });
    }
    const invalid = devotionals.filter(d => !d.title_am || !d.verse_reference_am || !d.verse_text_am || !d.devotional_note_am || !d.confession_am);
    if (invalid.length > 0) {
      return res.status(400).json({ success: false, message: "Each devotional must include required Amharic fields.", invalidCount: invalid.length });
    }
    const formatted = devotionals.map(d => ({ ...d, is_published: false, publish_date: null }));
    const inserted = await Devotional.insertMany(formatted);
    return res.status(201).json({ success: true, message: `${inserted.length} devotionals added successfully.`, devotionals: inserted });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to add multiple devotionals.", error: getErrorMessage(error) });
  }
}
