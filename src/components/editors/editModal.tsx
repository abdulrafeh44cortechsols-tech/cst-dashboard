"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { Editor,CreateEditorData } from "@/types/editor"

interface EditEditorDialogProps {
  editor: Editor | null
  isOpen: boolean
  onClose: () => void
  onSave: (editor: CreateEditorData) => void
}

export function EditEditorDialog({ editor, isOpen, onClose, onSave }: EditEditorDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", role: "Editor" as Editor["role"] })

  useEffect(() => {
    if (editor) {
      setFormData({ name: editor.name, email: editor.email, role: editor.role })
    }
  }, [editor])

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) return

    try {
      setSubmitting(true)
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error("Failed to update editor:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Editor</DialogTitle>
          <DialogDescription>Update the editor's information below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              placeholder="Enter editor's name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="Enter editor's email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: Editor["role"]) => setFormData({ ...formData, role: value })}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem disabled value="Senior Editor">Senior Editor</SelectItem>
                <SelectItem disabled value="Managing Editor">Managing Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant={"blue"} onClick={handleSubmit} disabled={submitting || !formData.name || !formData.email}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
