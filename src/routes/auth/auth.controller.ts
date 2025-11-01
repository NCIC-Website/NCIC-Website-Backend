import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Admin } from '../../modules/admin';

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
}

export async function adminLogin(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Admin Not Found' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid Password' });
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Login Successful',
            data: {
                role: admin.role,
            }
        });
    }catch (error) {
        return res.status(500).json({ success: false, message: 'Login failed.', error: getErrorMessage(error) });
    }
}