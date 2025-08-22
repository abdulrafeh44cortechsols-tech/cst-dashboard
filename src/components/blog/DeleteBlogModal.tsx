"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBlogs} from "@/hooks/useBlogs";
import { BlogPost } from "@/types/blog";

interface DeleteBlogModalProps {
  blog: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteBlogModal({ blog, isOpen, onClose }: DeleteBlogModalProps) {
  const { removeBlog } = useBlogs(1,6);

  const handleDelete = () => {
    if (!blog) return;

    removeBlog.mutate(blog.id.toString(), {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Service</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{blog?.title}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={removeBlog.isPending}>
            {removeBlog.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
