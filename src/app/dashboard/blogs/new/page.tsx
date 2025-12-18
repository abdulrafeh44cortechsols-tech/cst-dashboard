"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBlogs } from "@/hooks/useBlogs";
import { useTags } from "@/hooks/useTags";
import { blogService } from "@/services/blogs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Save, Trash2, RefreshCw, AlertCircle, Upload, ImageIcon, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { MediaGalleryModal } from "@/components/media/MediaGalleryModal";
import type { MediaItem } from "@/services/media";
import { Tag } from "@/types/types";
import CustomEditor from "@/components/blog/CustomEditor";

export default function AddBlogPage() {
  const router = useRouter();
  const { addBlog } = useBlogs(1, 10, false);
  const { getTags } = useTags();

  // Basic blog fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Error handling state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Slug validation state
  const [slugCheckMessage, setSlugCheckMessage] = useState<string>("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // File uploads - only featured image
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [featuredImageAltText, setFeaturedImageAltText] = useState<string>("");
  const [featuredImageId, setFeaturedImageId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [selectedFromGallery, setSelectedFromGallery] = useState(false);

  // Draft management state
  const [draftExists, setDraftExists] = useState(false);
  const [lastDraftSave, setLastDraftSave] = useState<Date | null>(null);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const DRAFT_KEY = "blog_draft_data";
  const DRAFT_SAVE_INTERVAL = 30000; // 30 seconds

  // Get tags data safely from new API structure
  const tagsData = getTags.data?.results || [];

  // Draft management functions
  const saveDraft = useCallback(() => {
    if (!autoSaveEnabled) return;

    const draftData = {
      title,
      slug,
      excerpt,
      content,
      metaTitle,
      metaDescription,
      published,
      selectedTagIds,
      featuredImageId,
      featuredImageAltText,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      setLastDraftSave(new Date());
      setDraftExists(true);
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, [
    title,
    slug,
    excerpt,
    content,
    metaTitle,
    metaDescription,
    published,
    selectedTagIds,
    featuredImageId,
    featuredImageAltText,
    autoSaveEnabled,
  ]);

  const loadDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        setTitle(draftData.title || "");
        setSlug(draftData.slug || "");
        setExcerpt(draftData.excerpt || "");
        setContent(draftData.content || "");
        setMetaTitle(draftData.metaTitle || "");
        setMetaDescription(draftData.metaDescription || "");
        setPublished(draftData.published || false);
        setSelectedTagIds(draftData.selectedTagIds || []);
        setFeaturedImageId(draftData.featuredImageId || null);
        setFeaturedImageAltText(draftData.featuredImageAltText || "");
        setLastDraftSave(new Date(draftData.timestamp));
        setDraftExists(true);
        toast.success("Draft restored successfully!");
        setShowDraftRecovery(false);
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
      toast.error("Failed to restore draft");
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setDraftExists(false);
      setLastDraftSave(null);
      toast.success("Draft cleared successfully!");
    } catch (error) {
      console.error("Failed to clear draft:", error);
      toast.error("Failed to clear draft");
    }
  }, []);

  const checkForExistingDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        const draftDate = new Date(draftData.timestamp);
        setLastDraftSave(draftDate);
        setDraftExists(true);
        setShowDraftRecovery(true);
      }
    } catch (error) {
      console.error("Failed to check for existing draft:", error);
    }
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const autoSaveInterval = setInterval(() => {
      if (title || content || excerpt) {
        saveDraft();
      }
    }, DRAFT_SAVE_INTERVAL);

    return () => clearInterval(autoSaveInterval);
  }, [saveDraft, title, content, excerpt, autoSaveEnabled]);

  // Check for existing draft on component mount
  useEffect(() => {
    checkForExistingDraft();
  }, [checkForExistingDraft]);

  // Save draft when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (title || content || excerpt) {
        saveDraft();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveDraft, title, content, excerpt]);

  // Utility function to generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Debounced slug validation
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugCheckMessage("");
      setSlugAvailable(null);
      return;
    }

    setIsCheckingSlug(true);
    setSlugCheckMessage("");
    setSlugAvailable(null);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await blogService.checkSlugAvailability(slug, 'blog');
        setSlugCheckMessage(response.message);
        setSlugAvailable(response.message === "You can use this slug.");
      } catch (error: any) {
        console.error("Error checking slug:", error);
        setSlugCheckMessage("This slug already exists.");
        setSlugAvailable(null);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 5000); // 5 seconds delay

    return () => clearTimeout(timeoutId);
  }, [slug]);

  // Handle title change and auto-generate slug
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setFeaturedImageFile(file);
      setFeaturedImagePreview(URL.createObjectURL(file));
      setFeaturedImageAltText("");
      setFeaturedImageId(null); // Reset image ID until uploaded

      // Prompt user to add alt text
      toast.info('Please add alt text for the image before uploading', {
        duration: 4000,
      });
    }
  };

  const uploadFeaturedImage = async () => {
    if (!featuredImageFile) return;

    if (!featuredImageAltText.trim()) {
      toast.error('Please add alt text before uploading the image');
      return;
    }

    setUploadingImage(true);

    try {
      // Upload image with alt text
      const { mediaService } = await import("@/services/media");
      const uploadedMedia = await mediaService.uploadMedia({
        image: featuredImageFile,
        alt_text: featuredImageAltText,
      });

      setFeaturedImageId(uploadedMedia.id);
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image: " + (error.message || "Unknown error"));
      setFeaturedImageId(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTagChange = (tagId: number, checked: boolean) => {
    if (checked) {
      setSelectedTagIds((prev) => [...prev, tagId]);
    } else {
      setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
    }
  };

  // Error handling utilities
  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const setError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  // Validation functions
  const validateTitle = (value: string): string | null => {
    if (!value.trim()) return "Blog title is required";
    if (value.length < 5) return "Title must be at least 5 characters long";
    if (value.length > 100) return "Title must be 100 characters or less";
    return null;
  };

  const validateSlug = (value: string): string | null => {
    if (!value.trim()) return "URL slug is required";
    if (value.length < 3) return "Slug must be at least 3 characters long";
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(value)) return "Slug can only contain lowercase letters, numbers, and hyphens";
    return null;
  };

  const validateExcerpt = (value: string): string | null => {
    if (!value.trim()) return "Excerpt is required";
    if (value.length < 20) return "Excerpt must be at least 20 characters long";
    if (value.length > 300) return "Excerpt must be 300 characters or less";
    return null;
  };

  const validateContent = (value: string): string | null => {
    if (!value.trim() || value === '<p><br></p>') return "Blog content is required";
    // Strip HTML tags to get plain text length
    const plainText = value.replace(/<[^>]*>/g, '').trim();
    if (plainText.length < 100) return "Content must be at least 100 characters long";
    return null;
  };

  const validateForm = (): boolean => {
    clearAllErrors();
    let isValid = true;

    const titleError = validateTitle(title);
    if (titleError) {
      setError('title', titleError);
      isValid = false;
    }

    const slugError = validateSlug(slug);
    if (slugError) {
      setError('slug', slugError);
      isValid = false;
    }

    const excerptError = validateExcerpt(excerpt);
    if (excerptError) {
      setError('excerpt', excerptError);
      isValid = false;
    }

    const contentError = validateContent(content);
    if (contentError) {
      setError('content', contentError);
      isValid = false;
    }

    if (!featuredImageId) {
      setError('featuredImage', 'Please upload a featured image');
      isValid = false;
    }

    if (selectedTagIds.length === 0) {
      setError('tags', 'Please select at least one tag');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form before submitting.");
      return;
    }

    try {
      // Prepare JSON payload with image ID and tag IDs
      const blogData = {
        title,
        slug,
        excerpt,
        content,
        meta_title: metaTitle || undefined,
        meta_description: metaDescription || undefined,
        featured_image: featuredImageId, // Use stored image ID
        tags: selectedTagIds, // Send tag IDs, not names
        is_published: published,
      };

      console.log("Blog data (JSON):", blogData);

      // Submit blog data as JSON
      await addBlog.mutateAsync(blogData);

      // Clear draft after successful submission
      clearDraft();

      toast.success("Blog post created successfully!");
      router.push("/dashboard/blogs");
    } catch (error: any) {
      console.error("Error creating blog post:", error.response?.data);
      toast.error(
        "Failed to create blog post: " +
        (error.response?.data?.detail || error.message || "Unknown error")
      );
    }
  };

  // Error display component
  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {message}
      </p>
    );
  };

  return (
    <div className="w-full mx-auto p-4 max-w-4xl">
      <div className="flex md:flex-row flex-col justify-between items-center mb-6 gap-3">
        <h1 className="text-3xl font-semibold">Create New Blog</h1>
        <div className="flex items-center gap-4">
          {/* Auto-save status */}
          <div className="flex items-center gap-2">
            <Switch
              checked={autoSaveEnabled}
              onCheckedChange={setAutoSaveEnabled}
              className="data-[state=checked]:bg-green-500"
            />
            <Label className="text-sm">Auto-save</Label>
          </div>

          {/* Draft status */}
          {draftExists && lastDraftSave && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Save className="h-3 w-3" />
              Draft saved {lastDraftSave.toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </div>

      {/* Draft Recovery Dialog */}
      <AlertDialog open={showDraftRecovery} onOpenChange={setShowDraftRecovery}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Draft Found
            </AlertDialogTitle>
            <AlertDialogDescription>
              We found a saved draft from {lastDraftSave?.toLocaleString()}.
              Would you like to restore it or start fresh?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDraftRecovery(false)}>
              Start Fresh
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={loadDraft}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Restore Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Draft Management Controls */}
      {draftExists && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Draft available from {lastDraftSave?.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadDraft}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Restore
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => saveDraft()}
                  className="text-green-600 border-green-300 hover:bg-green-100"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Now
                </Button>
                <AlertDialog>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Draft</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to clear the saved draft? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearDraft}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Clear Draft
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="mb-2 block">
                  Blog Title *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    handleTitleChange(e.target.value);
                    if (errors.title) clearError('title');
                  }}
                  onBlur={() => {
                    const error = validateTitle(title);
                    if (error) setError('title', error);
                  }}
                  placeholder="Enter blog post title"
                  required
                  maxLength={100}
                  className={errors.title ? 'border-red-500' : ''}
                />
                <ErrorMessage message={errors.title} />
              </div>

              {/* Slug */}
              <div>
                <Label htmlFor="slug" className="mb-2 block">
                  URL Slug *
                </Label>
                <div className="relative">
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(generateSlug(e.target.value));
                      if (errors.slug) clearError('slug');
                      setSlugCheckMessage("");
                      setSlugAvailable(null);
                    }}
                    onBlur={() => {
                      const error = validateSlug(slug);
                      if (error) setError('slug', error);
                    }}
                    placeholder="url-friendly-slug"
                    required
                    className={errors.slug ? 'border-red-500' : ''}
                  />
                  {isCheckingSlug && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This will be used in the URL. Only letters, numbers, and hyphens allowed.
                </p>
                {slugCheckMessage && (
                  <div className={`flex items-center gap-1 mt-2 text-sm ${slugAvailable ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {slugAvailable ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span>{slugCheckMessage}</span>
                  </div>
                )}
                <ErrorMessage message={errors.slug} />
              </div>

              {/* Excerpt */}
              <div>
                <Label htmlFor="excerpt" className="mb-2 block">
                  Excerpt *
                </Label>
                <Input
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => {
                    setExcerpt(e.target.value);
                    if (errors.excerpt) clearError('excerpt');
                  }}
                  onBlur={() => {
                    const error = validateExcerpt(excerpt);
                    if (error) setError('excerpt', error);
                  }}
                  placeholder="Brief summary of the blog post"
                  required
                  maxLength={300}
                  className={errors.excerpt ? 'border-red-500' : ''}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {excerpt.length}/300 characters
                </p>
                <ErrorMessage message={errors.excerpt} />
              </div>

              {/* Meta Title */}
              <div>
                <Label htmlFor="metaTitle" className="mb-2 block">
                  Meta Title (SEO)
                </Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO meta title (optional)"
                  maxLength={100}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {metaTitle.length}/100 characters
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <Label htmlFor="metaDescription" className="mb-2 block">
                  Meta Description (SEO)
                </Label>
                <Input
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="SEO meta description (optional)"
                  maxLength={160}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {metaDescription.length}/160 characters
                </p>
              </div>

              {/* Content Editor */}
              <div>
                <Label htmlFor="content" className="mb-2 block">
                  Content *
                </Label>
                <div className={`${errors.content ? 'border border-red-500 rounded-md' : ''}`}>
                  <CustomEditor
                    value={content}
                    onChange={(value) => {
                      setContent(value);
                      if (errors.content) clearError('content');
                    }}
                  />
                </div>
                <ErrorMessage message={errors.content} />
              </div>

              {/* Featured Image */}
              <div>
                <Label htmlFor="featuredImage" className="mb-2 block">
                  Featured Image *
                </Label>

                {/* Image Upload Options */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <label className="cursor-pointer">
                    <Input
                      id="featuredImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handleFeaturedImageChange(e);
                        setSelectedFromGallery(false);
                        if (errors.featuredImage) clearError('featuredImage');
                      }}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingImage}
                      asChild
                    >
                      <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload from Computer
                      </span>
                    </Button>
                  </label>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMediaGallery(true)}
                    disabled={uploadingImage}
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Select from Gallery
                  </Button>
                </div>

                {uploadingImage && (
                  <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Uploading image...
                  </p>
                )}
                <ErrorMessage message={errors.featuredImage} />

                {featuredImagePreview && (
                  <div className="mt-3 space-y-2">
                    <div className="relative inline-block">
                      <img
                        src={featuredImagePreview}
                        alt="Featured Image Preview"
                        className="h-40 w-auto rounded border object-cover"
                      />
                      {selectedFromGallery && (
                        <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs text-center py-1 rounded-b">
                          Selected from Gallery
                        </div>
                      )}
                    </div>

                    {/* Show alt text input only for file uploads (not gallery selections) */}
                    {!selectedFromGallery && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="featuredImageAlt">Image Alt Text *</Label>
                          <Input
                            id="featuredImageAlt"
                            value={featuredImageAltText}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 255) {
                                setFeaturedImageAltText(value);
                              }
                            }}
                            placeholder="Alt text for featured image"
                            maxLength={255}
                            className="w-full"
                            disabled={uploadingImage || !!featuredImageId}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {255 - featuredImageAltText.length} characters remaining
                          </p>
                        </div>

                        {/* Upload Button */}
                        {!featuredImageId ? (
                          <Button
                            type="button"
                            onClick={uploadFeaturedImage}
                            disabled={!featuredImageAltText.trim() || uploadingImage}
                            size="sm"
                            className="w-full"
                          >
                            {uploadingImage ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              "Upload Image"
                            )}
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Image uploaded successfully!
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show success message for gallery selections */}
                    {selectedFromGallery && featuredImageId && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Image selected from gallery (Alt: {featuredImageAltText || 'No alt text'})
                      </div>
                    )}
                  </div>
                )}

                {/* Media Gallery Modal */}
                <MediaGalleryModal
                  open={showMediaGallery}
                  onOpenChange={setShowMediaGallery}
                  onSelect={(media: MediaItem[]) => {
                    if (media.length > 0) {
                      const selected = media[0];
                      setFeaturedImagePreview(selected.image);
                      setFeaturedImageId(selected.id);
                      setFeaturedImageAltText(selected.alt_text || '');
                      setFeaturedImageFile(null);
                      setSelectedFromGallery(true);
                      if (errors.featuredImage) clearError('featuredImage');
                      toast.success('Image selected from gallery!');
                    }
                  }}
                  maxSelection={1}
                  minSelection={1}
                  title="Select Featured Image"
                />
              </div>

              {/* Publish Switch */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                  className="data-[state=checked]:bg-teal-500"
                />
                <Label htmlFor="published">Publish</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags *</CardTitle>
          </CardHeader>
          <CardContent>
            {getTags.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading tags...</div>
            ) : getTags.isError ? (
              <div className="text-sm text-red-500">Failed to load tags</div>
            ) : Array.isArray(tagsData) && tagsData.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {tagsData.map((tag: Tag) => (
                    <div
                      key={tag.id}
                      className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${selectedTagIds.includes(tag.id)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      onClick={() => {
                        handleTagChange(tag.id, !selectedTagIds.includes(tag.id));
                        if (errors.tags) clearError('tags');
                      }}
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
                <ErrorMessage message={errors.tags} />
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No tags available</div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col items-start gap-4">
          <Button
            variant="blue"
            type="submit"
            disabled={addBlog.isPending || uploadingImage}
            size="lg"
            className="w-fit"
          >
            {uploadingImage ? "Uploading Image..." : addBlog.isPending ? "Creating Blog..." : "Create Blog Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
