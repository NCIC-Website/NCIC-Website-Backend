import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITeachingSeries extends Document {
  title: string;
  description?: string;
  playlist_url: string;
  video_count?: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

// Accepts full YouTube playlist URLs or bare playlist IDs
const playlistUrlRegex =
  /^(https?:\/\/)?(www\.)?youtube\.com\/(watch\?.*list=|playlist\?list=)[\w-]+$|^[\w-]{18,}$/;

const teachingSeriesSchema = new Schema<ITeachingSeries>(
  {
    title: { type: String, required: true },
    description: { type: String },
    playlist_url: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => playlistUrlRegex.test(v),
        message: "playlist_url must be a valid YouTube playlist URL or playlist ID.",
      },
    },
    video_count: { type: Number, default: 0 },
    is_published: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const TeachingSeries: Model<ITeachingSeries> = mongoose.model<ITeachingSeries>(
  "TeachingSeries",
  teachingSeriesSchema
);
