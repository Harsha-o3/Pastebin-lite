export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { getCurrentTime } from "@/lib/utils/time";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const now = await getCurrentTime();

    // Fetch the paste
    const paste = await prisma.paste.findUnique({
      where: { id },
    });

    if (!paste) {
      return NextResponse.json({ error: "Paste not found" }, { status: 404 });
    }

    // Check TTL expiry
    if (paste.expires_at && paste.expires_at < now) {
      return NextResponse.json({ error: "Paste has expired" }, { status: 404 });
    }

    // Check View count limit
    if (paste.max_views !== null && paste.current_views >= paste.max_views) {
      return NextResponse.json({ error: "View limit reached" }, { status: 404 });
    }

    // Increment views atomically
    const updatedPaste = await prisma.paste.update({
      where: { id },
      data: {
        current_views: {
          increment: 1,
        },
      },
    });

    const remainingViews =
      updatedPaste.max_views !== null
        ? Math.max(0, updatedPaste.max_views - updatedPaste.current_views)
        : null;

    return NextResponse.json({
      content: updatedPaste.content,
      remaining_views: remainingViews,
      expires_at: updatedPaste.expires_at ? updatedPaste.expires_at.toISOString() : null,
    });
  } catch (error) {
    console.error("Fetch paste error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
