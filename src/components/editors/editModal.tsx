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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Editor, CreateEditorData } from "@/types/types";

interface EditEditorDialogProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editor: CreateEditorData) => void;
}

export function EditEditorDialog({
  editor,
  isOpen,
  onClose,
  onSave,
}: EditEditorDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (editor) {
      setFormData({
        username: editor.username,
        email: editor.email,
        password: formData.password,
      });
    }
  }, [editor]);

  const handleSubmit = async () => {
    if (!formData.username || !formData.email) return;

    try {
      setSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to update editor:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Editor</DialogTitle>
          <DialogDescription>
            Update the editor's information below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              placeholder="Enter editor's name"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="Enter editor's email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">New Password</Label>
            <Input
              id="edit-password"
              type="password"
              placeholder="Enter editor's password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              disabled={submitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant={"blue"}
            onClick={handleSubmit}
            disabled={submitting || !formData.username || !formData.email}
          >
            {submitting && <Loader2 className=" h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
