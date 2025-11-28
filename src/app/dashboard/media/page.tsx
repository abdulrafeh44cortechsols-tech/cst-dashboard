"use client";
import { MediaGallery } from "@/components/media/MediaGallery";
import { MediaUploadForm } from "@/components/media/MediaUploadForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { AdminOnlyRoute } from "@/components/RouteGuard";

export default function MediaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AdminOnlyRoute>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg md:text-2xl">All Media</h1>
          <Button
            size="sm"
            variant="blue"
            onClick={() => setIsModalOpen(true)}
          >
            <>
            <PlusCircle className=" h-4 w-4" />
            Upload
            </>
          </Button>
        </div>

        <MediaGallery />

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload media</DialogTitle>
              <DialogDescription>
                Drag or manually upload by choosing files from you device.
              </DialogDescription>
            </DialogHeader>
            <MediaUploadForm />
          </DialogContent>
        </Dialog>
      </div>
    </AdminOnlyRoute>
  );
}
