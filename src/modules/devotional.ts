import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDevotional extends Document {
  title_en?: string;           // Optional
  title_am: string;            // Required
  verse_reference_en?: string; // Optional
  verse_reference_am: string;  // Required
  verse_text_en?: string;      // Optional
  verse_text_am: string;       // Required
  devotional_note_en?: string; // Optional
  devotional_note_am: string;  // Required
  confession_en?: string;
  confession_am: string;
  author?: string;
  tags?: string[];
  is_published: boolean;
  publish_date?: Date | null;
  created_at: Date;
  updated_at: Date;
}

const devotionalSchema = new Schema<IDevotional>({
  // Titles
  title_en: { type: String, required: false },
  title_am: { type: String, required: true },

  // Verse fields
  verse_reference_en: { type: String, required: false },
  verse_reference_am: { type: String, required: true },
  verse_text_en: { type: String, required: false },
  verse_text_am: { type: String, required: true },

  // Devotional notes
  devotional_note_en: { type: String, required: false },
  devotional_note_am: { type: String, required: true },

  confession_en: { type: String, required: false, default: null },
  confession_am: { type: String, required: true },

  author: { type: String, default: "Ark Devotional Team" },
  tags: [{ type: String }],

  is_published: { type: Boolean, default: false },
  publish_date: { type: Date, default: null }

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Devotional: Model<IDevotional> = mongoose.model<IDevotional>('Devotional', devotionalSchema);
