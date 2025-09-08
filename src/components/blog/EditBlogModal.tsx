"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBlogs } from "@/hooks/useBlogs";
import { useTags } from "@/hooks/useTags";
import { BlogPost, Tag } from "@/types/types";
import { toast } from "sonner";

interface EditBlogModalProps {
  blog: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditBlogModal({ blog, isOpen, onClose }: EditBlogModalProps) {
  const { editBlog } = useBlogs();
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

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setContent(blog.content || "");
      setMetaTitle(blog.meta_title);
      setMetaDescription(blog.meta_description);
      setStatus(blog.published ? "Published" : "Draft");
      setSelectedTagIds(blog.tag_ids || []);
      
      // Set existing images as previews if available
      if (blog.images && blog.images.length > 0) {
        setPreviews(blog.images);
      }
    }
  }, [blog]);

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

  const handleSave = () => {
    if (!blog) return;

    if (!title || !content || !metaTitle || !metaDescription || !status) {
      toast.error("All fields are required");
      return;
    }

    if (content.length < 50) {
      toast.error("Blog content must be more than 50 characters long.");
      return;
    }

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

    // Add new images if any were uploaded
    images.forEach((file) => {
      formData.append("image_files", file);
    });

    editBlog.mutate(
      { id: blog.id.toString(), data: formData },
      {
        onSuccess: () => {
          toast.success("Blog post updated successfully!");
          onClose();
        },
        onError: (error: any) => {
          console.error("Error updating blog post:", error.response?.data);
          toast.error("Failed to update blog post. Please try again.");
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Blog Post</DialogTitle>
          <DialogDescription>
            Update the blog post details and click save.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="blue" onClick={handleSave} disabled={editBlog.isPending}>
            {editBlog.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
