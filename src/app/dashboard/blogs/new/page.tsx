"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBlogs } from "@/hooks/useBlogs";
import { useTags } from "@/hooks/useTags";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tag } from "@/types/types";

export default function AddBlogPage() {
  const router = useRouter();
  const { addBlog } = useBlogs(1, 10);
  const { getTags } = useTags();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Get tags data safely
  const tagsData = getTags.data?.data || [];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      setPreviews(files.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleTagChange = (tagId: number, checked: boolean) => {
    if (checked) {
      setSelectedTagIds(prev => [...prev, tagId]);
    } else {
      setSelectedTagIds(prev => prev.filter(id => id !== tagId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !metaTitle || !metaDescription || !status) {
      toast("All fields are required");
      return;
    }
    if(content.length<50){
      toast.error("Blog content must be more than 50 characters long.")
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
      formData.append("meta_title", metaTitle);
      formData.append("meta_description", metaDescription);
      formData.append("published", status === "Published" ? "true" : "false");

      // Add tag_ids as JSON string
      if (selectedTagIds.length > 0) {
        formData.append("tag_ids", JSON.stringify(selectedTagIds));
      }

      images.forEach((file) => {
        formData.append("image_files", file); // send as list
      });

      await addBlog.mutateAsync(formData);

      toast.success("Blog post created successfully!");
      router.push("/dashboard/blogs");
    } catch (error: any) {
      console.error("error creating blog post:", error.response.data);
      toast.error("Failed to create blog post, "+error.response.data.details.content[0]);
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

        {/* Meta Title */}
        <div className="grid gap-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Enter meta title for SEO"
            required
          />
        </div>

        {/* Meta Description */}
        <div className="grid gap-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Enter meta description for SEO"
            rows={3}
            required
          />
        </div>

        {/* Tags */}
        <div className="grid gap-2">
          <Label>Tags</Label>
          {getTags.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading tags...</div>
          ) : getTags.isError ? (
            <div className="text-sm text-red-500">Failed to load tags</div>
          ) : Array.isArray(tagsData) && tagsData.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tagsData.map((tag: Tag) => (
                <div
                  key={tag.id}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleTagChange(tag.id, !selectedTagIds.includes(tag.id))}
                >
                  {tag.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No tags available</div>
          )}
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
