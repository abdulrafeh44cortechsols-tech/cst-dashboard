"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { blogService } from "@/services/blogs";
import { useBlogs } from "@/hooks/useBlogs";
import { useTags } from "@/hooks/useTags";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Loader2, Upload, ImageIcon, CheckCircle2, XCircle } from "lucide-react";
import { MediaGalleryModal } from "@/components/media/MediaGalleryModal";
import type { MediaItem } from "@/services/media";
import { Tag } from "@/types/types";
import QuillEditor from "@/components/blog/QuillEditor";
import Link from "next/link";

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = params?.slug as string | undefined;
  const { editBlog } = useBlogs(1, 10, false);
  const { getTags } = useTags();

  // Fetch existing blog data
  const { data: existingBlog, isLoading: loadingBlog, isError } = useQuery({
    queryKey: ["blog", "slug", slugParam],
    queryFn: async () => {
      if (!slugParam) throw new Error("Missing blog slug");
      // Check if slugParam is numeric (ID)
      if (/^\d+$/.test(slugParam)) {
        return blogService.getBlog(slugParam);
      }
      return blogService.getBlogBySlug(slugParam);
    },
    enabled: !!slugParam,
  });

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
  const [originalSlug, setOriginalSlug] = useState<string>("");
  const [slugCheckMessage, setSlugCheckMessage] = useState<string>("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // File uploads - only featured image
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [featuredImageAltText, setFeaturedImageAltText] = useState<string>("");
  const [featuredImageId, setFeaturedImageId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [selectedFromGallery, setSelectedFromGallery] = useState(false);

  // Get tags data safely from new API structure
  const tagsData = getTags.data?.results || [];

  // Populate form when blog data is loaded
  useEffect(() => {
    if (existingBlog) {
      // If we loaded by ID, update URL to use slug
      if (slugParam && /^\d+$/.test(slugParam) && existingBlog.slug) {
        window.history.replaceState(null, "", `/dashboard/blogs/${existingBlog.slug}/edit`);
      }

      setTitle(existingBlog.title || "");
      setSlug(existingBlog.slug || "");
      setOriginalSlug(existingBlog.slug || ""); // Store original slug
      setExcerpt(existingBlog.excerpt || "");
      setContent(existingBlog.content || "");
      setMetaTitle(existingBlog.meta_title || "");
      setMetaDescription(existingBlog.meta_description || "");
      setPublished(existingBlog.is_published || false);

      // Set featured image
      if (existingBlog.featured_image) {
        setFeaturedImagePreview(existingBlog.featured_image.image);
        setFeaturedImageAltText(existingBlog.featured_image.alt_text || "");
        setFeaturedImageId(existingBlog.featured_image.id);
      }

      // Set tags - convert tag names to IDs
      if (existingBlog.tags && Array.isArray(existingBlog.tags) && tagsData.length > 0) {
        const tagIds = existingBlog.tags
          .map((tagName: string) => {
            const tag = tagsData.find((t: Tag) => t.name === tagName);
            return tag?.id;
          })
          .filter((id): id is number => id !== undefined);
        setSelectedTagIds(tagIds);
      }
    }
  }, [existingBlog, tagsData, slugParam]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Debounced slug validation (only check if slug changed from original)
  useEffect(() => {
    // Don't check if slug is the same as original or too short
    if (!slug || slug.length < 3 || slug === originalSlug) {
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
  }, [slug, originalSlug]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (errors.title) clearError('title');
    // Don't auto-generate slug when editing
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
      setImageChanged(true);

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
    if (!value.trim() || value === '<p><br></p>' || value === '<p></p>') return "Blog content is required";
    if (value.length < 100) return "Content must be at least 100 characters long";
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

    if (!existingBlog?.id) {
      toast.error("Blog ID not found");
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

      console.log("Update blog data (JSON):", blogData);

      // Submit blog data as JSON
      await editBlog.mutateAsync({ id: existingBlog.id, data: blogData });

      toast.success("Blog post updated successfully!");
      router.push("/dashboard/blogs");
    } catch (error: any) {
      console.error("Error updating blog post:", error.response?.data);
      toast.error(
        "Failed to update blog post: " +
        (error.response?.data?.detail || error.message || "Unknown error")
      );
    }
  };

  // Error message component
  const ErrorMessage = ({ message }: { message: string }) => (
    <p className="text-sm text-red-500 mt-1">{message}</p>
  );

  if (loadingBlog) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg md:text-2xl">Edit Blog</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading blog...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !existingBlog) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg md:text-2xl">Edit Blog</h1>
          <Button asChild variant="blue">
            <Link href="/dashboard/blogs">All Blogs</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-red-500">
              Failed to load blog. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Edit Blog</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          <Button asChild variant="blue">
            <Link href="/dashboard/blogs">All Blogs</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Blog Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>

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
                  }}
                  placeholder="Enter your blog title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <ErrorMessage message={errors.title} />}
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
                    placeholder="your-blog-url-slug"
                    className={errors.slug ? 'border-red-500' : ''}
                  />
                  {isCheckingSlug && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lowercase letters, numbers, and hyphens only
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
                {errors.slug && <ErrorMessage message={errors.slug} />}
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
                  placeholder="Brief summary of your blog (20-300 characters)"
                  maxLength={300}
                  className={errors.excerpt ? 'border-red-500' : ''}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {300 - excerpt.length} characters remaining
                </p>
                {errors.excerpt && <ErrorMessage message={errors.excerpt} />}
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
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {60 - metaTitle.length} characters remaining
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
                <p className="text-xs text-muted-foreground mt-1">
                  {160 - metaDescription.length} characters remaining
                </p>
              </div>
            </div>

            {/* Content */}
            <div>
              <Label className="mb-2 block">
                Blog Content *
              </Label>
              <div className={errors.content ? 'border-2 border-red-500 rounded-md' : ''}>
                <QuillEditor
                  value={content}
                  onChange={(value) => {
                    setContent(value);
                    if (errors.content) clearError('content');
                  }}
                />
              </div>
              {errors.content && <ErrorMessage message={errors.content} />}
            </div>

            {/* Featured Image */}
            <div>
              <Label htmlFor="featuredImage" className="mb-2 block">
                Featured Image *
              </Label>
              <div className="space-y-3">
                {/* Image Upload Options */}
                <div className="flex flex-wrap gap-2">
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

                {errors.featuredImage && <ErrorMessage message={errors.featuredImage} />}

                {/* Image Preview */}
                {featuredImagePreview && (
                  <div className="relative w-full h-[350px] border rounded-md overflow-hidden">
                    <img
                      src={featuredImagePreview}
                      alt="Featured preview"
                      className="w-full h-full object-cover"
                    />
                    {selectedFromGallery && (
                      <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-sm text-center py-1">
                        Selected from Gallery
                      </div>
                    )}
                  </div>
                )}

                {/* Alt Text and Upload - only for file uploads */}
                {featuredImagePreview && !selectedFromGallery && (
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
                        disabled={uploadingImage || (!!featuredImageId && !imageChanged)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {255 - featuredImageAltText.length} characters remaining
                      </p>
                    </div>

                    {/* Upload Button - only show if image changed */}
                    {imageChanged && !featuredImageId && featuredImageFile ? (
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
                    ) : featuredImageId ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {imageChanged ? "New image uploaded successfully!" : "Image already uploaded"}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Success message for gallery selections */}
                {selectedFromGallery && featuredImageId && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Image selected from gallery (Alt: {featuredImageAltText || 'No alt text'})
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
                      setImageChanged(true);
                      if (errors.featuredImage) clearError('featuredImage');
                      toast.success('Image selected from gallery!');
                    }
                  }}
                  maxSelection={1}
                  minSelection={1}
                  title="Select Featured Image"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label className="mb-2 block">Tags *</Label>
              {errors.tags && <ErrorMessage message={errors.tags} />}
              <div className="flex flex-wrap gap-2 mt-2">
                {tagsData.map((tag: Tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1 text-sm"
                    onClick={() => {
                      handleTagChange(tag.id, !selectedTagIds.includes(tag.id));
                      if (errors.tags) clearError('tags');
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              {tagsData.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No tags available. Please create tags first.
                </p>
              )}
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="published" className="cursor-pointer">
                {published ? "Published" : "Draft"}
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              variant="blue"
              type="submit"
              disabled={editBlog.isPending || uploadingImage}
              size="lg"
              className="w-fit"
            >
              {uploadingImage ? "Uploading Image..." : editBlog.isPending ? "Updating Blog..." : "Update Blog Post"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
