import mongoose, { Document, Model, Schema } from "mongoose";

export interface IWrittenTestimony extends Document {
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  title?: string;
  story: string;
  is_approved: boolean;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

const writtenTestimonySchema = new Schema<IWrittenTestimony>(
  {
    name: { type: String, required: true },
    role: { type: String },
    phone: { type: String },
    email: { type: String },
    title: { type: String },
    story: { type: String, required: true },
    is_approved: { type: Boolean, default: false, index: true },
    is_published: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export const WrittenTestimony: Model<IWrittenTestimony> = mongoose.model<IWrittenTestimony>(
  "WrittenTestimony",
  writtenTestimonySchema,
);
