import { prisma } from "@/lib/prisma";
import { getCurrentTime } from "@/lib/utils/time";

export async function getPaste(id: string) {
  const now = await getCurrentTime();

  const paste = await prisma.paste.findUnique({
    where: { id },
  });

  if (!paste) return null;

  // Check TTL expiry
  if (paste.expires_at && paste.expires_at < now) {
    return null;
  }

  // Check View count limit
  if (paste.max_views !== null && paste.current_views >= paste.max_views) {
    return null;
  }

  // Increment views
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

  return {
    ...updatedPaste,
    remaining_views: remainingViews,
  };
}
