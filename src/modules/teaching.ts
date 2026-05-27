import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITeaching extends Document {
  title: string;
  speaker: string;
  date: Date;
  youtube_url: string;
  category: string;
  thumbnail_url?: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
}

// Accepts full YouTube URLs and bare 11-char video IDs
const youtubeUrlRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]{11}$|^[\w-]{11}$/;

const teachingSchema = new Schema<ITeaching>(
  {
    title: { type: String, required: true },
    speaker: { type: String, required: true },
    date: { type: Date, required: true },
    youtube_url: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => youtubeUrlRegex.test(v),
        message: "youtube_url must be a valid YouTube URL or 11-character video ID.",
      },
    },
    category: { type: String, required: true, index: true },
    thumbnail_url: { type: String },
    is_published: { type: Boolean, default: false, index: true },
    is_featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export const Teaching: Model<ITeaching> = mongoose.model<ITeaching>("Teaching", teachingSchema);
