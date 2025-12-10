"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, X, ImageIcon, FileText, Loader2 } from "lucide-react";
import { useMedia } from "@/hooks/useMedia";

interface MediaFile {
  file: File;
  preview: string;
  type: "image";
  altText: string;
  id: string;
}

interface StoredMediaFile {
  id: string;
  name: string;
  type: "image";
  size: number;
  altText: string;
  preview: string;
  uploadDate: string;
}

export function MediaUploadForm() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadMultipleMedia } = useMedia();


  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFiles = useCallback(
    
    async (files: FileList) => {
    console.log("inside handle files")

      const validFiles = Array.from(files).filter(
        (file) => file.type.startsWith("image/")
      );

      if (validFiles.length !== files.length) {
        toast.warning("Only image files are allowed.");
      }

      const newMediaFiles: MediaFile[] = [];

      for (const file of validFiles) {
        const preview = await createPreview(file);
        const mediaFile: MediaFile = {
          file,
          preview,
          type: "image",
          altText: "",
          id: Math.random().toString(36).substr(2, 9),
        };
        newMediaFiles.push(mediaFile);
      }

      setMediaFiles((prev) => [...prev, ...newMediaFiles]);
    },
    [createPreview, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback((id: string) => {
    setMediaFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const updateAltText = useCallback((id: string, altText: string) => {
    setMediaFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, altText } : file))
    );
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (mediaFiles.length === 0) {
        toast.warning("Please upload at least one media file.");
        return;
      }

      // Check if all files have alt text
      const filesWithoutAltText = mediaFiles.filter(
        (file) => !file.altText.trim()
      );
      if (filesWithoutAltText.length > 0) {
        toast.error("Please provide alt text for all media files.");
        return;
      }

      try {
        // Prepare upload data
        const uploadData = mediaFiles.map((mediaFile) => ({
          image: mediaFile.file,
          alt_text: mediaFile.altText,
        }));

        // Upload to API
        await uploadMultipleMedia.mutateAsync(uploadData);

        toast.success(`${mediaFiles.length} media file(s) uploaded successfully!`);

        // Reset form
        setMediaFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(error?.message || "Failed to upload media files. Please try again.");
      }
    },
    [mediaFiles, uploadMultipleMedia]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <Card className="w-full max-h-[400px] overflow-scroll shadow-none border-none">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Area */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 hover:border-slate-400"
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-900">
                  Drop your images here
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  or click to browse • Images only
                </p>
              </div>
              <Button type="button" variant="outline" size="sm">
                Choose Files
              </Button>
            </div>
          </div>

          {/* Uploaded Files */}
          {mediaFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900">
                Uploaded Files ({mediaFiles.length})
              </h3>
              <div className="space-y-4">
                {mediaFiles.map((mediaFile) => (
                  <Card key={mediaFile.id} className="p-4">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 relative">
                          <img
                            src={mediaFile.preview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 right-1">
                            <Badge
                              variant="secondary"
                              className="text-xs px-1 py-0"
                            >
                              <ImageIcon className="w-3 h-3" />
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* File Info and Alt Text */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900 truncate">
                              {(() => {
                                const name = mediaFile.file.name;
                                if (name.length <= 30) return name;

                                const dotIndex = name.lastIndexOf(".");
                                const ext =
                                  dotIndex !== -1 ? name.slice(dotIndex) : "";
                                return (
                                  name.slice(0, 30 - ext.length - 3) +
                                  "..." +
                                  ext
                                );
                              })()}
                            </p>

                            <p className="text-sm text-slate-500">
                              {formatFileSize(mediaFile.file.size)} •{" "}
                              {mediaFile.type}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(mediaFile.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor={`alt-${mediaFile.id}`}
                            className="text-sm font-medium flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            Alt Text (Required)
                          </Label>
                          <Textarea
                            id={`alt-${mediaFile.id}`}
                            placeholder="Describe this media for accessibility..."
                            value={mediaFile.altText}
                            onChange={(e) =>
                              updateAltText(mediaFile.id, e.target.value)
                            }
                            className="resize-none"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              variant={"blue"}
              type="submit"
              disabled={mediaFiles.length === 0 || uploadMultipleMedia.isPending}
              className="px-8"
            >
              {uploadMultipleMedia.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                `Upload Images (${mediaFiles.length})`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
