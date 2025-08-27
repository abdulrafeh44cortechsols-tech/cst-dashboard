"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/hooks/useServices";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {toast} from "sonner"

export default function AddBlogPage() {
  const router = useRouter();
  const { addService } = useServices();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      setPreviews(files.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !metaTitle || !metaDescription) {
      toast.error("Please fill all fields.");
      return;
    }
    if (description.length < 50) {
      toast.error("Description length must be more then 50 characters.");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("meta_title", metaTitle);
      formData.append("meta_description", metaDescription);
      images.forEach((file) => {
        formData.append("image_files", file); // send as list
      });

      await addService.mutateAsync(formData);

      toast.success("Service added successfully!");
      router.push("/dashboard/services");
    } catch (error: any) {
      toast.error("Failed to create service. Please try again.");
    }
  };

  return (
    <div className="w-full mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Add New Service</h1>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        {/* Title */}
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter service title"
            required
          />
        </div>

        {/* Content */}
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your service description..."
            rows={10}
            required
          />
        </div>

        {/* Meta Title */}
        <div className="grid gap-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Enter meta title for SEO"
            required
          />
        </div>

        {/* Meta Description */}
        <div className="grid gap-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Enter meta description for SEO"
            rows={3}
            required
          />
        </div>

        {/* Slug */}
        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="title"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Enter service slug"
            required
          />
        </div>

        {/* Image Upload */}
        <div className="grid gap-2">
          <Label htmlFor="image">Upload Image</Label>
          <Input
            id="image"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
          {previews.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {previews.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  className="h-40 w-auto rounded border object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={addService.isPending}
          className="w-fit"
          variant={"blue"}
        >
          {addService.isPending ? "Creating..." : "Create Service"}
        </Button>
      </form>
    </div>
  );
}
