import { Schema, model, models, Document, Types } from "mongoose";
import Event from "./event.model";

/* ==============================
   TypeScript Interface
================================ */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ==============================
   Schema Definition
================================ */
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string) =>
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
            email
          ),
        message: "Invalid email address",
      },
    },
  },
  { timestamps: true }
);

/* ==============================
   Pre-save Middleware
   (Promise-based & SAFE)
================================ */
BookingSchema.pre("save", async function () {
  const booking = this as IBooking;

  if (!booking.isNew && !booking.isModified("eventId")) return;

  const exists = await Event.exists({ _id: booking.eventId });
  if (!exists) {
    throw new Error(`Event with ID ${booking.eventId} does not exist`);
  }
});

/* ==============================
   Indexes
================================ */
BookingSchema.index({ eventId: 1 });
BookingSchema.index({ email: 1 });

// Prevent duplicate booking per event per email
BookingSchema.index(
  { eventId: 1, email: 1 },
  { unique: true, name: "uniq_event_email" }
);

// Optimized query for event bookings
BookingSchema.index({ eventId: 1, createdAt: -1 });

/* ==============================
   Model Export (Hot Reload Safe)
================================ */
const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;
