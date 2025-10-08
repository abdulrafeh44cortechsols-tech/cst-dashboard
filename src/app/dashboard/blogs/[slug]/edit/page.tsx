"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { blogService } from "@/services/blogs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditBlogForm } from "@/components/blog/EditBlogForm";
import Link from "next/link";

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = params?.slug as string | undefined;

  const { data: blog, isLoading, isError } = useQuery({
    queryKey: ["blog", "slug", slugParam],
    queryFn: async () => {
      if (!slugParam) throw new Error("Missing blog slug");
      return blogService.getBlogBySlug(slugParam);
    },
    enabled: !!slugParam,
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Header with consistent spacing */}
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Edit Blog</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          <Button asChild variant="blue">
            <Link href="/dashboard/blogs">All Blogs</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          {isLoading && (
            <div className="text-muted-foreground">Loading blog...</div>
          )}
          {isError && (
            <div className="text-red-500">Failed to load blog. Please try again.</div>
          )}
          {!isLoading && blog && (
            <EditBlogForm
              blog={blog}
              onCancel={() => router.push("/dashboard/blogs")}
              onSaved={() => router.push("/dashboard/blogs")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
