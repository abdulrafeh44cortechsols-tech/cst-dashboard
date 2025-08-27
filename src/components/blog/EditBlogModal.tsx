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
import { BlogPost } from "@/types/types";
import { set } from "zod";

interface EditBlogModalProps {
  blog: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditBlogModal({ blog, isOpen, onClose }: EditBlogModalProps) {
  const { editBlog } = useBlogs();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState<BlogPost["published"]>(false);

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setSummary(blog.summary);
      setMetaTitle(blog.meta_title);
      setMetaDescription(blog.meta_description);
      setStatus(blog.published);
    }
  }, [blog]);

  const handleSave = () => {
    if (!blog) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", summary);
    formData.append("meta_title", metaTitle);
    formData.append("meta_description", metaDescription);
    formData.append("published", String(status));

    editBlog.mutate(
      { id: blog.id.toString(), data: formData },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
          <DialogDescription>
            Update the service details and click save.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="service-title">Title</Label>
            <Input
              id="service-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter service title"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="service-description">Summary</Label>
            <Input
              id="service-description"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter service description"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meta-title">Meta Title</Label>
            <Input
              id="meta-title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Enter meta title for SEO"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meta-description">Meta Description</Label>
            <Textarea
              id="meta-description"
              value={metaDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMetaDescription(e.target.value)}
              placeholder="Enter meta description for SEO"
              rows={3}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="service-status">Publish status</Label>
            <Select value={status ? "Published" : "Draft"} onValueChange={(val) => setStatus(val === "Published")}>
              <SelectTrigger id="service-status" className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="blue" onClick={handleSave} disabled={editBlog.isPending}>
            {editBlog.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
