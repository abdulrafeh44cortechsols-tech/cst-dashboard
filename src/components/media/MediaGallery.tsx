"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { ImageIcon, Video, Trash2, Calendar, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { useMedia } from "@/hooks/useMedia"
import { useMediaStore } from "@/stores"
import { getImageUrl } from "@/lib/utils"

export function MediaGallery() {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mediaToDelete, setMediaToDelete] = useState<number | null>(null)
  
  const { getMediaList, deleteMedia } = useMedia(currentPage, pageSize)
  const { media } = useMediaStore()

  const handleDeleteClick = (mediaId: number) => {
    setMediaToDelete(mediaId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!mediaToDelete) return
    
    try {
      await deleteMedia.mutateAsync(mediaToDelete)
      toast.success("Media deleted successfully")
      setDeleteDialogOpen(false)
      setMediaToDelete(null)
    } catch (error) {
      toast.error("Failed to delete media")
      console.error("Delete error:", error)
    }
  }

  if (getMediaList.isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">Loading media...</h3>
              <p className="text-sm text-slate-500 mt-1">Please wait while we fetch your media files</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (getMediaList.isError) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-900">Failed to load media</h3>
              <p className="text-sm text-red-500 mt-1">Please try again later</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!media || !media.results || media.results.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">No media files yet</h3>
              <p className="text-sm text-slate-500 mt-1">Upload some images to get started</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalPages = Math.ceil(media.count / pageSize)

  return (
    <div className="space-y-6">
      {/* Header with pagination info */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl font-semibold">
            Media Gallery ({media.count} files)
          </CardTitle>
          <div className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </div>
        </CardHeader>
      </Card>

      {/* Media Grid */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {media.results.map((mediaItem) => (
              <Card key={mediaItem.id} className="overflow-hidden group relative">
                <div className="aspect-video relative bg-slate-100">
                  <img
                    src={getImageUrl(mediaItem.image)}
                    alt={mediaItem.alt_text || `Media ${mediaItem.id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      Image
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteClick(mediaItem.id)}
                      disabled={deleteMedia.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {/* <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      ID: {mediaItem.id}
                    </div>
                    {mediaItem.alt_text && (
                      <div className="text-xs text-slate-600 line-clamp-2">
                        {mediaItem.alt_text}
                      </div>
                    )}
                    <div className="text-xs text-slate-400">
                      {new Date(mediaItem.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent> */}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the media file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMediaToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMedia.isPending}
            >
              {deleteMedia.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
