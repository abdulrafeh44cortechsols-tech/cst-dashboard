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
import { toast } from "sonner";
import type { Tag } from "@/types/types";

interface EditTagModalProps {
  tag: Tag | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: number, tagData: { name: string }) => void;
}

export function EditTagModal({ tag, isOpen, onClose, onEdit }: EditTagModalProps) {
  const [name, setName] = useState("");
  // const [slug, setSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      // setSlug(tag.slug);
    }
  }, [tag]);

  // Auto-generate slug from name if slug is empty
  const handleNameChange = (value: string) => {
    setName(value);
    
    // Only auto-generate if slug is empty or matches the previous auto-generated slug
    // if (!slug || slug === generateSlugFromName(tag?.name || "")) {
    //   const generatedSlug = generateSlugFromName(value);
    //   setSlug(generatedSlug);
    // }
  };

  // const generateSlugFromName = (name: string) => {
  //   return name
  //     .toLowerCase()
  //     .trim()
  //     .replace(/[^a-z0-9\s-]/g, '')
  //     .replace(/\s+/g, '-')
  //     .replace(/-+/g, '-')
  //     .replace(/^-|-$/g, '');
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tag) return;

    if (!name.trim()) {
      toast.error("Please enter a tag name.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onEdit(tag.id, { name: name.trim() });
      onClose();
      toast.success("Tag updated successfully!");
    } catch (error) {
      console.log(error,"here is the error")
      toast.error("Failed to update tag. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (tag) {
      setName(tag.name);
      // setSlug(tag.slug);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
          <DialogDescription>
            Update the tag name and slug. This will affect all content using this tag.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-tag-name">Name *</Label>
              <Input
                id="edit-tag-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter tag name"
                required
              />
            </div>

            {/* <div className="grid gap-2">
              <Label htmlFor="edit-tag-slug">Slug *</Label>
              <Input
                id="edit-tag-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="tag-slug"
                required
              />
              <p className="text-sm text-muted-foreground">
                URL-friendly version of the name. Be careful changing this as it affects URLs.
              </p>
            </div> */}

            {tag && (
              <div className="grid gap-2">
                <Label>Usage Statistics</Label>
                <div className="text-sm text-muted-foreground">
                  Used in <strong>{tag.blog_count}</strong> blog post{tag.blog_count !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 