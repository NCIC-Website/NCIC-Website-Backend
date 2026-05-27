import mongoose, { Document, Model, Schema } from "mongoose";

export interface INewsletter extends Document {
  email: string;
  subscribed_at: Date;
  is_active: boolean;
}

const newsletterSchema = new Schema<INewsletter>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email address."],
  },
  subscribed_at: { type: Date, default: Date.now },
  is_active: { type: Boolean, default: true },
});

export const Newsletter: Model<INewsletter> = mongoose.model<INewsletter>("Newsletter", newsletterSchema);
