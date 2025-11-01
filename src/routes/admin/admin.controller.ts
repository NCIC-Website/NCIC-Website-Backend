import {Request, Response} from "express";
import { Admin } from '../../modules/admin';
import bcrypt from 'bcrypt';
import { generatePassword } from '../../../utils/passwordGenerator';
import { sendAccountCreationEmail } from '../../../utils/emailSender';

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