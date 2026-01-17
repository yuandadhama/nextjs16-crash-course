import { Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

// events/nextjs-conf-15

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    await connectDB();

    const { slug } = await params;

    // validate slug parameter
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { message: "Invalid or missing slug parameter" },
        { status: 400 }
      );
    }

    //sanitize slug parameter (remove any potentially harmful characters)
    const sanitizedSlug = slug.trim().toLowerCase();

    const event = await Event.findOne({ slug: sanitizedSlug }).lean();

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Event fetched successfully",
        event,
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      {
        message: "Failed to fetch event by slug",
        error: e instanceof Error ? e.message : "Unknown Error",
      },
      { status: 500 }
    );
  }
}
