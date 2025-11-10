import mongoose, { Document, Model, Schema } from 'mongoose';

// Admin Interface
export interface IAdmin extends Document {
  first_name: string;
  middle_name: string;
  email: string;
  password: string;
  role: 'superAdmin' | 'contentManager';
  status: 'active' | 'inactive';
  created_date: Date;
  last_login: Date;
  
}

// Admin Schema
const adminSchema = new Schema<IAdmin>({
  first_name: { type: String, required: true },
  middle_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['superAdmin', 'contentManager'],
    default: 'contentManager'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  created_date: { type: Date, default: Date.now },
  last_login: { type: Date }
});

export const Admin: Model<IAdmin> = mongoose.model<IAdmin>('Admin', adminSchema);
