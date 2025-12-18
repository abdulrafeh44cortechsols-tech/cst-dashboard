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
import type { Project } from "@/types/types";
import { useProjects } from "@/hooks/useProjects";
import { toast } from "sonner";

interface DeleteProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteProjectModal({
  project,
  isOpen,
  onClose,
}: DeleteProjectModalProps) {
  const { removeProject } = useProjects();

  const handleDelete = () => {
    if (!project) return;

    removeProject.mutate(project.id.toString(), {
      onSuccess: () => {
        toast.success("Project deleted successfully.");
        onClose();
      },
      onError: () => toast.error("Some error occurred while deleting project")
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{project?.name}</strong> project?
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
            disabled={removeProject.isPending}
          >
            {removeProject.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
