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
import type { Industry } from "@/types/types";
import { useIndustries } from "@/hooks/useIndustries";
import { toast } from "sonner";

interface DeleteIndustryModalProps {
  industry: Industry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteIndustryModal({
  industry,
  isOpen,
  onClose,
}: DeleteIndustryModalProps) {
  const { removeIndustry } = useIndustries();

  const handleDelete = () => {
    if (!industry) return;

    removeIndustry.mutate(industry.id.toString(), {
      onSuccess: () => {
        toast.success("Industry deleted successfully.");
        onClose();
      },
      onError: () => toast.error("Some error occurred while deleting industry")
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Industry</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{industry?.title}</strong> industry?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={removeIndustry.isPending}
          >
            {removeIndustry.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 