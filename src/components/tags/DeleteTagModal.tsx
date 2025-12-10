"use client";

import { useState } from "react";
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
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { Tag } from "@/types/types";

interface DeleteTagModalProps {
  tag: Tag | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
}

export function DeleteTagModal({ tag, isOpen, onClose, onDelete }: DeleteTagModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!tag) return;

    if (tag.blog_count > 0 && confirmText !== tag.name) {
      toast.error(`Please type "${tag.name}" to confirm deletion.`);
      return;
    }

    setIsDeleting(true);
    
    try {
      await onDelete(tag.id);
      setConfirmText("");
      onClose();
      toast.success("Tag deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete tag. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  if (!tag) return null;

  const requiresConfirmation = tag.blog_count > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Tag
          </DialogTitle>
          <DialogDescription>
            {requiresConfirmation ? (
              <>
                This tag is currently being used in <strong>{tag.blog_count}</strong> blog post
                {tag.blog_count !== 1 ? 's' : ''}. Deleting it will remove the tag from all associated content.
              </>
            ) : (
              <>
                Are you sure you want to delete the tag <strong>"{tag.name}"</strong>? 
                This action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Tag Information */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {tag.name}
              </div>
              <div>
                <span className="font-medium">Usage:</span> {tag.blog_count} blog post{tag.blog_count !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Confirmation Input for tags with usage */}
          {requiresConfirmation && (
            <div className="grid gap-2">
              <Label htmlFor="confirm-delete">
                Type <strong>"{tag.name}"</strong> to confirm deletion:
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={tag.name}
                className="font-mono"
              />
            </div>
          )}

          {requiresConfirmation && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <strong>Warning:</strong> This action will permanently remove this tag from all blog posts. 
                The affected posts will no longer be categorized under this tag.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || (requiresConfirmation && confirmText !== tag.name)}
          >
            {isDeleting ? "Deleting..." : "Delete Tag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 