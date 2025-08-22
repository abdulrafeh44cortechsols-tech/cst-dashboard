"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/useToast"
import { ImageIcon, Video, Trash2, Calendar, FileText } from "lucide-react"

interface StoredMediaFile {
  id: string
  name: string
  type: "image" | "video"
  size: number
  altText: string
  preview: string
  uploadDate: string
}

export function MediaGallery() {
  const [storedFiles, setStoredFiles] = useState<StoredMediaFile[]>([])
  const { toast } = useToast()

  const loadStoredFiles = () => {
    const files = JSON.parse(localStorage.getItem("uploadedMedia") || "[]")
    setStoredFiles(files.reverse()) // Show newest first
  }

  useEffect(() => {
    loadStoredFiles()

    // Listen for new uploads
    const handleMediaUploaded = () => {
      loadStoredFiles()
    }

    window.addEventListener("mediaUploaded", handleMediaUploaded)
    return () => window.removeEventListener("mediaUploaded", handleMediaUploaded)
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const deleteFile = (id: string) => {
    const updatedFiles = storedFiles.filter((file) => file.id !== id)
    setStoredFiles(updatedFiles)
    localStorage.setItem("uploadedMedia", JSON.stringify(updatedFiles))

    toast({
      title: "File deleted",
      description: "Media file has been removed from storage",
    })
  }

  const clearAllFiles = () => {
    setStoredFiles([])
    localStorage.removeItem("uploadedMedia")

    toast({
      title: "All files cleared",
      description: "All stored media files have been removed",
    })
  }

  if (storedFiles.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">No media files yet</h3>
              <p className="text-sm text-slate-500 mt-1">Upload some images or videos to see them here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">Media Gallery ({storedFiles.length})</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFiles}
          className="text-red-600 hover:text-red-700 bg-transparent"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {storedFiles.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <div className="aspect-video relative bg-slate-100">
                <img
                  src={file.preview || "/placeholder.svg"}
                  alt={file.altText || "Media preview"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {file.type === "image" ? (
                      <ImageIcon className="w-3 h-3 mr-1" />
                    ) : (
                      <Video className="w-3 h-3 mr-1" />
                    )}
                    {file.type}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => deleteFile(file.id)}
                    className="h-8 w-8 p-0 bg-white/80 hover:bg-white text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h4 className="font-medium text-slate-900 truncate">{file.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(file.uploadDate)}
                    </div>
                  </div>
                </div>

                {file.altText && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
                      <FileText className="w-3 h-3" />
                      Alt Text
                    </div>
                    <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded text-wrap break-words">
                      {file.altText}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
