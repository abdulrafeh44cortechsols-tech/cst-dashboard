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
import type { Service } from "@/types/types";
import { useServices } from "@/hooks/useServices";
import { toast } from "sonner";

interface DeleteServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteServiceModal({
  service,
  isOpen,
  onClose,
}: DeleteServiceModalProps) {
  const { removeService } = useServices(1, 10, false); // Don't fetch list - only need mutation

  const handleDelete = () => {
    if (!service) return;

    removeService.mutate(service.id.toString(), {
      onSuccess: () => {
        toast.success("Service deleted successfully.");
        onClose();
      },
      onError:()=>toast.error("Some error occurred while deleting service")
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Service</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{service?.title}</strong> service?
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
            disabled={removeService.isPending}
          >
            {removeService.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
