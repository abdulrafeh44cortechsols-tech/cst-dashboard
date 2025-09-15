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
import { toast } from "sonner"
import ReCAPTCHA from "react-google-recaptcha"
import type { Editor ,CreateEditorData} from "@/types/types"

interface AddEditorDialogProps {
  onAdd: (editor:CreateEditorData) => void
}

export function AddEditorDialog({ onAdd }: AddEditorDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ username: "", email: "",password:""})

  // reCAPTCHA verification state
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [captchaValue, setCaptchaValue] = useState<string | null>(null)

  function onCaptchaChange(value: string | null) {
    console.log("Captcha value:", value);
    setCaptchaValue(value);
    setCaptchaVerified(!!value); // Set to true if value exists, false otherwise
  }

  const handleSubmit = async () => {
    if (!formData.username || !formData.email) return

    // Check if reCAPTCHA is verified
    if (!captchaVerified || !captchaValue) {
      toast.error("Please complete the reCAPTCHA verification.");
      return;
    }

    try {
      setSubmitting(true)
      await onAdd(formData)
      setFormData({ username: "", email: "",password:"" })
      setCaptchaVerified(false)
      setCaptchaValue(null)
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to add editor:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ username: "", email: "",password:"" })
    setCaptchaVerified(false)
    setCaptchaValue(null)
    setIsOpen(false)
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
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={submitting}
            />
          </div>

          <div className="flex justify-start">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_URL || ""}
              onChange={onCaptchaChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant={"blue"} onClick={handleSubmit} disabled={submitting || !formData.username || !formData.email || !captchaVerified}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Editor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
