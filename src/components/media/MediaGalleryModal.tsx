"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useMedia } from "@/hooks/useMedia";
import { useMediaStore } from "@/stores";
import { getImageUrl } from "@/lib/utils";
import type { MediaItem } from "@/services/media";

interface MediaGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: MediaItem[]) => void;
  maxSelection?: number;
  minSelection?: number;
  title?: string;
}

export function MediaGalleryModal({
  open,
  onOpenChange,
  onSelect,
  maxSelection = 1,
  minSelection = 1,
  title = "Select from Media Gallery",
}: MediaGalleryModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const pageSize = 12;

  // Fetch media when modal opens
  const { getMediaList } = useMedia(currentPage, pageSize, open);
  const { media } = useMediaStore();

  // Reset selection when modal opens
  useEffect(() => {
    if (open) {
      setSelectedMedia([]);
      setCurrentPage(1);
    }
  }, [open]);

  const handleMediaClick = (mediaItem: MediaItem) => {
    setSelectedMedia((prev) => {
      const isSelected = prev.some((m) => m.id === mediaItem.id);

      if (isSelected) {
        // Remove from selection
        return prev.filter((m) => m.id !== mediaItem.id);
      } else {
        // Add to selection (respect max limit)
        if (maxSelection === 1) {
          // Single selection mode - replace
          return [mediaItem];
        } else if (prev.length < maxSelection) {
          // Multi selection mode - add if under limit
          return [...prev, mediaItem];
        }
        return prev;
      }
    });
  };

  const handleConfirm = () => {
    if (selectedMedia.length >= minSelection) {
      onSelect(selectedMedia);
      onOpenChange(false);
    }
  };

  const totalPages = media ? Math.ceil(media.count / pageSize) : 0;

  const isSelected = (mediaItem: MediaItem) =>
    selectedMedia.some((m) => m.id === mediaItem.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Badge variant="outline" className="ml-2">
              {selectedMedia.length} / {maxSelection} selected
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {getMediaList.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading media...</p>
              </div>
            </div>
          ) : getMediaList.isError ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-red-400 mb-3" />
                <p className="text-red-500">Failed to load media. Please try again.</p>
              </div>
            </div>
          ) : !media || !media.results || media.results.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-500">No media files available.</p>
                <p className="text-sm text-slate-400 mt-1">
                  Upload images first to select them here.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Media Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {media.results.map((mediaItem) => (
                  <Card
                    key={mediaItem.id}
                    className={`overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
                      isSelected(mediaItem)
                        ? "ring-2 ring-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() => handleMediaClick(mediaItem)}
                  >
                    <div className="aspect-square relative bg-slate-100">
                      <img
                        src={getImageUrl(mediaItem.image)}
                        alt={mediaItem.alt_text || `Media ${mediaItem.id}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      {isSelected(mediaItem) && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-5 w-5" />
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs text-slate-600 truncate">
                        {mediaItem.alt_text || `Image ID: ${mediaItem.id}`}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedMedia.length < minSelection}
          >
            Select {selectedMedia.length > 0 ? `(${selectedMedia.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
