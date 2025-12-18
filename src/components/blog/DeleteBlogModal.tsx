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
import { BlogPost } from "@/types/types";
import { toast } from "sonner";

interface DeleteBlogModalProps {
  blog: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteBlogModal({ blog, isOpen, onClose }: DeleteBlogModalProps) {
  const { removeBlog } = useBlogs(1, 6, false); // Don't fetch list - only need mutation

  const handleDelete = () => {
    if (!blog) return;

    removeBlog.mutate(blog.id.toString(), {
      onSuccess: () => {
        toast.success("Blog deleted successfully.");
        onClose();
      },
      onError:()=>toast.error("Some error occurred while deleting blog")
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Blog</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{blog?.title}</strong> blog? This action cannot be undone.
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
