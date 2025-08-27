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
import type { Service } from "@/types/types";
import { useServices } from "@/hooks/useServices";

interface EditServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditServiceModal({ service, isOpen, onClose }: EditServiceModalProps) {
  const { editService } = useServices();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState<Service["is_active"]>(false);

  useEffect(() => {
    if (service) {
      setTitle(service.title);
      setDescription(service.description);
      setMetaTitle(service.meta_title);
      setMetaDescription(service.meta_description);
      setStatus(service.is_active);
    }
  }, [service]);

  const handleSave = () => {
    if (!service) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("meta_title", metaTitle);
    formData.append("meta_description", metaDescription);
    formData.append("is_active", status ? "true" : "false");
    try {
       editService.mutate(
      { id: service.id.toString(), data: formData },
      {
        onSuccess: () => onClose(),
      }
    );
    } catch (error) {
      console.error("Failed to update service:", error);
    }
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
            <Label htmlFor="service-description">Description</Label>
            <Input
              id="service-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            <Label htmlFor="service-status">Status</Label>
            <Select value={status===true ? "Active" : "Inactive"} onValueChange={(val) => setStatus(val === "Active")} required>
              <SelectTrigger id="service-status" className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="blue" onClick={handleSave} disabled={editService.isPending}>
            {editService.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
