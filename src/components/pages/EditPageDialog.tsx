"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { pageService } from "@/services/pages";
import { useTemplateTypes } from "@/hooks/usePages";
import type { Page } from "@/types/types";

interface EditPageDialogProps {
  page: Page | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPageDialog({ page, isOpen, onClose, onSuccess }: EditPageDialogProps) {
  const { data: templateTypesData, isLoading: isLoadingTemplates } = useTemplateTypes();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: page?.title || "",
    content: page?.content || "",
    template_type: page?.template || "",
    meta_title: page?.meta_title || "",
    meta_description: page?.meta_description || "",
  });
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [ogImage, setOgImage] = useState<File | null>(null);

  // Get template types from API response
  const templateTypes = templateTypesData?.data?.templates || [];

  // Parse existing template_type to extract name and version
  useEffect(() => {
    if (page?.template) {
      const parts = page.template.split('_');
      if (parts.length >= 2) {
        const version = parts.pop()!;
        const name = parts.join('_');
        setSelectedTemplateName(name);
        setSelectedVersion(version);
      }
    }
  }, [page]);

  // Update template_type when template name or version changes
  useEffect(() => {
    if (selectedTemplateName && selectedVersion) {
      setFormData(prev => ({
        ...prev,
        template_type: `${selectedTemplateName}_${selectedVersion}`
      }));
    }
  }, [selectedTemplateName, selectedVersion]);

  // Reset version when template name changes
  useEffect(() => {
    if (selectedTemplateName) {
      setSelectedVersion("");
    }
  }, [selectedTemplateName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page) return;

    try {
      setLoading(true);
      const data = {
        ...formData,
        og_image_file: ogImage || undefined,
      };
      
      await pageService.updatePage(page.id, data);
      toast.success("Page updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating page:", error);
      toast.error("Failed to update page");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOgImage(file);
    }
  };

  if (!page) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Page</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template_name">Template Name</Label>
              <Select
                value={selectedTemplateName}
                onValueChange={setSelectedTemplateName}
                disabled={isLoadingTemplates}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Select template name"} />
                </SelectTrigger>
                <SelectContent>
                  {templateTypes.map((template) => (
                    <SelectItem key={template.name} value={template.name}>
                      {template.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template_version">Version</Label>
              <Select
                value={selectedVersion}
                onValueChange={setSelectedVersion}
                disabled={!selectedTemplateName || isLoadingTemplates}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={!selectedTemplateName ? "Select template first" : "Select version"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedTemplateName && templateTypes
                    .find(t => t.name === selectedTemplateName)
                    ?.versions.map((version) => (
                      <SelectItem key={version} value={version}>
                        {version}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.template_type && (
            <div className="space-y-2">
              <Label>Selected Template Type</Label>
              <Input
                value={formData.template_type}
                readOnly
                className="bg-gray-50"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              name="meta_title"
              value={formData.meta_title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description}
              onChange={handleChange}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="og_image">OG Image</Label>
            <Input
              id="og_image"
              name="og_image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
