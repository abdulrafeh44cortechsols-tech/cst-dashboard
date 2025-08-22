"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBlogs } from "@/hooks/useBlogs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AddBlogPage() {
  const router = useRouter();
  const { addBlog } = useBlogs(1, 10);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      setPreviews(files.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !status) {
      toast("All fields are required");
      return;
    }

    if (images.length === 0) {
            toast("Please upload at least one image.");

      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("published", status === "Published" ? "true" : "false");

      images.forEach((file) => {
        formData.append("image_files", file); // send as list
      });

      await addBlog.mutateAsync(formData);

      toast("Blog post created successfully!");
      router.push("/dashboard/blogs");
    } catch (error: any) {
      console.error("error creating blog post:", error);
      toast("Failed to create blog post. Please try again.");
    }
  };

  return (
    <div className="w-full mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Add New Blog Post</h1>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        {/* Title */}
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog post title"
            required
          />
        </div>

        {/* Content */}
        <div className="grid gap-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog post content..."
            rows={10}
            required
          />
        </div>

        {/* Status */}
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(val) => setStatus(val as any)}
            required
          >
            <SelectTrigger id="status" className="w-[200px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Image Upload */}
        <div className="grid gap-2">
          <Label htmlFor="image">Upload Images</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          {previews.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {previews.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  className="h-40 w-auto rounded border object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={addBlog.isPending}
          className="w-fit"
          variant={"blue"}
        >
          {addBlog.isPending ? "Creating..." : "Create Blog Post"}
        </Button>
      </form>
    </div>
  );
}
