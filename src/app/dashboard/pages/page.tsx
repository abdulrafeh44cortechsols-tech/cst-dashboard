"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PagesTable } from "@/components/pages/PagesTable";
import { EditPageDialog } from "@/components/pages/EditPageDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Page } from "@/types/types";
import { usePages } from "@/hooks/usePages";
import { usePageStore } from "@/stores";
import Link from "next/link";

export default function PagesPage() {
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { getPagesList, addPage, editPage, removePage } = usePages();
  const { pages } = usePageStore();

  // Ensure pages is always an array
  const pagesArray = Array.isArray(pages) ? pages : [];
  
  // Debug logging
  console.log("Pages from store:", pages);
  console.log("Pages type:", typeof pages);
  console.log("Is pages array:", Array.isArray(pages));
  console.log("Pages array:", pagesArray);

  const handleAddPage = (pageData: any) => {
    addPage.mutate(pageData, {
      onSuccess: () => toast.success("Page added successfully!"),
      onError: () => toast.error("Failed to add page. Please try again."),
    });
  };

  const handleEditPage = (pageData: any) => {
    if (!editingPage) return;
    editPage.mutate(
      { id: editingPage.id.toString(), data: pageData },
      {
        onSuccess: () => toast.success("Page updated successfully!"),
        onError: () => toast.error("Failed to update page!"),
      }
    );
  };

  const handleDeletePage = (id: string) => {
    removePage.mutate(id, {
      onSuccess: () => toast.success("Page deleted successfully!"),
      onError: () => toast.error("Failed to delete page. Please try again."),
    });
  };

  if (getPagesList.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading pages...</span>
      </div>
    );
  }

  const openEditDialog = (page: Page) => {
    setEditingPage(page);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditingPage(null);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Page Management
            </h1>
            <p className="text-muted-foreground">
              Manage your static pages and their content
            </p>
          </div>
          <Button variant="blue" asChild size="sm">
          <Link href="/dashboard/pages/new">
            <PlusCircle className=" h-4 w-4" />
            Add New Page
          </Link>
        </Button>
        </div>

        <PagesTable
          pages={pagesArray}
          onEdit={openEditDialog}
          onDelete={handleDeletePage}
        />

        <EditPageDialog
          page={editingPage}
          isOpen={isEditDialogOpen}
          onClose={closeEditDialog}
          onSuccess={() => {
            closeEditDialog();
            getPagesList.refetch();
          }}
        />
        {/* <EditPageDialog
          page={editingPage}
          isOpen={isEditDialogOpen}
          onClose={closeEditDialog}
          onSave={handleEditPage}
        /> */}
      </div>
    </div>
  );
}
