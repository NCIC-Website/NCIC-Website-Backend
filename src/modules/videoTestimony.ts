import mongoose, { Document, Model, Schema } from "mongoose";

export interface IVideoTestimony extends Document {
  title: string;
  name: string;
  youtube_url: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

// Accepts full YouTube URLs and bare 11-char video IDs
const youtubeUrlRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}.*$|^[\w-]{11}$/;

const videoTestimonySchema = new Schema<IVideoTestimony>(
  {
    title: { type: String, required: true },
    name: { type: String, required: true },
    youtube_url: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => youtubeUrlRegex.test(v),
        message: "youtube_url must be a valid YouTube URL or 11-character video ID.",
      },
    },
    is_featured: { type: Boolean, default: false, index: true },
    is_published: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export const VideoTestimony: Model<IVideoTestimony> = mongoose.model<IVideoTestimony>(
  "VideoTestimony",
  videoTestimonySchema,
);
