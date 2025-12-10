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
import { toast } from "sonner";

interface AddTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tagData: { name: string }) => void;
}

export function AddTagModal({ isOpen, onClose, onAdd }: AddTagModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter a tag name.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onAdd({ name: name.trim() });
      setName("");
      onClose();
      toast.success("Tag created successfully!");
    } catch (error: any) {
      // Handle specific API error messages
      if (error?.response?.data?.name) {
        // Display the specific error from the API (e.g., "sols tag with this name already exists.")
        const errorMessage = Array.isArray(error.response.data.name) 
          ? error.response.data.name[0] 
          : error.response.data.name;
        toast.error(errorMessage);
      } else if (error?.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create tag. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Tag</DialogTitle>
          <DialogDescription>
            Create a new tag that can be used to categorize content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tag-name">Name *</Label>
              <Input
                id="tag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter tag name"
                required
              />
              <p className="text-sm text-muted-foreground">
                The tag name will be used for categorizing content.
              </p>
            </div>

        
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="blue">
              {isSubmitting ? "Creating..." : "Create Tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 