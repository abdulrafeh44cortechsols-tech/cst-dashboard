"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import type { Editor ,CreateEditorData} from "@/types/editor"

interface AddEditorDialogProps {
  onAdd: (editor:CreateEditorData) => void
}

export function AddEditorDialog({ onAdd }: AddEditorDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "",password:"", role: "Editor" as Editor["role"] })

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) return

    try {
      setSubmitting(true)
      await onAdd(formData)
      setFormData({ name: "", email: "",password:"", role: "Editor" })
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to add editor:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant={"blue"}>
          <Plus className="h-4 w-4" />
          Add Editor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Editor</DialogTitle>
          <DialogDescription>Add a new editor to your team. Fill in their details below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="add-name">Name</Label>
            <Input
              id="add-name"
              placeholder="Enter editor's name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-email">Email</Label>
            <Input
              id="add-email"
              type="email"
              placeholder="Enter editor's email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={submitting}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="add-email">Password</Label>
            <Input
              id="add-password"
              type="password"
              placeholder="Enter editor's password"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-role">Role</Label>
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
                <SelectItem value="Senior Editor">Senior Editor</SelectItem>
                <SelectItem value="Managing Editor">Managing Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !formData.name || !formData.email}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Editor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
