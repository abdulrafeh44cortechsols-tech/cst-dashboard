"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ImageIcon, X } from "lucide-react";
import { MediaGalleryModal } from "./MediaGalleryModal";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import type { MediaItem } from "@/services/media";

interface ImageUploadOptionsProps {
  label: string;
  required?: boolean;
  maxFiles?: number;
  minFiles?: number;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  error?: string;
  helperText?: string;

  // For file upload mode
  onFileSelect?: (files: File[]) => void;

  // For media gallery selection mode - returns media items with id and url
  onMediaSelect?: (media: MediaItem[]) => void;

  // Current preview images (URLs)
  currentPreviews?: string[];
  onRemovePreview?: (index: number) => void;

  // Whether gallery selection is already "uploaded" (no need to upload again)
  selectedFromGallery?: boolean;
}

export function ImageUploadOptions({
  label,
  required = false,
  maxFiles = 1,
  minFiles = 1,
  accept = "image/*",
  maxSizeMB = 5,
  disabled = false,
  error,
  helperText,
  onFileSelect,
  onMediaSelect,
  currentPreviews = [],
  onRemovePreview,
  selectedFromGallery = false,
}: ImageUploadOptionsProps) {
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      // Validate file count
      if (files.length > maxFiles) {
        toast.error(`You can only upload up to ${maxFiles} image(s)`);
        return;
      }

      // Validate each file
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          toast.error("Please select only image files");
          return;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(`Each image must be less than ${maxSizeMB}MB`);
          return;
        }
      }

      onFileSelect?.(files);
    }
  };

  const handleMediaGallerySelect = (media: MediaItem[]) => {
    onMediaSelect?.(media);
    setShowGalleryModal(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <Label className="block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Current Previews */}
      {currentPreviews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {currentPreviews.map((preview, index) => (
            <div
              key={index}
              className="relative group w-24 h-24 rounded-md overflow-hidden border"
            >
              <img
                src={getImageUrl(preview)}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              {onRemovePreview && (
                <button
                  type="button"
                  onClick={() => onRemovePreview(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              {selectedFromGallery && (
                <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[10px] text-center py-0.5">
                  From Gallery
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Options */}
      <div className="flex flex-wrap gap-2">
        {/* Upload from Computer */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload from Computer
        </Button>

        {/* Select from Gallery */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowGalleryModal(true)}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          Select from Gallery
        </Button>

        {/* Hidden file input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {/* Helper text */}
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Media Gallery Modal */}
      <MediaGalleryModal
        open={showGalleryModal}
        onOpenChange={setShowGalleryModal}
        onSelect={handleMediaGallerySelect}
        maxSelection={maxFiles}
        minSelection={minFiles}
        title={`Select ${maxFiles > 1 ? `up to ${maxFiles} images` : "an image"}`}
      />
    </div>
  );
}
