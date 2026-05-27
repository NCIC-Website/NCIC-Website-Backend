import mongoose, { Document, Model, Schema } from "mongoose";

export interface IContactMessage extends Document {
  full_name: string;
  email: string;
  message: string;
  is_read: boolean;
  sent_at: Date;
}

const contactMessageSchema = new Schema<IContactMessage>({
  full_name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  message: { type: String, required: true, trim: true },
  is_read: { type: Boolean, default: false, index: true },
  sent_at: { type: Date, default: Date.now },
});

export const ContactMessage: Model<IContactMessage> = mongoose.model<IContactMessage>(
  "ContactMessage",
  contactMessageSchema
);
