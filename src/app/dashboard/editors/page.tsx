"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EditorTable } from "@/components/editors/editorTable";
import { AddEditorDialog } from "@/components/editors/addModal";
import { EditEditorDialog } from "@/components/editors/editModal";
import { TeamOverview } from "@/components/editors/teamOverview";
import type { Editor, CreateEditorData } from "@/types/types";
import { useEditors } from "@/hooks/useEditors";
import { useAuth } from "@/hooks/useAuth";

export default function EditorManagement() {
  //state to select current editor being edited
  const [editingEditor, setEditingEditor] = useState<Editor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { user, loading } = useAuth();
  const { getEditorsList, addEditor, editEditor, removeEditor } = useEditors(user?.userType === "admin");

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-full space-y-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Redirect non-admin users
  if (user?.userType !== "admin") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-full space-y-6">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access the Editors management page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddEditor = (editorData: CreateEditorData) => {
    addEditor.mutate(editorData, {
      onSuccess: () =>
        toast.success("Editor Added"),
      onError: () =>
        toast.error("Failed to add editor. Please try again."),
    });
  };

  const handleEditEditor = (editorData: CreateEditorData) => {
    if (!editingEditor) return;
    editEditor.mutate(
      { id: editingEditor.id, data: editorData },
      {
        onSuccess: () =>
          toast.success("Editor Updated"),
        onError: () =>
          toast.error("Failed to update editor. Please try again."),
      }
    );
  };

  const handleDeleteEditor = (id: string) => {
    removeEditor.mutate(id, {
      onSuccess: () =>
        toast.success("Editor Deleted"),
      onError: () =>
        toast.error("Failed to delete editor. Please try again."),
    });
  };

  if (getEditorsList.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading editors...</span>
      </div>
    );
  }

  const editors = getEditorsList.data || [];

  const openEditDialog = (editor: Editor) => {
    setEditingEditor(editor);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditingEditor(null);
    setIsEditDialogOpen(false);
  };



  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Editor Management</h1>
            <p className="text-muted-foreground">
              Manage your editorial team members and their roles
            </p>
          </div>
          <AddEditorDialog onAdd={handleAddEditor} />
        </div>

        <TeamOverview editors={editors} />
        <EditorTable editors={editors} onEdit={openEditDialog} onDelete={handleDeleteEditor} />

        <EditEditorDialog
          editor={editingEditor}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleEditEditor}
        />
      </div>
    </div>
  );
}