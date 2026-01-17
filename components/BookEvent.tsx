"use client";

import { createBooking } from "@/lib/actions/booking.action";
import { ObjectId } from "mongoose";
import posthog from "posthog-js";
import { useState } from "react";

type BookEventParam = {
  eventId: string;
  slug: string;
};

const BookEvent = ({ eventId, slug }: BookEventParam) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { success } = await createBooking({
      eventId,
      slug,
      email,
    });

    if (success) {
      setSubmitted(true);
      posthog.capture("event_booked", {
        eventId,
        slug,
        email,
      });
    } else {
      posthog.captureException("Booking creation failed");
      console.error("Booking creation failed");
    }
  };

  return (
    <div id="book-event">
      BookEvent{" "}
      {submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              required
              placeholder="Enter your email address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="button-submit">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
