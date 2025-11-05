import {Request, Response} from "express";
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

export async function addDevotional(req: Request, res: Response) {
  try {
    const {
      title_am,
      title_en,
      devotional_note_am,
      devotional_note_en,
      verse_reference_am,
      verse_reference_en,
      verse_text_am,
      verse_text_en,
      author,
      tags
    } = req.body;

    // Validate required fields
    if (!title_am || !devotional_note_am || !verse_reference_am || !verse_text_am) {
      return res.status(400).json({
        success: false,
        message: "title_am, devotional_note_am, verse_reference_am, and verse_text_am are required.",
      });
    }

    const newDevotional = new Devotional({
      title_am,
      title_en,
      devotional_note_am,
      devotional_note_en,
      verse_reference_am,
      verse_reference_en,
      verse_text_am,
      verse_text_en,
      author,
      tags,
      is_published: false,  // Always false on creation
      publish_date: null    // Only set when published
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

    // Validate each devotional
    const invalidItems = devotionals.filter(d => 
      !d.title_am || !d.devotional_note_am || !d.verse_reference_am || !d.verse_text_am
    );

    if (invalidItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Each devotional must include title_am, devotional_note_am, verse_reference_am, and verse_text_am.",
        invalidCount: invalidItems.length
      });
    }

    // Map devotionals to add default fields
    const devotionalsToInsert = devotionals.map(d => ({
      ...d,
      is_published: false,
      publish_date: null
    }));

    const insertedDevotionals = await Devotional.insertMany(devotionalsToInsert);

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
