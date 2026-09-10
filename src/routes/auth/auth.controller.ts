import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Admin } from '../../modules/admin';
import dev from '../../config/default';
import { generatePassword } from '../../utils/passwordGenerator';
import { sendAccountCreationEmail, sendOtpEmail } from '../../utils/emailSender';
import { AuthRequest } from '../../middleware/auth.middleware';

function err(e: unknown) { return e instanceof Error ? e.message : String(e); }

// ── Login ──────────────────────────────────────────────────────────────────
export async function adminLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    if (admin.status === 'inactive') return res.status(403).json({ success: false, message: 'Account is inactive.' });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      console.log(`Failed login attempt for ${email} from IP: ${req.ip}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Update login tracking
    admin.last_login = new Date();
    await admin.save();

    const token = jwt.sign({ id: admin._id, role: admin.role }, dev.jwt.secret, { 
      expiresIn: dev.jwt.expiresIn as any 
    });

    // Log successful login
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      action: 'ADMIN_LOGIN_SUCCESS',
      userId: admin._id,
      email: admin.email,
      role: admin.role,
      ip: req.ip
    }));

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: { 
        id: admin._id, 
        first_name: admin.first_name, 
        email: admin.email, 
        role: admin.role,
        last_login: admin.last_login
      },
    });
  } catch (e) {
    console.error('Login error:', err(e));
    return res.status(500).json({ success: false, message: 'Login failed.' });
  }
}

// ── Create user (superAdmin only) ──────────────────────────────────────────
export async function createUser(req: AuthRequest, res: Response) {
  try {
    const { first_name, middle_name, email, role } = req.body;
    if (!first_name || !email || !role) {
      return res.status(400).json({ success: false, message: 'first_name, email, and role are required.' });
    }
    if (!['admin', 'abc'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be "admin" or "abc".' });
    }
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'A user with this email already exists.' });

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = new Admin({ first_name, middle_name, email, password: hashedPassword, role });
    await user.save();

    // Send invitation email (non-blocking)
    sendAccountCreationEmail(
      email,
      plainPassword,
      `Hello ${first_name}, you have been invited to the NCIC Admin Panel as ${role === 'abc' ? 'an ABC (Bible College) user' : 'an Admin'}.`
    ).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      plain_password: plainPassword, // returned so superAdmin can copy it
      user: { id: user._id, first_name: user.first_name, email: user.email, role: user.role },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to create user.', error: err(e) });
  }
}

// ── Get all users (superAdmin only) ───────────────────────────────────────
export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await Admin.find({ role: { $ne: 'superAdmin' } }).select('-password -otp -otp_expires').sort({ created_date: -1 });
    return res.status(200).json({ success: true, users });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.', error: err(e) });
  }
}

// ── Update user status (superAdmin only) ──────────────────────────────────
export async function updateUserStatus(req: Request, res: Response) {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'active' or 'inactive'." });
    }
    const user = await Admin.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, user });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to update user.', error: err(e) });
  }
}

// ── Delete user (superAdmin only) ─────────────────────────────────────────
export async function deleteUser(req: Request, res: Response) {
  try {
    const user = await Admin.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to delete user.', error: err(e) });
  }
}

// ── Change password (logged-in user) ──────────────────────────────────────
export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'current_password and new_password are required.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }
    const user = await Admin.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const valid = await bcrypt.compare(current_password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();
    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to change password.', error: err(e) });
  }
}

// ── Forgot password — send OTP ─────────────────────────────────────────────
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await Admin.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists
      return res.status(200).json({ success: true, message: 'If this email exists, an OTP has been sent.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    user.otp = await bcrypt.hash(otp, 10);
    user.otp_expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    sendOtpEmail(email, otp, user.first_name).catch(() => {});

    return res.status(200).json({ success: true, message: 'If this email exists, an OTP has been sent.' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to send OTP.', error: err(e) });
  }
}

// ── Verify OTP and reset password ─────────────────────────────────────────
export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, otp, new_password } = req.body;
    if (!email || !otp || !new_password) {
      return res.status(400).json({ success: false, message: 'email, otp, and new_password are required.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await Admin.findOne({ email });
    if (!user || !user.otp || !user.otp_expires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }
    if (user.otp_expires < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const otpValid = await bcrypt.compare(otp, user.otp);
    if (!otpValid) return res.status(400).json({ success: false, message: 'Invalid OTP.' });

    user.password = await bcrypt.hash(new_password, 10);
    user.otp = undefined;
    user.otp_expires = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to reset password.', error: err(e) });
  }
}

// ── Get current user profile ───────────────────────────────────────────────
export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await Admin.findById(req.user!.id).select('-password -otp -otp_expires');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, user });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to get profile.', error: err(e) });
  }
}
