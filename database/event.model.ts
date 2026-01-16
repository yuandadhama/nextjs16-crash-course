import { Schema, model, models, Document } from "mongoose";

/* ==============================
   TypeScript Interface
================================ */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: "online" | "offline" | "hybrid";
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/* ==============================
   Schema Definition
================================ */
const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    overview: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    venue: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    mode: {
      type: String,
      required: true,
      enum: ["online", "offline", "hybrid"],
    },

    audience: {
      type: String,
      required: true,
      trim: true,
    },

    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Agenda must contain at least one item",
      },
    },

    organizer: {
      type: String,
      required: true,
      trim: true,
    },

    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  { timestamps: true }
);

/* ==============================
   Pre-save Middleware
   (Promise-based, SAFE)
================================ */
EventSchema.pre("save", async function () {
  const event = this as IEvent;

  // Generate slug
  if (event.isNew || event.isModified("title")) {
    event.slug = generateSlug(event.title);
  }

  // Normalize date
  if (event.isModified("date")) {
    event.date = normalizeDate(event.date);
  }

  // Normalize time
  if (event.isModified("time")) {
    event.time = normalizeTime(event.time);
  }
});

/* ==============================
   Indexes
================================ */
// Compound index for filtering
EventSchema.index({ date: 1, mode: 1 });

/* ==============================
   Model Export (Hot Reload Safe)
================================ */
const Event = models.Event || model<IEvent>("Event", EventSchema);
export default Event;

/* ==============================
   Helpers
================================ */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeDate(value: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format (expected YYYY-MM-DD)");
  }
  return date.toISOString().slice(0, 10);
}

function normalizeTime(value: string): string {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) {
    throw new Error("Invalid time format (HH:MM or HH:MM AM/PM)");
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  if (hours > 23 || Number(minutes) > 59) {
    throw new Error("Invalid time values");
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}
