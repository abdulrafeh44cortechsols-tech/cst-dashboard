"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePages, useTemplateTypes } from "@/hooks/usePages";
import { toast } from "sonner";

export default function NewPagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addPage } = usePages();
  const { data: templateTypesData, isLoading: isLoadingTemplates } = useTemplateTypes();
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    template_type: "",
    meta_title: "",
    meta_description: "",
    is_published: false,
    is_homepage: false,
  });
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [ogImage, setOgImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Get template types from API response
  const templateTypes = templateTypesData?.data?.templates || [];

  // Handle template parameter from URL
  useEffect(() => {
    const templateParam = searchParams.get('template');
    if (templateParam && templateTypes.length > 0) {
      // Find the template type that matches the parameter
      const templateType = templateTypes.find(t => t.name === templateParam);
      if (templateType) {
        setSelectedTemplateName(templateType.name);
        // Auto-select the first version if available
        if (templateType.versions.length > 0) {
          setSelectedVersion(templateType.versions[0]);
        }
        toast.success(`Template "${templateType.name}" pre-selected`);
      }
    }
  }, [searchParams, templateTypes]);

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
    setSelectedVersion("");
  }, [selectedTemplateName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        og_image_file: ogImage || undefined,
      };
      
      await addPage.mutateAsync(data);
      toast.success("Page created successfully");
      router.push("/dashboard/pages");
    } catch (error) {
      console.error("Error creating page:", error);
      toast.error("Failed to create page");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Clean up previous preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    if (file) {
      setOgImage(file);
      // Create preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview("");
    }
  };

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="container mx-auto py-6 pt-2">
        
      <Card>
        <CardHeader>
          <CardTitle>Create New Page</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                rows={10}
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
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-40 w-auto rounded border object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => router.push("/dashboard/pages")}
              >
                Cancel
              </Button>
              <Button variant={"blue"} type="submit" disabled={addPage.isPending}>
                {addPage.isPending ? "Creating..." : "Create Page"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
