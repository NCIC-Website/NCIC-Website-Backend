import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAdmin extends Document {
  first_name: string;
  middle_name?: string;
  email: string;
  password: string;
  role: 'superAdmin' | 'admin' | 'abc';
  status: 'active' | 'inactive';
  otp?: string;
  otp_expires?: Date;
  created_date: Date;
  last_login?: Date;
}

const adminSchema = new Schema<IAdmin>({
  first_name: { type: String, required: true },
  middle_name: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['superAdmin', 'admin', 'abc'],
    default: 'admin',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  otp: { type: String },
  otp_expires: { type: Date },
  created_date: { type: Date, default: Date.now },
  last_login: { type: Date },
});

export const Admin: Model<IAdmin> = mongoose.model<IAdmin>('Admin', adminSchema);
