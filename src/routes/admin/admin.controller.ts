import {Request, Response} from "express";
import cron from 'node-cron';
import { Admin } from '../../modules/admin';
import bcrypt from 'bcrypt';
import { generatePassword } from '../../../utils/passwordGenerator';
import { sendAccountCreationEmail } from '../../../utils/emailSender';
import { Devotional } from "../../modules/devotional";

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
}

export async function addContentManger(req: Request, res: Response) {
    const plainPassword = generatePassword();
    try {
        const {first_name, middle_name, email} = req.body;
        if(!first_name || !middle_name || !email) {
            return res.status(400).json({ success: false, message: 'First name, middle name, and email are required.' });
        }  

        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const newManager = new Admin({
            first_name,
            middle_name,
            email,
            password: hashedPassword,
            role: 'contentManager'
        });

        await newManager.save();
       
        // Send the plain password in the account creation email
        await sendAccountCreationEmail(
        newManager.email,
        plainPassword,
        "Greetingd, <br> You are invited to be a Content Manager on the NCIC Website."
        );

        return res.status(201).json(newManager);
            
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Creation failed.', error: getErrorMessage(error) });
    }
}

export async function getAllContentManagers(req: Request, res: Response) {
    try {
        const managers = await Admin.find({ role: 'contentManager' }).select('-password');
        return res.status(200).json({ success: true, data: managers });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve content managers.', error: getErrorMessage(error) });
    }
}

export async function updateManagerStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "deactivated"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'active' or 'deactivated'."
      });
    }

    const manager = await Admin.findById(id);

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Content manager not found."
      });
    }

    if (manager.role !== "contentManager") {
      return res.status(403).json({
        success: false,
        message: "This user is not a content manager and cannot be updated."
      });
    }

    manager.status = status;
    await manager.save();

    return res.status(200).json({
      success: true,
      message: `Content manager has been ${status === "active" ? "activated" : "deactivated"}.`,
      data: manager
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update manager status.",
      error: error instanceof Error ? error.message : error
    });
  }
}

export async function addDevotional(req: Request, res: Response) {
  try {
    const {
      title_am,
      title_en,
      verse_reference_am,
      verse_reference_en,
      verse_text_am,
      verse_text_en,
      devotional_note_am,
      devotional_note_en,
      confession_am,
      confession_en,
      author,
      tags
    } = req.body;

    // Validate required fields
    if (
      !title_am ||
      !verse_reference_am ||
      !verse_text_am ||
      !devotional_note_am ||
      !confession_am
    ) {
      return res.status(400).json({
        success: false,
        message:
          "title_am, verse_reference_am, verse_text_am, devotional_note_am, and confession_am are required.",
      });
    }

    const newDevotional = new Devotional({
      title_am,
      title_en,
      verse_reference_am,
      verse_reference_en,
      verse_text_am,
      verse_text_en,
      devotional_note_am,
      devotional_note_en,
      confession_am,
      confession_en,
      author,
      tags,
      is_published: false,
      publish_date: null
    });

    const savedDevotional = await newDevotional.save();

    return res.status(201).json({
      success: true,
      message: "Devotional added successfully (saved as draft).",
      devotional: savedDevotional,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add devotional.",
      error: error instanceof Error ? error.message : error,
    });
  }
}


export async function addMultipleDevotionals(req: Request, res: Response) {
  try {
    const devotionals = req.body;

    if (!Array.isArray(devotionals) || devotionals.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of devotionals."
      });
    }

    // Validate each devotional item
    const invalidItems = devotionals.filter(d =>
      !d.title_am ||
      !d.verse_reference_am ||
      !d.verse_text_am ||
      !d.devotional_note_am ||
      !d.confession_am
    );

    if (invalidItems.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Each devotional must include title_am, verse_reference_am, verse_text_am, devotional_note_am, and confession_am.",
        invalidCount: invalidItems.length
      });
    }

    const formatted = devotionals.map(d => ({
      ...d,
      is_published: false,
      publish_date: null
    }));

    const insertedDevotionals = await Devotional.insertMany(formatted);

    return res.status(201).json({
      success: true,
      message: `${insertedDevotionals.length} devotionals added successfully.`,
      devotionals: insertedDevotionals
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add multiple devotionals.",
      error: error instanceof Error ? error.message : error
    });
  }
}
