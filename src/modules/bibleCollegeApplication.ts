import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBibleCollegeApplication extends Document {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  education_level: string;
  program_interest: string;
  learning_mode: string;
  church_name?: string;
  address: string;
  additional_info?: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  submitted_at: Date;
}

const schema = new Schema<IBibleCollegeApplication>({
  full_name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  date_of_birth: { type: String, required: true },
  gender: { type: String, required: true },
  education_level: { type: String, required: true },
  program_interest: { type: String, required: true },
  learning_mode: { type: String, required: true },
  church_name: { type: String },
  address: { type: String, required: true },
  additional_info: { type: String },
  status: { type: String, enum: ["pending", "reviewed", "accepted", "rejected"], default: "pending", index: true },
  submitted_at: { type: Date, default: Date.now },
});

export const BibleCollegeApplication: Model<IBibleCollegeApplication> =
  mongoose.model<IBibleCollegeApplication>("BibleCollegeApplication", schema);
