"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBlogs } from "@/hooks/useBlogs";
import { useTags } from "@/hooks/useTags";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";
import { Save, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { Tag } from "@/types/types";
import { getDefaultBlogSectionsData } from "@/data/exampleBlogData";

export default function AddBlogPage() {
  const router = useRouter();
  const { addBlog } = useBlogs(1, 10);
  const { getTags } = useTags();

  // Basic blog fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Error handling state
  const [errors, setErrors] = useState<{
    title?: string;
    slug?: string;
    content?: string;
    metaTitle?: string;
    metaDescription?: string;
    tags?: string;
    images?: string;
    heroSection?: {
      title?: string;
      description?: string;
      summary?: string;
      image?: string;
    };
    quoteSection?: {
      summary?: string;
      quotes?: string;
    };
    infoSection?: {
      title?: string;
      description?: string;
      summary?: string;
      summary2?: string;
      image?: string;
    };
    captcha?: string;
    general?: string;
  }>({});

  // reCAPTCHA verification state
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

  // File uploads
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);

  // Section data
  const [sectionsData, setSectionsData] = useState(
    getDefaultBlogSectionsData()
  );

  // Draft management state
  const [draftExists, setDraftExists] = useState(false);
  const [lastDraftSave, setLastDraftSave] = useState<Date | null>(null);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const DRAFT_KEY = "blog_draft_data";
  const DRAFT_SAVE_INTERVAL = 30000; // 30 seconds

  // Get tags data safely
  const tagsData = getTags.data?.data || [];

  // Draft management functions
  const saveDraft = useCallback(() => {
    if (!autoSaveEnabled) return;

    // Create a clean copy of sectionsData without file objects
    const cleanSectionsData = {
      ...sectionsData,
      hero_section: sectionsData.hero_section
        ? {
            ...sectionsData.hero_section,
            image: undefined, // Remove file object
          }
        : undefined,
      info_section: sectionsData.info_section
        ? {
            ...sectionsData.info_section,
            image: undefined, // Remove file object
          }
        : undefined,
    };

    const draftData = {
      title,
      slug,
      content,
      published,
      metaTitle,
      metaDescription,
      selectedTagIds,
      sectionsData: cleanSectionsData,
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
    content,
    published,
    metaTitle,
    metaDescription,
    selectedTagIds,
    sectionsData,
    autoSaveEnabled,
  ]);

  const loadDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        setTitle(draftData.title || "");
        setSlug(draftData.slug || "");
        setContent(draftData.content || "");
        setPublished(draftData.published || false);
        setMetaTitle(draftData.metaTitle || "");
        setMetaDescription(draftData.metaDescription || "");
        setSelectedTagIds(draftData.selectedTagIds || []);
        setSectionsData(draftData.sectionsData || getDefaultBlogSectionsData());
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
      // Only save if there's actual content
      if (title || content || metaTitle || metaDescription) {
        saveDraft();
      }
    }, DRAFT_SAVE_INTERVAL);

    return () => clearInterval(autoSaveInterval);
  }, [saveDraft, title, content, metaTitle, metaDescription, autoSaveEnabled]);

  // Check for existing draft on component mount
  useEffect(() => {
    checkForExistingDraft();
  }, [checkForExistingDraft]);

  // Save draft when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (title || content || metaTitle || metaDescription) {
        saveDraft();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveDraft, title, content, metaTitle, metaDescription]);

  // Utility function to generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim();
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      // Only auto-generate if slug is empty or was auto-generated before
      setSlug(generateSlug(value));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
      setPreviews(files.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleOgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOgImageFile(file);
      setOgImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTagChange = (tagId: number, checked: boolean) => {
    if (checked) {
      setSelectedTagIds((prev) => [...prev, tagId]);
    } else {
      setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
    }
  };

  const updateSection = (sectionKey: string, field: string, value: any) => {
    setSectionsData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  // Error handling utilities
  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      if (field.includes('.')) {
        const [section, subField] = field.split('.');
        if (newErrors[section as keyof typeof newErrors]) {
          delete (newErrors[section as keyof typeof newErrors] as any)[subField];
          if (Object.keys(newErrors[section as keyof typeof newErrors] as any).length === 0) {
            delete newErrors[section as keyof typeof newErrors];
          }
        }
      } else {
        delete newErrors[field as keyof typeof newErrors];
      }
      return newErrors;
    });
  };

  const setError = (field: string, message: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      if (field.includes('.')) {
        const [section, subField] = field.split('.');
        if (!newErrors[section as keyof typeof newErrors]) {
          (newErrors as any)[section] = {};
        }
        ((newErrors as any)[section] as any)[subField] = message;
      } else {
        (newErrors as any)[field] = message;
      }
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  // Validation functions
  const validateTitle = (value: string): string | null => {
    if (!value.trim()) return "Blog title is required";
    if (value.length < 5) return "Title must be at least 5 characters long";
    if (value.length > 40) return "Title must be 40 characters or less";
    return null;
  };

  const validateSlug = (value: string): string | null => {
    if (!value.trim()) return "URL slug is required";
    if (value.length < 3) return "Slug must be at least 3 characters long";
    if (value.length > 40) return "Slug must be 40 characters or less";
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(value)) return "Slug can only contain lowercase letters, numbers, and hyphens";
    return null;
  };

  const validateContent = (value: string): string | null => {
    if (!value.trim()) return "Blog content is required";
    if (value.length < 100) return "Content must be at least 100 characters long";
    return null;
  };

  const validateMetaTitle = (value: string): string | null => {
    if (!value.trim()) return "Meta title is required";
    if (value.length < 5) return "Meta title must be at least 5 characters long";
    if (value.length > 40) return "Meta title must be 40 characters or less";
    return null;
  };

  const validateMetaDescription = (value: string): string | null => {
    if (!value.trim()) return "Meta description is required";
    if (value.length < 50) return "Meta description must be at least 50 characters long";
    if (value.length > 300) return "Meta description must be 300 characters or less";
    return null;
  };

  const validateHeroSection = (): { [key: string]: string } => {
    const heroErrors: { [key: string]: string } = {};
    const hero = sectionsData.hero_section;

    // Title is required for hero section
    if (!hero.title || hero.title.trim() === "") {
      heroErrors.title = "Hero title is required";
    } else if (hero.title.length > 40) {
      heroErrors.title = "Hero title must be 40 characters or less";
    }

    // Description is required for hero section
    if (!hero.description || hero.description.trim() === "") {
      heroErrors.description = "Hero description is required";
    } else if (hero.description.length < 100) {
      heroErrors.description = "Hero description must be at least 100 characters long";
    } else if (hero.description.length > 1000) {
      heroErrors.description = "Hero description must be 1000 characters or less";
    }

    // Summary is required for hero section
    if (!hero.summary || hero.summary.trim() === "") {
      heroErrors.summary = "Hero summary is required";
    } else if (hero.summary.length < 100) {
      heroErrors.summary = "Hero summary must be at least 100 characters long";
    } else if (hero.summary.length > 400) {
      heroErrors.summary = "Hero summary must be 400 characters or less";
    }

    return heroErrors;
  };

  const validateQuoteSection = (): { [key: string]: string } => {
    const quoteErrors: { [key: string]: string } = {};
    const quote = sectionsData.quote_section;

    // Summary is required for quote section
    if (!quote.summary || quote.summary.trim() === "") {
      quoteErrors.summary = "Quote section summary is required";
    } else if (quote.summary.length < 100) {
      quoteErrors.summary = "Quote section summary must be at least 100 characters long";
    } else if (quote.summary.length > 400) {
      quoteErrors.summary = "Quote section summary must be 400 characters or less";
    }

    // At least one quote is required
    if (!quote.quotes || quote.quotes.length === 0) {
      quoteErrors.quotes = "At least one quote is required in the quote section";
    } else {
      // Validate each quote
      quote.quotes.forEach((quoteItem, index) => {
        if (!quoteItem.title || quoteItem.title.trim() === "") {
          quoteErrors.quotes = `Quote ${index + 1}: Title is required`;
        } else if (!quoteItem.description || quoteItem.description.trim() === "") {
          quoteErrors.quotes = `Quote ${index + 1}: Description is required`;
        } else if (!quoteItem.quote || quoteItem.quote.trim() === "") {
          quoteErrors.quotes = `Quote ${index + 1}: Quote text is required`;
        } else if (!quoteItem.quoteusername || quoteItem.quoteusername.trim() === "") {
          quoteErrors.quotes = `Quote ${index + 1}: Author name is required`;
        }
      });
    }

    return quoteErrors;
  };

  const validateInfoSection = (): { [key: string]: string } => {
    const infoErrors: { [key: string]: string } = {};
    const info = sectionsData.info_section;

    // Title is required for info section
    if (!info.title || info.title.trim() === "") {
      infoErrors.title = "Info title is required";
    } else if (info.title.length > 40) {
      infoErrors.title = "Info title must be 40 characters or less";
    }

    // Description is required for info section
    if (!info.description || info.description.trim() === "") {
      infoErrors.description = "Info description is required";
    } else if (info.description.length < 100) {
      infoErrors.description = "Info description must be at least 100 characters long";
    } else if (info.description.length > 1000) {
      infoErrors.description = "Info description must be 1000 characters or less";
    }

    // Summary is required for info section
    if (!info.summary || info.summary.trim() === "") {
      infoErrors.summary = "Info summary is required";
    } else if (info.summary.length < 100) {
      infoErrors.summary = "Info summary must be at least 100 characters long";
    } else if (info.summary.length > 400) {
      infoErrors.summary = "Info summary must be 400 characters or less";
    }

    // Summary 2 is required for info section
    if (!info.summary_2 || info.summary_2.trim() === "") {
      infoErrors.summary2 = "Info summary 2 is required";
    } else if (info.summary_2.length < 100) {
      infoErrors.summary2 = "Info summary 2 must be at least 100 characters long";
    } else if (info.summary_2.length > 400) {
      infoErrors.summary2 = "Info summary 2 must be 400 characters or less";
    }

    return infoErrors;
  };

  const validateForm = (): boolean => {
    clearAllErrors();
    let isValid = true;

    // Validate basic fields
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

    const contentError = validateContent(content);
    if (contentError) {
      setError('content', contentError);
      isValid = false;
    }

    const metaTitleError = validateMetaTitle(metaTitle);
    if (metaTitleError) {
      setError('metaTitle', metaTitleError);
      isValid = false;
    }

    const metaDescError = validateMetaDescription(metaDescription);
    if (metaDescError) {
      setError('metaDescription', metaDescError);
      isValid = false;
    }

    // Validate images
    if (imageFiles.length === 0) {
      setError('images', 'Please upload at least one image');
      isValid = false;
    }

    // Validate sections
    const heroErrors = validateHeroSection();
    Object.keys(heroErrors).forEach(key => {
      setError(`heroSection.${key}`, heroErrors[key]);
      isValid = false;
    });

    const quoteErrors = validateQuoteSection();
    Object.keys(quoteErrors).forEach(key => {
      setError(`quoteSection.${key}`, quoteErrors[key]);
      isValid = false;
    });

    const infoErrors = validateInfoSection();
    Object.keys(infoErrors).forEach(key => {
      setError(`infoSection.${key}`, infoErrors[key]);
      isValid = false;
    });

    // Validate reCAPTCHA
    if (!captchaVerified || !captchaValue) {
      setError('captcha', 'Please complete the reCAPTCHA verification');
      isValid = false;
    }

    return isValid;
  };

  function onCaptchaChange(value: string | null) {
    console.log("Captcha value:", value);
    setCaptchaValue(value);
    setCaptchaVerified(!!value); // Set to true if value exists, false otherwise
    // Clear captcha error when user completes it
    if (value) {
      clearError('captcha');
    }
  }

  const updateQuote = (index: number, field: string, value: string) => {
    setSectionsData((prev) => ({
      ...prev,
      quote_section: {
        ...prev.quote_section,
        quotes:
          prev.quote_section?.quotes.map((quote, i) =>
            i === index ? { ...quote, [field]: value } : quote
          ) || [],
      },
    }));
  };

  const addQuote = () => {
    setSectionsData((prev) => ({
      ...prev,
      quote_section: {
        ...prev.quote_section,
        quotes: [
          ...(prev.quote_section?.quotes || []),
          { title: "", description: "", quote: "", quoteusername: "" },
        ],
      },
    }));
  };

  const removeQuote = (index: number) => {
    setSectionsData((prev) => ({
      ...prev,
      quote_section: {
        ...prev.quote_section,
        quotes: prev.quote_section?.quotes.filter((_, i) => i !== index) || [],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use the comprehensive validation function
    if (!validateForm()) {
      toast.error("Please fix the errors in the form before submitting.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("content", content);
      formData.append("published", published.toString());
      formData.append("meta_title", metaTitle);
      formData.append("meta_description", metaDescription);

      // Add reCAPTCHA token to form data
      // formData.append("captcha_token", captchaValue);

      // Add tag_ids as JSON string
      if (selectedTagIds.length > 0) {
        formData.append("tag_ids", JSON.stringify(selectedTagIds));
      }

      // Add image files
      imageFiles.forEach((file) => {
        formData.append("image_files", file);
      });

      // Add OG image if exists
      if (ogImageFile) {
        formData.append("og_image_file", ogImageFile);
      }

      // Add sections data if exists
      if (Object.keys(sectionsData).length > 0) {
        formData.append("sections_data", JSON.stringify(sectionsData));
      }

      // Add individual sections if they exist
      if (sectionsData.hero_section) {
        formData.append(
          "hero_section",
          JSON.stringify(sectionsData.hero_section)
        );
        // Add hero image file if exists
        if (sectionsData.hero_section.image) {
          formData.append("hero_image", sectionsData.hero_section.image);
          formData.append(
            "hero_section_image",
            sectionsData.hero_section.image
          );
        }
        // Add hero image alt text
        if ((sectionsData.hero_section as any).image_alt_text) {
          formData.append("hero_image_alt_text", (sectionsData.hero_section as any).image_alt_text);
        }
      }

      if (sectionsData.quote_section) {
        formData.append(
          "quote_section",
          JSON.stringify(sectionsData.quote_section)
        );
      }

      if (sectionsData.info_section) {
        formData.append(
          "info_section",
          JSON.stringify(sectionsData.info_section)
        );
        // Add info image file if exists
        if (sectionsData.info_section.image) {
          formData.append(
            "info_section_image",
            sectionsData.info_section.image
          );
        }
        // Add info image alt text
        if ((sectionsData.info_section as any).image_alt_text) {
          formData.append("info_image_alt_text", (sectionsData.info_section as any).image_alt_text);
        }
      }

      console.log([...formData.entries()]);

      await addBlog.mutateAsync(formData);

      // Clear draft after successful submission
      clearDraft();

      toast.success("Blog post created successfully!");
      router.push("/dashboard/blogs");
    } catch (error: any) {
      console.error("error creating blog post:", error.response?.data);
      toast.error(
        "Failed to create blog post, " +
          (error.response?.data?.details?.content?.[0] || "Unknown error")
      );
    }
  };

  const renderHeroSection = () => {
    const hero = (sectionsData.hero_section as any) || {
      title: "",
      description: "",
      summary: "",
      image: null,
      image_alt_text: ""
    };
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label>Hero Title - h1</Label>
              <Input
                value={hero.title || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 40) {
                    updateSection("hero_section", "title", value);
                    // Clear error when user starts typing
                    if (errors.heroSection?.title) {
                      clearError('heroSection.title');
                    }
                  }
                }}
                placeholder="Enter hero section title"
                maxLength={40}
                className={errors.heroSection?.title ? 'border-red-500 focus:border-red-500' : ''}
              />
              <div className="flex justify-between items-start mt-1">
                <ErrorMessage message={errors.heroSection?.title} />
                <p className="text-sm text-muted-foreground">
                  {40 - (hero.title?.length || 0)} characters remaining
                </p>
              </div>
            </div>
            <div>
              <Label>Hero Description - p</Label>
              <Textarea
                value={hero.description || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 1000) {
                    updateSection("hero_section", "description", value);
                    // Clear error when user starts typing
                    if (errors.heroSection?.description) {
                      clearError('heroSection.description');
                    }
                  }
                }}
                placeholder="Enter hero section description"
                rows={3}
                maxLength={1000}
                className={errors.heroSection?.description ? 'border-red-500 focus:border-red-500' : ''}
              />
              <div className="flex justify-between items-start mt-1">
                <ErrorMessage message={errors.heroSection?.description} />
                <p className="text-sm text-muted-foreground">
                  {1000 - (hero.description?.length || 0)} characters remaining
                </p>
              </div>
            </div>
            <div>
              <Label>Hero Summary * - p</Label>
              <Textarea
                value={hero.summary || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 400) {
                    updateSection("hero_section", "summary", value);
                    // Clear error when user starts typing
                    if (errors.heroSection?.summary) {
                      clearError('heroSection.summary');
                    }
                  }
                }}
                placeholder="Enter hero section summary (required)"
                maxLength={400}
                rows={3}
                className={errors.heroSection?.summary ? 'border-red-500 focus:border-red-500' : ''}
              />
              <div className="flex justify-between items-start mt-1">
                <ErrorMessage message={errors.heroSection?.summary} />
                <p className="text-sm text-muted-foreground">
                  {400 - (hero.summary?.length || 0)} characters remaining
                </p>
              </div>
            </div>
            <div>
              <Label>Hero Image Alt Text</Label>
              <Input
                value={(hero as any).image_alt_text || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 255) {
                    updateSection("hero_section", "image_alt_text", value);
                   
                  }
                }}
                placeholder="Enter alt text for hero image"
                maxLength={255}
              />
              <div className="flex justify-between items-start mt-1">
                <p className="text-sm text-muted-foreground">
                  {255 - ((hero as any).image_alt_text?.length || 0)} characters remaining
                </p>
              </div>
            </div>
            <div>
              <Label>Hero Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    updateSection("hero_section", "image", e.target.files[0]);
                  }
                }}
              />
              {hero.image &&
                (hero.image as any)?.constructor?.name === "File" && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(hero.image)}
                      alt="Hero Image Preview"
                      className="h-40 w-auto rounded border object-cover"
                    />
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderQuoteSection = () => {
    const quoteSection = sectionsData.quote_section || { quotes: [] };
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">Quote Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Quote Section Summary * - p</Label>
            <Textarea
              value={quoteSection.summary || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 400) {
                  updateSection("quote_section", "summary", value);
                  // Clear error when user starts typing
                  if (errors.quoteSection?.summary) {
                    clearError('quoteSection.summary');
                  }
                }
              }}
              placeholder="Enter quote section summary (required)"
              maxLength={400}
              rows={3}
              className={errors.quoteSection?.summary ? 'border-red-500 focus:border-red-500' : ''}
            />
            <div className="flex justify-between items-start mt-1">
              <ErrorMessage message={errors.quoteSection?.summary} />
              <p className="text-sm text-muted-foreground">
                {400 - (quoteSection.summary?.length || 0)} characters remaining
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Quotes *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuote}
              >
                Add Quote Details
              </Button>
            </div>
            <ErrorMessage message={errors.quoteSection?.quotes} />
            <div className="space-y-4">
              {quoteSection.quotes?.map((quote, index) => (
                <div key={index} className="grid gap-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Quote Title - h2</Label>
                      <Input
                        value={quote.title}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 40) {
                            updateQuote(index, "title", value);
                          }
                        }}
                        placeholder="Quote title"
                        maxLength={40}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {40 - (quote.title?.length || 0)} characters remaining
                      </p>
                    </div>
                    <div>
                      <Label>Quote Description - p</Label>
                      <Textarea
                        value={quote.description}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 1000) {
                            updateQuote(index, "description", value);
                          }
                        }}
                        placeholder="Quote description"
                        maxLength={1000}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {1000 - (quote.description?.length || 0)} characters remaining
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Quote Text - blockquote p</Label>
                    <Textarea
                      value={quote.quote}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 1000) {
                          updateQuote(index, "quote", value);
                        }
                      }}
                      placeholder="Enter the quote"
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {200 - (quote.quote?.length || 0)} characters remaining
                    </p>
                  </div>
                  <div>
                    <Label>Quote Author - footer p</Label>
                    <Input
                      value={quote.quoteusername}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 40) {
                          updateQuote(index, "quoteusername", value);
                        }
                      }}
                      placeholder="Quote author name"
                      maxLength={40}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {40 - (quote.quoteusername?.length || 0)} characters remaining
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeQuote(index)}
                  >
                    Remove Quote
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderInfoSection = () => {
    const info = sectionsData.info_section || {};
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">Info Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label>Info headline* - p</Label>
              <Input
                value={info.title || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 40) {
                    updateSection("info_section", "title", value);
                    // Clear error when user starts typing
                    if (errors.infoSection?.title) {
                      clearError('infoSection.title');
                    }
                  }
                }}
                placeholder="Enter info section title (required)"
                maxLength={40}
                className={errors.infoSection?.title ? 'border-red-500 focus:border-red-500' : ''}
              />
              <div className="flex justify-between items-start mt-1">
                <ErrorMessage message={errors.infoSection?.title} />
                <p className="text-sm text-muted-foreground">
                  {40 - (info.title?.length || 0)} characters remaining
                </p>
              </div>
            </div>
            <div>
              <Label>Info Description * - p</Label>
              <Textarea
                value={info.description || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 1000) {
                    updateSection("info_section", "description", value);
                    // Clear error when user starts typing
                    if (errors.infoSection?.description) {
                      clearError('infoSection.description');
                    }
                  }
                }}
                placeholder="Enter info section description (required)"
                rows={3}
                maxLength={1000}
                className={errors.infoSection?.description ? 'border-red-500 focus:border-red-500' : ''}
              />
              <div className="flex justify-between items-start mt-1">
                <ErrorMessage message={errors.infoSection?.description} />
                <p className="text-sm text-muted-foreground">
                  {1000 - (info.description?.length || 0)} characters remaining
                </p>
              </div>
            </div>
            <div>
              <Label>Info Summary * - p</Label>
              <Textarea
                value={info.summary || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 400) {
                    updateSection("info_section", "summary", value);
                    // Clear error when user starts typing
                    if (errors.infoSection?.summary) {
                      clearError('infoSection.summary');
                    }
                  }
                }}
                placeholder="Enter info section summary (required)"
                maxLength={400}
                rows={3}
                className={errors.infoSection?.summary ? 'border-red-500 focus:border-red-500' : ''}
              />
              <div className="flex justify-between items-start mt-1">
                <ErrorMessage message={errors.infoSection?.summary} />
                <p className="text-sm text-muted-foreground">
                  {400 - (info.summary?.length || 0)} characters remaining
                </p>
              </div>
            </div>
            <div>
              <Label>Info Summary 2 * - p</Label>
              <Textarea
                value={info.summary_2 || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 400) {
                    updateSection("info_section", "summary_2", value);
                    // Clear error when user starts typing
                    if (errors.infoSection?.summary2) {
                      clearError('infoSection.summary2');
                    }
                  }
                }}
                placeholder="Enter additional info summary (required)"
                maxLength={400}
                rows={3}
                className={errors.infoSection?.summary2 ? 'border-red-500 focus:border-red-500' : ''}
              />
              <div className="flex justify-between items-start mt-1">
                <ErrorMessage message={errors.infoSection?.summary2} />
                <p className="text-sm text-muted-foreground">
                  {400 - (info.summary_2?.length || 0)} characters remaining
                </p>
              </div>
            </div>
            <div>
              <Label>Info Banner Image Alt Text</Label>
              <Input
                value={(info as any).image_alt_text || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 255) {
                    updateSection("info_section", "image_alt_text", value);
                    
                  }
                }}
                placeholder="Enter alt text for info banner image"
                maxLength={255}
              />
              <div className="flex justify-between items-start mt-1">
                <p className="text-sm text-muted-foreground">
                  {255 - ((info as any).image_alt_text?.length || 0)} characters remaining
                </p>
              </div>
            </div>
            <div>
              <Label>Info Banner Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    updateSection("info_section", "image", e.target.files[0]);
                  }
                }}
              />
              {info.image &&
                (info.image as any)?.constructor?.name === "File" && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(info.image)}
                      alt="Info Image Preview"
                      className="h-40 w-auto rounded border object-cover"
                    />
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
    <div className="w-full mx-auto p-4 max-w-6xl">
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
          <CardContent>
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
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </AlertDialogTrigger>
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
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title">Blog Title * - h3</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 40) {
                          handleTitleChange(value);
                          // Clear error when user starts typing
                          if (errors.title) {
                            clearError('title');
                          }
                        }
                      }}
                      onBlur={() => {
                        // Validate on blur
                        const error = validateTitle(title);
                        if (error) {
                          setError('title', error);
                        }
                      }}
                      placeholder="Enter blog post title"
                      required
                      maxLength={40}
                      className={errors.title ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    <div className="flex justify-between items-start mt-1">
                      <ErrorMessage message={errors.title} />
                      <p className="text-sm text-muted-foreground">
                        {40 - title.length} characters remaining
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={slug}
                      maxLength={40}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 40) {
                          setSlug(generateSlug(value));
                          // Clear error when user starts typing
                          if (errors.slug) {
                            clearError('slug');
                          }
                        }
                      }}
                      onBlur={() => {
                        // Validate on blur
                        const error = validateSlug(slug);
                        if (error) {
                          setError('slug', error);
                        }
                      }}
                      placeholder="url-friendly-slug"
                      required
                      className={errors.slug ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    <ErrorMessage message={errors.slug} />
                    <p className="text-sm text-muted-foreground mt-1">
                      This will be used in the URL. Only letters, numbers, and
                      hyphens allowed.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {40 - slug.length} characters remaining
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="content">Content * - p</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        // Clear error when user starts typing
                        if (errors.content) {
                          clearError('content');
                        }
                      }}
                      onBlur={() => {
                        // Validate on blur
                        const error = validateContent(content);
                        if (error) {
                          setError('content', error);
                        }
                      }}
                      placeholder="Write your blog post content..."
                      rows={8}
                      required
                      className={errors.content ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    <div className="flex justify-between items-start mt-1">
                      <ErrorMessage message={errors.content} />
                      <p className="text-sm text-muted-foreground">
                        {content.length} characters (minimum 100 required)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="metaTitle">Meta Title *</Label>
                      <Input
                        id="metaTitle"
                        value={metaTitle}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 40) {
                            setMetaTitle(value);
                            // Clear error when user starts typing
                            if (errors.metaTitle) {
                              clearError('metaTitle');
                            }
                          }
                        }}
                        onBlur={() => {
                          // Validate on blur
                          const error = validateMetaTitle(metaTitle);
                          if (error) {
                            setError('metaTitle', error);
                          }
                        }}
                        placeholder="Enter meta title for SEO"
                        required
                        maxLength={40}
                        className={errors.metaTitle ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      <div className="flex justify-between items-start mt-1">
                        <ErrorMessage message={errors.metaTitle} />
                        <p className="text-sm text-muted-foreground">
                          {40 - metaTitle.length} characters remaining
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="metaDescription">
                        Meta Description *
                      </Label>
                      <Textarea
                        id="metaDescription"
                        value={metaDescription}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 300) {
                            setMetaDescription(value);
                            // Clear error when user starts typing
                            if (errors.metaDescription) {
                              clearError('metaDescription');
                            }
                          }
                        }}
                        onBlur={() => {
                          // Validate on blur
                          const error = validateMetaDescription(metaDescription);
                          if (error) {
                            setError('metaDescription', error);
                          }
                        }}
                        placeholder="Enter meta description for SEO"
                        rows={3}
                        required
                        maxLength={300}
                        className={errors.metaDescription ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      <div className="flex justify-between items-start mt-1">
                        <ErrorMessage message={errors.metaDescription} />
                        <p className="text-sm text-muted-foreground">
                          {300 - metaDescription.length} characters remaining
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <Label htmlFor="image">Upload Blog Images *</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          handleImageChange(e);
                          // Clear error when user selects files
                          if (e.target.files && e.target.files.length > 0) {
                            clearError('images');
                          }
                        }}
                        className={errors.images ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      <ErrorMessage message={errors.images} />
                      {previews.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {previews.map((src, idx) => (
                            <img
                              key={idx}
                              src={src}
                              alt={`Preview ${idx + 1}`}
                              className="h-40 w-auto rounded border object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </div>


                    <div className="col-span-1">
                      <Label htmlFor="ogImage">OG Image (Optional)</Label>
                      <Input
                        id="ogImage"
                        type="file"
                        accept="image/*"
                        onChange={handleOgImageChange}
                      />
                      {ogImagePreview && (
                        <div className="mt-2">
                          <img
                            src={ogImagePreview}
                            alt="OG Image Preview"
                            className="h-40 w-auto rounded border object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

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

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                {getTags.isLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading tags...
                  </div>
                ) : getTags.isError ? (
                  <div className="text-sm text-red-500">
                    Failed to load tags
                  </div>
                ) : Array.isArray(tagsData) && tagsData.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tagsData.map((tag: Tag) => (
                      <div
                        key={tag.id}
                        className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                          selectedTagIds.includes(tag.id)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() =>
                          handleTagChange(
                            tag.id,
                            !selectedTagIds.includes(tag.id)
                          )
                        }
                      >
                        {tag.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No tags available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Blog Sections</h2>
              {renderHeroSection()}
              {renderQuoteSection()}
              {renderInfoSection()}
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex flex-col items-start gap-4">
          <div>
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_URL || ""}
              onChange={onCaptchaChange}
            />
            <ErrorMessage message={errors.captcha} />
          </div>
          <Button
            variant={"blue"}
            type="submit"
            disabled={addBlog.isPending || !captchaVerified}
            size="lg"
            className="w-fit"
          >
            {addBlog.isPending ? "Creating Blog..." : "Create Blog Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
