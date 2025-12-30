import { getPaste } from "@/lib/pastes";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye } from "lucide-react";

export default async function ViewPastePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paste = await getPaste(id);

  if (!paste) {
    notFound();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Paste Details</CardTitle>
          <div className="flex gap-2">
            {paste.expires_at && (
              <Badge variant="outline" className="flex gap-1 items-center">
                <Calendar className="h-3 w-3" />
                Expires: {new Date(paste.expires_at).toLocaleString()}
              </Badge>
            )}
            {paste.max_views !== null && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                <Eye className="h-3 w-3" />
                Remaining Views: {paste.remaining_views}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-zinc-100 p-6 font-mono text-sm dark:bg-zinc-900 overflow-x-auto">
            {paste.content}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
