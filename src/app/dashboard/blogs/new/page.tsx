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
  
  // Tab management
  const [activeTab, setActiveTab] = useState("basic");

  // Error handling state
  const [errors, setErrors] = useState<{
    [key: string]: string | { [key: string]: string | { [key: string]: string } | undefined } | undefined;
  }>({});


  // File uploads
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);

  // Alt text for images
  const [imageAltTexts, setImageAltTexts] = useState<string[]>([]);
  const [ogImageAltText, setOgImageAltText] = useState<string>("");

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
      // Initialize alt text array for new images
      setImageAltTexts(new Array(files.length).fill(""));
    }
  };

  const handleOgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOgImageFile(file);
      setOgImagePreview(URL.createObjectURL(file));
      // Reset OG image alt text when new image is selected
      setOgImageAltText("");
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

  // Helper function to get error message for a specific field
  const getErrorMessage = (fieldPath: string): string | undefined => {
    const fieldParts = fieldPath.split('.');
    let current: any = errors;

    for (const part of fieldParts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return current as string;
      }
    }

    return current as string;
  };

  // Validation function for individual quote fields
  const validateQuoteField = (field: string, value: string, maxLength: number): string | null => {
    if (!value.trim()) {
      switch (field) {
        case 'title': return "Quote title is required";
        case 'description': return "Quote description is required";
        case 'quote': return "Quote text is required";
        case 'quoteusername': return "Quote author name is required";
        default: return "This field is required";
      }
    }
    if (value.length > maxLength) {
      switch (field) {
        case 'title':
          return `Quote title must be ${maxLength} characters or less`;
        case 'quoteusername':
          return `Quote author name must be ${maxLength} characters or less`;
        case 'description':
          return `Quote description must be ${maxLength} characters or less`;
        case 'quote':
          return `Quote text must be ${maxLength} characters or less`;
        default:
          return `Must be ${maxLength} characters or less`;
      }
    }
    return null;
  };

  const handleQuoteFieldChange = (index: number, field: string, value: string, maxLength: number) => {
    updateQuote(index, field, value);
    // Real-time validation using the same logic as main validation
    const quote = sectionsData.quote_section;
    if (quote.quotes && quote.quotes[index]) {
      const quoteItem = quote.quotes[index];
      let error: string | null = null;

      // Use the same validation logic as the main validateQuoteSection function
      switch (field) {
        case 'title':
          if (!quoteItem.title || !quoteItem.title.trim()) {
            error = "Quote title is required";
          } else if (quoteItem.title.length > 40) {
            error = "Quote title must be 40 characters or less";
          }
          break;
        case 'description':
          if (!quoteItem.description || !quoteItem.description.trim()) {
            error = "Quote description is required";
          } else if (quoteItem.description.length < 100) {
            error = "Quote description must be at least 100 characters long";
          } else if (quoteItem.description.length > 1000) {
            error = "Quote description must be 1000 characters or less";
          }
          break;
        case 'quote':
          if (!quoteItem.quote || !quoteItem.quote.trim()) {
            error = "Quote text is required";
          } else if (quoteItem.quote.length > 1000) {
            error = "Quote text must be 1000 characters or less";
          }
          break;
        case 'quoteusername':
          if (!quoteItem.quoteusername || !quoteItem.quoteusername.trim()) {
            error = "Quote author name is required";
          } else if (quoteItem.quoteusername.length > 40) {
            error = "Quote author name must be 40 characters or less";
          }
          break;
      }

      // Use the correct field name that matches the UI expectations
      const errorField = field === 'quoteusername' ? 'username' : field;
      const errorKey = `quoteSection.quotes.${index}.${errorField}`;
      if (error) {
        setError(errorKey, error);
      } else {
        clearError(errorKey);
      }
    }
  };

  const handleQuoteFieldBlur = (index: number, field: string, value: string, maxLength: number) => {
    // Additional validation on blur using the same logic as main validation
    const quote = sectionsData.quote_section;
    if (quote.quotes && quote.quotes[index]) {
      const quoteItem = quote.quotes[index];
      let error: string | null = null;

      // Use the same validation logic as the main validateQuoteSection function
      switch (field) {
        case 'title':
          if (!quoteItem.title || !quoteItem.title.trim()) {
            error = "Quote title is required";
          } else if (quoteItem.title.length > 40) {
            error = "Quote title must be 40 characters or less";
          }
          break;
        case 'description':
          if (!quoteItem.description || !quoteItem.description.trim()) {
            error = "Quote description is required";
          } else if (quoteItem.description.length < 100) {
            error = "Quote description must be at least 100 characters long";
          } else if (quoteItem.description.length > 1000) {
            error = "Quote description must be 1000 characters or less";
          }
          break;
        case 'quote':
          if (!quoteItem.quote || !quoteItem.quote.trim()) {
            error = "Quote text is required";
          } else if (quoteItem.quote.length > 1000) {
            error = "Quote text must be 1000 characters or less";
          }
          break;
        case 'quoteusername':
          if (!quoteItem.quoteusername || !quoteItem.quoteusername.trim()) {
            error = "Quote author name is required";
          } else if (quoteItem.quoteusername.length > 40) {
            error = "Quote author name must be 40 characters or less";
          }
          break;
      }

      // Use the correct field name that matches the UI expectations
      const errorField = field === 'quoteusername' ? 'username' : field;
      const errorKey = `quoteSection.quotes.${index}.${errorField}`;
      if (error) {
        setError(errorKey, error);
      } else {
        clearError(errorKey);
      }
    }
  };

  // Error handling utilities
  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      if (field.includes('.')) {
        const parts = field.split('.');
        let current: any = newErrors;

        // Navigate to the parent of the field to delete
        for (let i = 0; i < parts.length - 1; i++) {
          if (current[parts[i]] && typeof current[parts[i]] === 'object') {
            current = current[parts[i]];
          } else {
            return newErrors; // Field doesn't exist, nothing to clear
          }
        }

        // Delete the field
        delete current[parts[parts.length - 1]];

        // Clean up empty parent objects
        let parent: any = newErrors;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (parent[part] && typeof parent[part] === 'object' && Object.keys(parent[part]).length === 0) {
            delete parent[part];
            break;
          }
          parent = parent[part];
        }
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  const setError = (field: string, message: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      if (field.includes('.')) {
        const parts = field.split('.');
        let current: any = newErrors;

        // Navigate/create the nested structure
        for (let i = 0; i < parts.length - 1; i++) {
          // Ensure current level is an object, not a string
          if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }

        // Set the error message
        current[parts[parts.length - 1]] = message;
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
      // Validate each quote - set individual field errors
      quote.quotes.forEach((quoteItem, index) => {
        // Check title
        if (!quoteItem.title || quoteItem.title.trim() === "") {
          quoteErrors[`quotes.${index}.title`] = "Quote title is required";
        } else if (quoteItem.title.length > 40) {
          quoteErrors[`quotes.${index}.title`] = "Quote title must be 40 characters or less";
        }

        // Check description
        if (!quoteItem.description || quoteItem.description.trim() === "") {
          quoteErrors[`quotes.${index}.description`] = "Quote description is required";
        } else if (quoteItem.description.length < 100) {
          quoteErrors[`quotes.${index}.description`] = "Quote description must be at least 100 characters long";
        } else if (quoteItem.description.length > 1000) {
          quoteErrors[`quotes.${index}.description`] = "Quote description must be 1000 characters or less";
        }

        // Check quote text
        if (!quoteItem.quote || quoteItem.quote.trim() === "") {
          quoteErrors[`quotes.${index}.quote`] = "Quote text is required";
        } else if (quoteItem.quote.length > 1000) {
          quoteErrors[`quotes.${index}.quote`] = "Quote text must be 1000 characters or less";
        }

        // Check username
        if (!quoteItem.quoteusername || quoteItem.quoteusername.trim() === "") {
          quoteErrors[`quotes.${index}.username`] = "Quote author name is required";
        } else if (quoteItem.quoteusername.length > 40) {
          quoteErrors[`quotes.${index}.username`] = "Quote author name must be 40 characters or less";
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
    let firstInvalidField = '';

    // Validate basic fields
    const titleError = validateTitle(title);
    if (titleError) {
      setError('title', titleError);
      if (!firstInvalidField) firstInvalidField = 'title';
      isValid = false;
    }

    const slugError = validateSlug(slug);
    if (slugError) {
      setError('slug', slugError);
      if (!firstInvalidField) firstInvalidField = 'slug';
      isValid = false;
    }

    const contentError = validateContent(content);
    if (contentError) {
      setError('content', contentError);
      if (!firstInvalidField) firstInvalidField = 'content';
      isValid = false;
    }

    const metaTitleError = validateMetaTitle(metaTitle);
    if (metaTitleError) {
      setError('metaTitle', metaTitleError);
      if (!firstInvalidField) firstInvalidField = 'metaTitle';
      isValid = false;
    }

    const metaDescError = validateMetaDescription(metaDescription);
    if (metaDescError) {
      setError('metaDescription', metaDescError);
      if (!firstInvalidField) firstInvalidField = 'metaDescription';
      isValid = false;
    }

    // Validate images
    if (imageFiles.length === 0) {
      setError('images', 'Please upload at least one image');
      if (!firstInvalidField) firstInvalidField = 'images';
      isValid = false;
    }

    // Validate sections
    const heroErrors = validateHeroSection();
    if (Object.keys(heroErrors).length > 0) {
      Object.keys(heroErrors).forEach(key => {
        setError(`heroSection.${key}`, heroErrors[key]);
        if (!firstInvalidField) firstInvalidField = `heroSection.${key}`;
        isValid = false;
      });
    }

    const quoteErrors = validateQuoteSection();
    if (Object.keys(quoteErrors).length > 0) {
      Object.keys(quoteErrors).forEach(key => {
        setError(`quoteSection.${key}`, quoteErrors[key]);
        if (!firstInvalidField) firstInvalidField = `quoteSection.${key}`;
        isValid = false;
      });
    }

    const infoErrors = validateInfoSection();
    if (Object.keys(infoErrors).length > 0) {
      Object.keys(infoErrors).forEach(key => {
        setError(`infoSection.${key}`, infoErrors[key]);
        if (!firstInvalidField) firstInvalidField = `infoSection.${key}`;
        isValid = false;
      });
    }


    // Focus first invalid field
    if (!isValid && firstInvalidField) {
      setTimeout(() => {
        // Switch to appropriate tab
        if (firstInvalidField.startsWith('heroSection') || 
            firstInvalidField.startsWith('quoteSection') || 
            firstInvalidField.startsWith('infoSection')) {
          setActiveTab('sections');
        } else {
          setActiveTab('basic');
        }

        // Focus the field
        const fieldElement = document.getElementById(firstInvalidField) || 
                           document.querySelector(`[name="${firstInvalidField}"]`) ||
                           document.querySelector(`input[data-field="${firstInvalidField}"]`);
        
        if (fieldElement) {
          fieldElement.focus();
          fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }

    return isValid;
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


      // Add tag_ids as JSON string
      if (selectedTagIds.length > 0) {
        formData.append("tag_ids", JSON.stringify(selectedTagIds));
      }

      // Add image files
      imageFiles.forEach((file) => {
        formData.append("image_files", file);
      });

      // Add image alt texts
      if (imageAltTexts.length > 0) {
        formData.append("image_alt_text", JSON.stringify(imageAltTexts));
      }

      // Add OG image if exists
      if (ogImageFile) {
        formData.append("og_image_file", ogImageFile);
      }

      // Add OG image alt text
      if (ogImageAltText) {
        formData.append("og_image_alt_text", ogImageAltText);
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            <div>
              <Label className="mb-2 block">Hero Title - h1</Label>
              <Input
                data-field="heroSection.title"
                value={hero.title || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  updateSection("hero_section", "title", value);
                  // Real-time validation and error clearing
                  const heroErrors = validateHeroSection();
                  if (heroErrors.title) {
                    setError('heroSection.title', heroErrors.title);
                  } else {
                    clearError('heroSection.title');
                  }
                }}
                onBlur={() => {
                  // Additional validation on blur if needed
                  const heroErrors = validateHeroSection();
                  if (heroErrors.title) {
                    setError('heroSection.title', heroErrors.title);
                  }
                }}
                placeholder="Enter hero section title"
                maxLength={40}
                className={`${getErrorMessage('heroSection.title') ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              <div className="flex justify-between items-start mt-2">
                <p className={`text-sm ${getErrorMessage('heroSection.title') ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {getErrorMessage('heroSection.title') || `${40 - (hero.title?.length || 0)} characters remaining`}
                </p>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Hero Description - p</Label>
              <Textarea
                value={hero.description || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  updateSection("hero_section", "description", value);
                  // Real-time validation and error clearing
                  const heroErrors = validateHeroSection();
                  if (heroErrors.description) {
                    setError('heroSection.description', heroErrors.description);
                  } else {
                    clearError('heroSection.description');
                  }
                }}
                onBlur={() => {
                  // Additional validation on blur if needed
                  const heroErrors = validateHeroSection();
                  if (heroErrors.description) {
                    setError('heroSection.description', heroErrors.description);
                  }
                }}
                placeholder="Enter hero section description"
                rows={3}
                maxLength={1000}
                className={`${getErrorMessage('heroSection.description') ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              <div className="flex justify-between items-start mt-2">
                <p className={`text-sm ${getErrorMessage('heroSection.description') ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {getErrorMessage('heroSection.description') || `${1000 - (hero.description?.length || 0)} characters remaining`}
                </p>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Hero Summary * - p</Label>
              <Textarea
                value={hero.summary || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  updateSection("hero_section", "summary", value);
                  // Real-time validation and error clearing
                  const heroErrors = validateHeroSection();
                  if (heroErrors.summary) {
                    setError('heroSection.summary', heroErrors.summary);
                  } else {
                    clearError('heroSection.summary');
                  }
                }}
                onBlur={() => {
                  // Additional validation on blur if needed
                  const heroErrors = validateHeroSection();
                  if (heroErrors.summary) {
                    setError('heroSection.summary', heroErrors.summary);
                  }
                }}
                placeholder="Enter hero section summary (required)"
                maxLength={400}
                rows={3}
                className={`${getErrorMessage('heroSection.summary') ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              <div className="flex justify-between items-start mt-2">
                <p className={`text-sm ${getErrorMessage('heroSection.summary') ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {getErrorMessage('heroSection.summary') || `${400 - (hero.summary?.length || 0)} characters remaining`}
                </p>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Hero Image Alt Text</Label>
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
              <div className="flex justify-between items-start mt-2">
                <p className="text-sm text-muted-foreground">
                  {255 - ((hero as any).image_alt_text?.length || 0)} characters remaining
                </p>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Hero Image</Label>
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
                  <div className="mt-3 space-y-2">
                    <img
                      src={URL.createObjectURL(hero.image)}
                      alt="Hero Image Preview"
                      className="h-40 w-auto rounded border object-cover"
                    />
                    <div>
                      <Label htmlFor="heroImageAlt">Hero Image Alt Text</Label>
                      <Input
                        id="heroImageAlt"
                        value={(hero as any).image_alt_text || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 255) {
                            updateSection("hero_section", "image_alt_text", value);
                          }
                        }}
                        placeholder="Alt text for hero image"
                        maxLength={255}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {255 - ((hero as any).image_alt_text?.length || 0)} characters remaining
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderQuoteSection = () => {
    const quoteSection = sectionsData.quote_section || { summary: '', quotes: [] };

    // Validation function for individual quote fields
    const validateQuoteField = (field: string, value: string, maxLength: number): string | null => {
      if (!value.trim()) {
        switch (field) {
          case 'title': return "Quote title is required";
          case 'description': return "Quote description is required";
          case 'quote': return "Quote text is required";
          case 'quoteusername': return "Quote author name is required";
          default: return "This field is required";
        }
      }
      if (value.length > maxLength) {
        switch (field) {
          case 'title':
          case 'quoteusername':
            return `Quote ${field} must be ${maxLength} characters or less`;
          case 'description':
          case 'quote':
            return `Quote ${field} must be ${maxLength} characters or less`;
          default:
            return `Must be ${maxLength} characters or less`;
        }
      }
      return null;
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Quote Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-4 block">Quote Section Summary * - p</Label>
            <Textarea
              data-field="quoteSection.summary"
              value={quoteSection.summary || ""}
              onChange={(e) => {
                const value = e.target.value;
                updateSection("quote_section", "summary", value);
                // Real-time validation and error clearing
                const quoteErrors = validateQuoteSection();
                if (quoteErrors.summary) {
                  setError('quoteSection.summary', quoteErrors.summary);
                } else {
                  clearError('quoteSection.summary');
                }
              }}
              onBlur={() => {
                // Additional validation on blur if needed
                const quoteErrors = validateQuoteSection();
                if (quoteErrors.summary) {
                  setError('quoteSection.summary', quoteErrors.summary);
                }
              }}
              placeholder="Enter quote section summary (required)"
              maxLength={400}
              rows={3}
              className={`${getErrorMessage('quoteSection.summary') ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            <div className="flex justify-between items-start mt-2">
              <p className={`text-sm ${getErrorMessage('quoteSection.summary') ? 'text-red-600' : 'text-muted-foreground'}`}>
                {getErrorMessage('quoteSection.summary') || `${400 - (quoteSection.summary?.length || 0)} characters remaining`}
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
              <div className="space-y-4">
                {quoteSection.quotes?.map((quote, index) => (
                  <div key={index} className="grid gap-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
              <Label className="mb-2 block">Quote Title - h2</Label>
                        <Input
                          value={quote.title}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 40) {
                              handleQuoteFieldChange(index, "title", value, 40);
                            }
                          }}
                          onBlur={(e) => handleQuoteFieldBlur(index, "title", e.target.value, 40)}
                          placeholder="Quote title"
                          maxLength={40}
                          className={`${getErrorMessage(`quoteSection.quotes.${index}.title`) ? 'border-red-500 focus:border-red-500' : ''}`}
                        />
                        <div className="flex justify-between items-start mt-2">
                          <p className={`text-sm ${getErrorMessage(`quoteSection.quotes.${index}.title`) ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {getErrorMessage(`quoteSection.quotes.${index}.title`) || `${40 - (quote.title?.length || 0)} characters remaining`}
                          </p>
                        </div>
                      </div>
                    <div>
                      <Label className="mb-2 block">Quote Description - p</Label>
                      <Textarea
                        value={quote.description}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 1000) {
                            handleQuoteFieldChange(index, "description", value, 1000);
                          }
                        }}
                        onBlur={(e) => handleQuoteFieldBlur(index, "description", e.target.value, 1000)}
                        placeholder="Quote description"
                        maxLength={1000}
                        className={`${getErrorMessage(`quoteSection.quotes.${index}.description`) ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      <div className="flex justify-between items-start mt-2">
                        <p className={`text-sm ${getErrorMessage(`quoteSection.quotes.${index}.description`) ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {getErrorMessage(`quoteSection.quotes.${index}.description`) || `${1000 - (quote.description?.length || 0)} characters remaining`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Quote Text - blockquote p</Label>
                    <Textarea
                      value={quote.quote}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 1000) {
                          handleQuoteFieldChange(index, "quote", value, 1000);
                        }
                      }}
                      onBlur={(e) => handleQuoteFieldBlur(index, "quote", e.target.value, 1000)}
                      placeholder="Enter the quote"
                      rows={3}
                      maxLength={1000}
                      className={`${getErrorMessage(`quoteSection.quotes.${index}.quote`) ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <div className="flex justify-between items-start mt-2">
                      <p className={`text-sm ${getErrorMessage(`quoteSection.quotes.${index}.quote`) ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {getErrorMessage(`quoteSection.quotes.${index}.quote`) || `${1000 - (quote.quote?.length || 0)} characters remaining`}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Quote Author - footer p</Label>
                    <Input
                      value={quote.quoteusername}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 40) {
                          handleQuoteFieldChange(index, "quoteusername", value, 40);
                        }
                      }}
                      onBlur={(e) => handleQuoteFieldBlur(index, "quoteusername", e.target.value, 40)}
                      placeholder="Quote author name"
                      maxLength={40}
                      className={`${getErrorMessage(`quoteSection.quotes.${index}.username`) ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <div className="flex justify-between items-start mt-2">
                      <p className={`text-sm ${getErrorMessage(`quoteSection.quotes.${index}.username`) ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {getErrorMessage(`quoteSection.quotes.${index}.username`) || `${40 - (quote.quoteusername?.length || 0)} characters remaining`}
                      </p>
                    </div>
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Info Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            <div>
              <Label className="mb-2 block">Info headline* - p</Label>
              <Input
                data-field="infoSection.title"
                value={info.title || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  updateSection("info_section", "title", value);
                  // Real-time validation and error clearing
                  const infoErrors = validateInfoSection();
                  if (infoErrors.title) {
                    setError('infoSection.title', infoErrors.title);
                  } else {
                    clearError('infoSection.title');
                  }
                }}
                onBlur={() => {
                  // Additional validation on blur if needed
                  const infoErrors = validateInfoSection();
                  if (infoErrors.title) {
                    setError('infoSection.title', infoErrors.title);
                  }
                }}
                placeholder="Enter info section title (required)"
                maxLength={40}
                className={`${getErrorMessage('infoSection.title') ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              <div className="flex justify-between items-start mt-2">
                <p className={`text-sm ${getErrorMessage('infoSection.title') ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {getErrorMessage('infoSection.title') || `${40 - (info.title?.length || 0)} characters remaining`}
                </p>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Info Description * - p</Label>
              <Textarea
                value={info.description || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  updateSection("info_section", "description", value);
                  // Real-time validation and error clearing
                  const infoErrors = validateInfoSection();
                  if (infoErrors.description) {
                    setError('infoSection.description', infoErrors.description);
                  } else {
                    clearError('infoSection.description');
                  }
                }}
                onBlur={() => {
                  // Additional validation on blur if needed
                  const infoErrors = validateInfoSection();
                  if (infoErrors.description) {
                    setError('infoSection.description', infoErrors.description);
                  }
                }}
                placeholder="Enter info section description (required)"
                rows={3}
                maxLength={1000}
                className={`${getErrorMessage('infoSection.description') ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              <div className="flex justify-between items-start mt-2">
                <p className={`text-sm ${getErrorMessage('infoSection.description') ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {getErrorMessage('infoSection.description') || `${1000 - (info.description?.length || 0)} characters remaining`}
                </p>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Info Summary * - p</Label>
              <Textarea
                value={info.summary || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  updateSection("info_section", "summary", value);
                  // Real-time validation and error clearing
                  const infoErrors = validateInfoSection();
                  if (infoErrors.summary) {
                    setError('infoSection.summary', infoErrors.summary);
                  } else {
                    clearError('infoSection.summary');
                  }
                }}
                onBlur={() => {
                  // Additional validation on blur if needed
                  const infoErrors = validateInfoSection();
                  if (infoErrors.summary) {
                    setError('infoSection.summary', infoErrors.summary);
                  }
                }}
                placeholder="Enter info section summary (required)"
                maxLength={400}
                rows={3}
                className={`${getErrorMessage('infoSection.summary') ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              <div className="flex justify-between items-start mt-2">
                <p className={`text-sm ${getErrorMessage('infoSection.summary') ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {getErrorMessage('infoSection.summary') || `${400 - (info.summary?.length || 0)} characters remaining`}
                </p>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Info Summary 2 * - p</Label>
              <Textarea
                value={info.summary_2 || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  updateSection("info_section", "summary_2", value);
                  // Real-time validation and error clearing
                  const infoErrors = validateInfoSection();
                  if (infoErrors.summary2) {
                    setError('infoSection.summary2', infoErrors.summary2);
                  } else {
                    clearError('infoSection.summary2');
                  }
                }}
                onBlur={() => {
                  // Additional validation on blur if needed
                  const infoErrors = validateInfoSection();
                  if (infoErrors.summary2) {
                    setError('infoSection.summary2', infoErrors.summary2);
                  }
                }}
                placeholder="Enter additional info summary (required)"
                maxLength={400}
                rows={3}
                className={`${getErrorMessage('infoSection.summary2') ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              <div className="flex justify-between items-start mt-2">
                <p className={`text-sm ${getErrorMessage('infoSection.summary2') ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {getErrorMessage('infoSection.summary2') || `${400 - (info.summary_2?.length || 0)} characters remaining`}
                </p>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Info Banner Image Alt Text</Label>
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
              <div className="flex justify-between items-start mt-2">
                <p className="text-sm text-muted-foreground">
                  {255 - ((info as any).image_alt_text?.length || 0)} characters remaining
                </p>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Info Banner Image</Label>
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
                  <div className="mt-3 space-y-2">
                    <img
                      src={URL.createObjectURL(info.image)}
                      alt="Info Image Preview"
                      className="h-40 w-auto rounded border object-cover"
                    />
                    <div>
                      <Label htmlFor="infoImageAlt">Info Image Alt Text</Label>
                      <Input
                        id="infoImageAlt"
                        value={(info as any).image_alt_text || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 255) {
                            updateSection("info_section", "image_alt_text", value);
                          }
                        }}
                        placeholder="Alt text for info banner image"
                        maxLength={255}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {255 - ((info as any).image_alt_text?.length || 0)} characters remaining
                      </p>
                    </div>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="cursor-pointer">Basic Info</TabsTrigger>
            <TabsTrigger value="sections" className="cursor-pointer">Sections</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div>
                    <Label htmlFor="title" className="mb-2 block">Blog Title * - h3</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 40) {
                          handleTitleChange(value);
                          // Clear error when user starts typing
                          if (getErrorMessage('title')) {
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
                      className={`${validateTitle(title) ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <div className="flex justify-between items-start mt-2">
                      <p className="text-sm text-muted-foreground">
                        {40 - title.length} characters remaining
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="slug" className="mb-2 block">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={slug}
                      maxLength={40}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 40) {
                          setSlug(generateSlug(value));
                          // Clear error when user starts typing
                          if (getErrorMessage('slug')) {
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
                      className={`${validateSlug(slug) ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      This will be used in the URL. Only letters, numbers, and
                      hyphens allowed.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {40 - slug.length} characters remaining
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="content" className="mb-2 block">Content * - p</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        // Clear error when user starts typing
                        if (getErrorMessage('content')) {
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
                      className={`${validateContent(content) ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <div className="flex justify-between items-start mt-2">
                      <p className="text-sm text-muted-foreground">
                        {content.length} characters (minimum 100 required)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="metaTitle" className="mb-2 block">Meta Title *</Label>
                      <Input
                        id="metaTitle"
                        value={metaTitle}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 40) {
                            setMetaTitle(value);
                            // Clear error when user starts typing
                            if (getErrorMessage('metaTitle')) {
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
                        className={`${validateMetaTitle(metaTitle) ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      <div className="flex justify-between items-start mt-2">
                        <p className="text-sm text-muted-foreground">
                          {40 - metaTitle.length} characters remaining
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="metaDescription" className="mb-2 block">
                        Meta Description *
                      </Label>
                      <Textarea
                        id="metaDescription"
                        value={metaDescription}
                        onChange={(e) => {
                          const value = e.target.value;
                          setMetaDescription(value);
                          // Real-time validation and error clearing
                          const error = validateMetaDescription(value);
                          if (error) {
                            setError('metaDescription', error);
                          } else {
                            clearError('metaDescription');
                          }
                        }}
                        onBlur={() => {
                          // Additional validation on blur if needed
                          const error = validateMetaDescription(metaDescription);
                          if (error) {
                            setError('metaDescription', error);
                          }
                        }}
                        placeholder="Enter meta description for SEO (minimum 50 characters)"
                        rows={3}
                        required
                        maxLength={300}
                        className={`${getErrorMessage('metaDescription') ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      <div className="flex justify-between items-start mt-2">
                        <p className={`text-sm flex items-center gap-1 ${metaDescription.length < 50 ? 'text-orange-600' : getErrorMessage('metaDescription') ? 'text-red-600' : 'text-muted-foreground'}`}>
                          <AlertCircle className="h-3 w-3" />
                          {metaDescription.length < 50
                            ? `Need ${50 - metaDescription.length} more characters (${metaDescription.length}/50 min)`
                            : getErrorMessage('metaDescription') || `${metaDescription.length} characters`
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-1">
                      <Label htmlFor="image" className="mb-2 block">Upload Blog Images *</Label>
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
                        className={getErrorMessage('images') ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      <ErrorMessage message={getErrorMessage('images')} />
                      {previews.length > 0 && (
                        <div className="mt-3 space-y-4">
                          {previews.map((src, idx) => (
                            <div key={idx} className="space-y-2 p-4 border rounded-lg">
                              <img
                                src={src}
                                alt={`Preview ${idx + 1}`}
                                className="h-40 w-auto rounded border object-cover"
                              />
                              <div>
                                <Label htmlFor={`blogImageAlt${idx}`}>Image Alt Text {idx + 1}</Label>
                                <Input
                                  id={`blogImageAlt${idx}`}
                                  value={imageAltTexts[idx] || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.length <= 255) {
                                      const newAltTexts = [...imageAltTexts];
                                      newAltTexts[idx] = value;
                                      setImageAltTexts(newAltTexts);
                                    }
                                  }}
                                  placeholder={`Alt text for blog image ${idx + 1}`}
                                  maxLength={255}
                                  className="w-full"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {255 - (imageAltTexts[idx]?.length || 0)} characters remaining
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>


                    <div className="col-span-1">
                      <Label htmlFor="ogImage" className="mb-2 block">OG Image (Optional)</Label>
                      <Input
                        id="ogImage"
                        type="file"
                        accept="image/*"
                        onChange={handleOgImageChange}
                      />
                      {ogImagePreview && (
                        <div className="mt-3 space-y-2">
                          <img
                            src={ogImagePreview}
                            alt="OG Image Preview"
                            className="h-40 w-auto rounded border object-cover"
                          />
                          <div>
                            <Label htmlFor="ogImageAlt">OG Image Alt Text</Label>
                            <Input
                              id="ogImageAlt"
                              value={ogImageAltText}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 255) {
                                  setOgImageAltText(value);
                                }
                              }}
                              placeholder="Alt text for OG image"
                              maxLength={255}
                              className="w-full"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {255 - ogImageAltText.length} characters remaining
                            </p>
                          </div>
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

          <TabsContent value="sections" className="space-y-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Blog Sections</h2>
              {renderHeroSection()}
              {renderQuoteSection()}
              {renderInfoSection()}
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex flex-col items-start gap-4">
          <Button
            variant={"blue"}
            type="submit"
            disabled={addBlog.isPending}
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
