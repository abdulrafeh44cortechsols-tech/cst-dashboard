"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ImageIcon, Video, Trash2, Calendar, FileText, BookOpen, Briefcase } from "lucide-react"
import { useMedia } from "@/hooks/useMedia"
import { useMediaStore } from "@/stores"
import { getImageUrl } from "@/lib/utils"

export function MediaGallery() {
  const { getMediaList } = useMedia()
  const { media } = useMediaStore()

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

  if (!media || (!media.data.blogs && !media.data.services)) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">No media files yet</h3>
              <p className="text-sm text-slate-500 mt-1">No media files found in blogs or services</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate total media count
  const totalBlogImages = Object.values(media.data.blogs || {}).flat().length
  const totalServiceImages = Object.values(media.data.services || {}).flat().length
  const totalImages = totalBlogImages + totalServiceImages

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
          <CardTitle className="text-xl font-semibold">Media Gallery ({totalImages} files)</CardTitle>
        </CardHeader>
      </Card>

      {/* Blogs Section */}
      {media.data.blogs && Object.keys(media.data.blogs).length > 0 && (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Blog Images ({totalBlogImages})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {Object.entries(media.data.blogs).map(([blogId, images]) => (
                <div key={blogId} className="space-y-3">
                  <h3 className="text-md font-medium text-slate-700">Blog ID: {blogId}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {images.map((imageUrl, index) => (
                      <Card key={`${blogId}-${index}`} className="overflow-hidden">
                        <div className="aspect-video relative bg-slate-100">
                          <img
                            src={getImageUrl(imageUrl)}
                            alt={`Blog ${blogId} image ${index + 1}`}
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
                        </div>
                        <CardContent className="p-3">
                          <div className="text-sm text-slate-600">
                            Blog {blogId} - Image {index + 1}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services Section */}
      {media.data.services && Object.keys(media.data.services).length > 0 && (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              Service Images ({totalServiceImages})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {Object.entries(media.data.services).map(([serviceId, images]) => (
                <div key={serviceId} className="space-y-3">
                  <h3 className="text-md font-medium text-slate-700">Service ID: {serviceId}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {images.map((imageUrl, index) => (
                      <Card key={`${serviceId}-${index}`} className="overflow-hidden">
                        <div className="aspect-video relative bg-slate-100">
                          <img
                            src={getImageUrl(imageUrl)}
                            alt={`Service ${serviceId} image ${index + 1}`}
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
                        </div>
                        <CardContent className="p-3">
                          <div className="text-sm text-slate-600">
                            Service {serviceId} - Image {index + 1}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
