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
import { AdminOnlyRoute } from "@/components/RouteGuard";

export default function EditorManagement() {
  //state to select current editor being edited
  const [editingEditor, setEditingEditor] = useState<Editor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { user } = useAuth();
  const { getEditorsList, addEditor, editEditor, removeEditor } = useEditors(user?.userType === "admin");

  const handleAddEditor = async (editorData: CreateEditorData) => {
    try {
      await addEditor.mutateAsync(editorData);
      toast.success("Editor added successfully!");
    } catch (error) {
      // Re-throw the error so the modal can handle it
      throw error;
    }
  };

  const handleEditEditor = (editorData: CreateEditorData) => {
    if (!editingEditor) return;
    editEditor.mutate(
      { id: editingEditor.id.toString(), data: editorData },
      {
        onSuccess: () => toast.success("Editor updated successfully!"),
        onError: () => toast.error("Failed to update editor!"),
      }
    );
  };

  const handleDeleteEditor = (id: string) => {
    removeEditor.mutate(id, {
      onSuccess: () => toast.success("Editor deleted successfully!"),
      onError: () => toast.error("Failed to delete editor. Please try again."),
    });
  };

  const openEditDialog = (editor: Editor) => {
    setEditingEditor(editor);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditingEditor(null);
    setIsEditDialogOpen(false);
  };

  return (
    <AdminOnlyRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-full space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Editor Management
            </h1>
            <p className="text-muted-foreground">
              Manage your team of editors and their permissions
            </p>
          </div>

          <TeamOverview editors={getEditorsList.data || []} />

          <EditorTable
            editors={getEditorsList.data || []}
            onEdit={openEditDialog}
            onDelete={handleDeleteEditor}
          />

          <AddEditorDialog onAdd={handleAddEditor} />

          <EditEditorDialog
            editor={editingEditor}
            isOpen={isEditDialogOpen}
            onClose={closeEditDialog}
            onSave={handleEditEditor}
          />
        </div>
      </div>
    </AdminOnlyRoute>
  );
}