"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Link as LinkIcon, Plus } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState<string>("");
  const [maxViews, setMaxViews] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; url: string } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/pastes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl ? parseInt(ttl, 10) : undefined,
          max_views: maxViews ? parseInt(maxViews, 10) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create paste");
      }

      setResult(data);
      toast.success("Paste created successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.url);
      toast.success("URL copied to clipboard");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Pastebin Lite
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Create temporary, secure text pastes with expiry and view limits.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create a new paste</CardTitle>
            <CardDescription>
              Your content will be stored securely and deleted after it expires.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your text here..."
                  className="min-h-[200px] font-mono"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ttl">Expiry (TTL in seconds)</Label>
                  <Input
                    id="ttl"
                    type="number"
                    min="1"
                    placeholder="e.g. 3600 (1 hour)"
                    value={ttl}
                    onChange={(e) => setTtl(e.target.value)}
                    suppressHydrationWarning
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-views">Max Views</Label>
                  <Input
                    id="max-views"
                    type="number"
                    min="1"
                    placeholder="e.g. 5"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    suppressHydrationWarning
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading} suppressHydrationWarning>
                {isLoading ? "Creating..." : "Create Paste"}
                {!isLoading && <Plus className="ml-2 h-4 w-4" />}
              </Button>

              {result && (
                <div className="w-full space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Shareable URL:</span>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                    <LinkIcon className="h-4 w-4 flex-shrink-0 text-zinc-500" />
                    <span className="truncate text-sm text-zinc-600 dark:text-zinc-400">
                      {result.url}
                    </span>
                  </div>
                  <Link href={`/p/${result.id}`} className="block">
                    <Button variant="outline" className="w-full">
                      View Paste
                    </Button>
                  </Link>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
