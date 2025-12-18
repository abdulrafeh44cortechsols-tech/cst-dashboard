"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIndustries } from "@/hooks/useIndustries";
import { useTags } from "@/hooks/useTags";
import type { Industry, Tag, CreateIndustryData } from "@/types/types";
import { toast } from "sonner";
import { Loader2, Upload, ImageIcon, CheckCircle2, XCircle } from "lucide-react";
import { MediaGalleryModal } from "@/components/media/MediaGalleryModal";
import type { MediaItem } from "@/services/media";
import { industriesDataService } from "@/services/industries";

interface EditIndustryFormProps {
  industry: Industry | null;
  onCancel?: () => void;
  onSaved?: () => void;
}

// New API structure interfaces
interface ProjectStatItem {
  name: string;
  count: number;
}

// Challenge section: title + items (each item is just a point string)
interface ChallengeSection {
  title: string;
  items: string[]; // Array of point strings
}

// Expertise subsection: title, desc, image with alt text
interface ExpertiseSubSection {
  title: string;
  description: string;
  image: string | null; // Image URL
  image_alt_text: string;
}

// Expertise section: title, description, subsections
interface ExpertiseSection {
  title: string;
  description: string;
  sub_sections: ExpertiseSubSection[];
}

// What Sets Us Apart subsection: title, desc, image with alt text
interface WsuaSubSection {
  title: string;
  description: string;
  image: string | null; // Image URL
  image_alt_text: string;
}

// What Sets Us Apart section: title, description, subsections
interface WsuaSection {
  title: string;
  description: string;
  sub_sections: WsuaSubSection[];
}

// We Build section: title, description, subsections (each is just a point string)
interface WeBuildSection {
  title: string;
  description: string;
  sub_sections: string[]; // Array of point strings
}

// Extracted from EditIndustryModal to reuse on a full page without changing logic
export function EditIndustryForm({ industry, onCancel, onSaved }: EditIndustryFormProps) {
  const { editIndustry } = useIndustries();

  console.log(industry, "industry data from API");
  const { getTags } = useTags();

  // Basic fields (updated to match new API)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [industryCategory, setIndustryCategory] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [selectedTags, setSelectedTags] = useState<number[]>([]); // Array of tag IDs

  // Slug validation state
  const [originalSlug, setOriginalSlug] = useState<string>("");
  const [slugCheckMessage, setSlugCheckMessage] = useState<string>("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // ...removed stats fields: projectsCount, reviewsCount, industriesCount

  // Hero image state (now an object with id, image, alt_text)
  const [existingHeroImage, setExistingHeroImage] = useState<{ id: number; image: string; alt_text: string } | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImageAltText, setHeroImageAltText] = useState("");
  const [heroImageId, setHeroImageId] = useState<number | null>(null);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);

  // Category icon state (new field)
  const [existingCategoryIcon, setExistingCategoryIcon] = useState<{ id: number; image: string; alt_text: string } | null>(null);
  const [categoryIconFile, setCategoryIconFile] = useState<File | null>(null);
  const [categoryIconAltText, setCategoryIconAltText] = useState("");
  const [categoryIconId, setCategoryIconId] = useState<number | null>(null);
  const [uploadingCategoryIcon, setUploadingCategoryIcon] = useState(false);

  // Section data states (new structure)
  const [projectsStatsSection, setProjectsStatsSection] = useState<ProjectStatItem[]>([]);
  const [challengeSection, setChallengeSection] = useState<ChallengeSection>({ title: "", items: [] });
  const [expertiseSection, setExpertiseSection] = useState<ExpertiseSection>({ title: "", description: "", sub_sections: [] });
  const [whatSetsUsApartSection, setWhatSetsUsApartSection] = useState<WsuaSection>({ title: "", description: "", sub_sections: [] });
  const [weBuildSection, setWeBuildSection] = useState<WeBuildSection>({ title: "", description: "", sub_sections: [] });

  // Subsection image upload states
  const [uploadingExpertiseImage, setUploadingExpertiseImage] = useState<number | null>(null);
  const [uploadingWsuaImage, setUploadingWsuaImage] = useState<number | null>(null);
  const [expertiseImageFiles, setExpertiseImageFiles] = useState<{ [key: number]: File }>({});
  const [wsuaImageFiles, setWsuaImageFiles] = useState<{ [key: number]: File }>({});

  // Media gallery modal states
  const [showHeroGallery, setShowHeroGallery] = useState(false);
  const [showCategoryIconGallery, setShowCategoryIconGallery] = useState(false);
  const [showExpertiseGallery, setShowExpertiseGallery] = useState<number | null>(null);
  const [showWsuaGallery, setShowWsuaGallery] = useState<number | null>(null);
  const [heroSelectedFromGallery, setHeroSelectedFromGallery] = useState(false);
  const [categoryIconSelectedFromGallery, setCategoryIconSelectedFromGallery] = useState(false);

  // Error handling state
  const [errors, setErrors] = useState<{
    title?: string;
    slug?: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
    general?: string;
  }>({});

  // Validation functions
  const validateTitle = (value: string): string | null => {
    if (!value.trim()) return "Industry title is required";
    if (value.length < 3) return "Title must be at least 3 characters long";
    if (value.length > 50) return "Title must be 50 characters or less";
    return null;
  };

  const validateSlug = (value: string): string | null => {
    if (!value.trim()) return "URL slug is required";
    if (value.length < 3) return "Slug must be at least 3 characters long";
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(value)) return "Slug can only contain lowercase letters, numbers, and hyphens";
    return null;
  };

  const validateDescription = (value: string): string | null => {
    if (!value.trim()) return "Industry description is required";
    if (value.length < 50) return "Description must be at least 50 characters long";
    if (value.length > 500) return "Description must be 500 characters or less";
    return null;
  };

  const validateMetaTitle = (value: string): string | null => {
    if (!value.trim()) return "Meta title is required";
    if (value.length < 5) return "Meta title must be at least 5 characters long";
    if (value.length > 60) return "Meta title must be 60 characters or less";
    return null;
  };

  const validateMetaDescription = (value: string): string | null => {
    if (!value.trim()) return "Meta description is required";
    if (value.length < 50) return "Meta description must be at least 50 characters long";
    if (value.length > 160) return "Meta description must be 160 characters or less";
    return null;
  };

  // Utility function to generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
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
        const response = await industriesDataService.checkSlugAvailability(slug, 'industry');
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

  // Get tags data safely from new API structure
  const tags = getTags.data?.results;

  // Load industry data when available
  useEffect(() => {
    if (industry) {
      console.log("Populating form with industry data:", industry);

      // Basic fields
      setTitle(industry.title || "");
      setDescription(industry.description || "");
      setSlug(industry.slug || "");
      setIndustryCategory(industry.industry_category || "");
      setMetaTitle(industry.meta_title || "");
      setMetaDescription(industry.meta_description || "");
      setIsPublished(industry.is_published ?? true);
      // Convert tag names to IDs
      if (industry.tags && tags) {
        const tagIds = industry.tags
          .map((tagName: string) => tags.find((t: Tag) => t.name === tagName)?.id)
          .filter((id: number | undefined): id is number => id !== undefined);
        setSelectedTags(tagIds);
      } else {
        setSelectedTags([]);
      }

      // ...removed stats fields from draft load

      // Hero image (now an object)
      if (industry.hero_image) {
        setExistingHeroImage(industry.hero_image);
        setHeroImageId(industry.hero_image.id);
        setHeroImageAltText(industry.hero_image.alt_text || "");
      }

      // Category icon (new field)
      if (industry.category_icon) {
        setExistingCategoryIcon(industry.category_icon);
        setCategoryIconId(industry.category_icon.id);
        setCategoryIconAltText(industry.category_icon.alt_text || "");
      }

      // Section data (new structure)
      setProjectsStatsSection(industry.projects_stats_section || []);
      setChallengeSection(industry.challenge_section || { title: "", items: [] });
      setExpertiseSection(industry.expertise_section || { title: "", description: "", sub_sections: [] });
      setWhatSetsUsApartSection(industry.what_sets_us_apart_section || { title: "", description: "", sub_sections: [] });
      setWeBuildSection(industry.we_build_section || { title: "", description: "", sub_sections: [] });

      // Store original slug for validation
      setOriginalSlug(industry.slug || "");
    }
  }, [industry, tags]);

  // Helper functions for Projects Stats Section
  const addProjectStat = () => {
    setProjectsStatsSection(prev => [...prev, { name: "", count: 0 }]);
  };

  const removeProjectStat = (index: number) => {
    setProjectsStatsSection(prev => prev.filter((_, i) => i !== index));
  };

  const updateProjectStat = (index: number, field: string, value: string | number) => {
    setProjectsStatsSection(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // Helper functions for Challenge Section (title + point items)
  const addChallengeItem = () => {
    setChallengeSection(prev => ({
      ...prev,
      items: [...prev.items, ""]
    }));
  };

  const removeChallengeItem = (index: number) => {
    setChallengeSection(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateChallengeItem = (index: number, value: string) => {
    setChallengeSection(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? value : item)
    }));
  };

  // Helper functions for Expertise Section (title, desc, subsections with title/desc/image)
  const addExpertiseSubSection = () => {
    setExpertiseSection(prev => ({
      ...prev,
      sub_sections: [...(prev?.sub_sections || []), { title: "", description: "", image: null, image_alt_text: "" }]
    }));
  };

  const removeExpertiseSubSection = (index: number) => {
    setExpertiseSection(prev => ({
      ...prev,
      sub_sections: (prev?.sub_sections || []).filter((_, i) => i !== index)
    }));
  };

  const updateExpertiseSubSection = (index: number, field: string, value: string | number | null) => {
    setExpertiseSection(prev => ({
      ...prev,
      sub_sections: (prev?.sub_sections || []).map((sub, i) => i === index ? { ...sub, [field]: value } : sub)
    }));
  };

  // Helper functions for What Sets Us Apart Section (title, desc, subsections with title/desc/image)
  const addWsuaSubSection = () => {
    setWhatSetsUsApartSection(prev => ({
      ...prev,
      sub_sections: [...(prev?.sub_sections || []), { title: "", description: "", image: null, image_alt_text: "" }]
    }));
  };

  const removeWsuaSubSection = (index: number) => {
    setWhatSetsUsApartSection(prev => ({
      ...prev,
      sub_sections: (prev?.sub_sections || []).filter((_, i) => i !== index)
    }));
  };

  const updateWsuaSubSection = (index: number, field: string, value: string | number | null) => {
    setWhatSetsUsApartSection(prev => ({
      ...prev,
      sub_sections: (prev?.sub_sections || []).map((sub, i) => i === index ? { ...sub, [field]: value } : sub)
    }));
  };

  // Helper functions for We Build Section (title, desc, sub_sections as point strings)
  const addWeBuildSubSection = () => {
    setWeBuildSection(prev => ({
      ...prev,
      sub_sections: [...(prev?.sub_sections || []), ""]
    }));
  };

  const removeWeBuildSubSection = (index: number) => {
    setWeBuildSection(prev => ({
      ...prev,
      sub_sections: (prev?.sub_sections || []).filter((_, i) => i !== index)
    }));
  };

  const updateWeBuildSubSection = (index: number, value: string) => {
    setWeBuildSection(prev => ({
      ...prev,
      sub_sections: (prev?.sub_sections || []).map((item, i) => i === index ? value : item)
    }));
  };

  // Expertise subsection image handlers
  const handleExpertiseImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExpertiseImageFiles(prev => ({ ...prev, [index]: e.target.files![0] }));
    }
  };

  const uploadExpertiseImage = async (index: number) => {
    const file = expertiseImageFiles[index];
    const altText = (expertiseSection?.sub_sections || [])[index]?.image_alt_text;

    if (!file) {
      toast.error("No image file selected");
      return;
    }
    if (!altText?.trim()) {
      toast.error("Please add alt text for the image first");
      return;
    }

    setUploadingExpertiseImage(index);
    try {
      const { mediaService } = await import("@/services/media");
      const uploaded = await mediaService.uploadMedia({
        image: file,
        alt_text: altText
      });
      updateExpertiseSubSection(index, "image", uploaded.image); // Store image URL
      setExpertiseImageFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[index];
        return newFiles;
      });
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading expertise image:", error);
      toast.error("Failed to upload image: " + (error.message || "Unknown error"));
    } finally {
      setUploadingExpertiseImage(null);
    }
  };

  // WSUA subsection image handlers
  const handleWsuaImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setWsuaImageFiles(prev => ({ ...prev, [index]: e.target.files![0] }));
    }
  };

  const uploadWsuaImage = async (index: number) => {
    const file = wsuaImageFiles[index];
    const altText = (whatSetsUsApartSection?.sub_sections || [])[index]?.image_alt_text;

    if (!file) {
      toast.error("No image file selected");
      return;
    }
    if (!altText?.trim()) {
      toast.error("Please add alt text for the image first");
      return;
    }

    setUploadingWsuaImage(index);
    try {
      const { mediaService } = await import("@/services/media");
      const uploaded = await mediaService.uploadMedia({
        image: file,
        alt_text: altText
      });
      updateWsuaSubSection(index, "image", uploaded.image); // Store image URL
      setWsuaImageFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[index];
        return newFiles;
      });
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading WSUA image:", error);
      toast.error("Failed to upload image: " + (error.message || "Unknown error"));
    } finally {
      setUploadingWsuaImage(null);
    }
  };

  // Hero image file handler
  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroImageFile(e.target.files[0]);
      setHeroImageAltText("");
      setExistingHeroImage(null);
      setHeroImageId(null);
    }
  };

  // Upload hero image to sols-media
  const uploadHeroImage = async () => {
    if (!heroImageFile) {
      toast.error("No hero image file selected");
      return;
    }
    if (!heroImageAltText.trim()) {
      toast.error("Please add alt text for the hero image");
      return;
    }

    setUploadingHeroImage(true);
    try {
      const { mediaService } = await import("@/services/media");
      const uploaded = await mediaService.uploadMedia({
        image: heroImageFile,
        alt_text: heroImageAltText
      });
      setHeroImageId(uploaded.id);
      setExistingHeroImage(uploaded);
      setHeroImageFile(null);
      toast.success("Hero image uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading hero image:", error);
      toast.error("Failed to upload hero image: " + (error.message || "Unknown error"));
    } finally {
      setUploadingHeroImage(false);
    }
  };

  // Category icon file handler
  const handleCategoryIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCategoryIconFile(e.target.files[0]);
      setCategoryIconAltText("");
      setExistingCategoryIcon(null);
      setCategoryIconId(null);
    }
  };

  // Upload category icon to sols-media
  const uploadCategoryIcon = async () => {
    if (!categoryIconFile) {
      toast.error("No category icon file selected");
      return;
    }
    if (!categoryIconAltText.trim()) {
      toast.error("Please add alt text for the category icon");
      return;
    }

    setUploadingCategoryIcon(true);
    try {
      const { mediaService } = await import("@/services/media");
      const uploaded = await mediaService.uploadMedia({
        image: categoryIconFile,
        alt_text: categoryIconAltText
      });
      setCategoryIconId(uploaded.id);
      setExistingCategoryIcon(uploaded);
      setCategoryIconFile(null);
      toast.success("Category icon uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading category icon:", error);
      toast.error("Failed to upload category icon: " + (error.message || "Unknown error"));
    } finally {
      setUploadingCategoryIcon(false);
    }
  };

  // Tag toggle handler (works with tag IDs)
  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const getFilePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  const handleSave = async () => {
    if (!industry) return;

    // Clear previous errors
    setErrors({});

    // Validate all required fields
    const titleError = validateTitle(title);
    const slugError = validateSlug(slug);
    const descriptionError = validateDescription(description);
    const metaTitleError = validateMetaTitle(metaTitle);
    const metaDescriptionError = validateMetaDescription(metaDescription);

    // Set errors if any validation fails
    if (titleError) setErrors(prev => ({ ...prev, title: titleError }));
    if (slugError) setErrors(prev => ({ ...prev, slug: slugError }));
    if (descriptionError) setErrors(prev => ({ ...prev, description: descriptionError }));
    if (metaTitleError) setErrors(prev => ({ ...prev, metaTitle: metaTitleError }));
    if (metaDescriptionError) setErrors(prev => ({ ...prev, metaDescription: metaDescriptionError }));

    // Check if there are any errors
    if (titleError || slugError || descriptionError || metaTitleError || metaDescriptionError) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    if (!title || !description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      // Build JSON payload matching new API structure
      const updateData: Record<string, any> = {
        title,
        slug,
        description,
        industry_category: industryCategory,
        meta_title: metaTitle,
        meta_description: metaDescription,
        is_published: isPublished,

        // ...removed stats fields from API payload

        // Tags (array of strings)
        tags: selectedTags,

        // Images (send IDs)
        hero_image: heroImageId || (existingHeroImage?.id || null),
        category_icon: categoryIconId || (existingCategoryIcon?.id || null),

        // Section data
        projects_stats_section: projectsStatsSection.length > 0 ? projectsStatsSection : undefined,
        challenge_section: (challengeSection.title || challengeSection.items.length > 0) ? challengeSection : undefined,
        expertise_section: (expertiseSection.title || expertiseSection.description || expertiseSection.sub_sections.length > 0) ? expertiseSection : undefined,
        what_sets_us_apart_section: (whatSetsUsApartSection.title || whatSetsUsApartSection.description || whatSetsUsApartSection.sub_sections.length > 0) ? whatSetsUsApartSection : undefined,
        we_build_section: (weBuildSection.title || weBuildSection.description || weBuildSection.sub_sections.length > 0) ? weBuildSection : undefined,
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await editIndustry.mutateAsync({ id: industry.id, data: updateData as CreateIndustryData });
      toast.success("Industry updated successfully!");
      onSaved?.();
    } catch (error: any) {
      toast.error("Failed to update industry. Please try again.");
      console.error("Industry update error:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="cursor-pointer">Basic Info</TabsTrigger>
          <TabsTrigger value="hero" className="cursor-pointer">Hero Section</TabsTrigger>
          <TabsTrigger value="challenges" className="cursor-pointer">Challenges</TabsTrigger>
          <TabsTrigger value="expertise" className="cursor-pointer">Expertise</TabsTrigger>
          <TabsTrigger value="apart" className="cursor-pointer">What Sets Us Apart</TabsTrigger>
          <TabsTrigger value="build" className="cursor-pointer">We Build</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Industry Title *</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 50) {
                    handleTitleChange(value);
                    const error = validateTitle(value);
                    if (error) {
                      setErrors(prev => ({ ...prev, title: error }));
                    } else {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.title;
                        return newErrors;
                      });
                    }
                  }
                }}
                onBlur={() => {
                  const error = validateTitle(title);
                  if (error) {
                    setErrors(prev => ({ ...prev, title: error }));
                  }
                }}
                placeholder="Enter industry title"
                maxLength={50}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
              />
              <p className={`text-sm ${errors.title ? 'text-red-600' : 'text-gray-500'}`}>
                {errors.title || `${50 - title.length} characters remaining`}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">Slug *</label>
              <div className="relative">
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 40) {
                      setSlug(generateSlug(value));
                      setSlugCheckMessage("");
                      setSlugAvailable(null);
                      // Clear error when user starts typing
                      if (errors.slug) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.slug;
                          return newErrors;
                        });
                      }
                    }
                  }}
                  onBlur={() => {
                    // Validate on blur
                    const error = validateSlug(slug);
                    if (error) {
                      setErrors(prev => ({ ...prev, slug: error }));
                    }
                  }}
                  placeholder="industry-slug"
                  maxLength={40}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.slug ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                />
                {isCheckingSlug && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
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
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setDescription(value);
                }
              }}
              onBlur={() => {
                if (description.length < 50) {
                  setErrors(prev => ({ ...prev, description: 'Description must be at least 50 characters long' }));
                } else {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.description;
                    return newErrors;
                  });
                }
              }}
              placeholder="Enter industry description"
              maxLength={500}
              rows={4}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
            />
            <p className={`text-sm ${errors.description ? 'text-red-600' : 'text-gray-500'}`}>
              {errors.description || `${500 - description.length} characters remaining`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="metaTitle" className="text-sm font-medium">Meta Title</label>
              <input
                id="metaTitle"
                type="text"
                value={metaTitle}
                onChange={(e) => {
                  const value = e.target.value;
                  setMetaTitle(value);
                  // Real-time validation and error clearing
                  const error = validateMetaTitle(value);
                  if (error) {
                    setErrors(prev => ({ ...prev, metaTitle: error }));
                  } else {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.metaTitle;
                      return newErrors;
                    });
                  }
                }}
                onBlur={() => {
                  // Additional validation on blur if needed
                  const error = validateMetaTitle(metaTitle);
                  if (error) {
                    setErrors(prev => ({ ...prev, metaTitle: error }));
                  }
                }}
                placeholder="SEO meta title"
                maxLength={60}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.metaTitle ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
              />
              <p className={`text-sm ${errors.metaTitle ? 'text-red-600' : 'text-gray-500'}`}>
                {errors.metaTitle || `${60 - metaTitle.length} characters remaining`}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="metaDescription" className="text-sm font-medium">Meta Description</label>
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => {
                  const value = e.target.value;
                  setMetaDescription(value);
                  // Real-time validation and error clearing
                  const error = validateMetaDescription(value);
                  if (error) {
                    setErrors(prev => ({ ...prev, metaDescription: error }));
                  } else {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.metaDescription;
                      return newErrors;
                    });
                  }
                }}
                onBlur={() => {
                  // Additional validation on blur if needed
                  const error = validateMetaDescription(metaDescription);
                  if (error) {
                    setErrors(prev => ({ ...prev, metaDescription: error }));
                  }
                }}
                placeholder="SEO meta description"
                maxLength={160}
                rows={2}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.metaDescription ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
              />
              <p className={`text-sm ${errors.metaDescription ? 'text-red-600' : 'text-gray-500'}`}>
                {errors.metaDescription || `${160 - metaDescription.length} characters remaining`}
              </p>
            </div>
          </div>

          {/* ...removed stats fields UI */}

          {/* Industry Category */}
          {/* <div className="space-y-2">
            <label htmlFor="industryCategory" className="text-sm font-medium">Industry Category</label>
            <input
              id="industryCategory"
              type="text"
              value={industryCategory}
              onChange={(e) => setIndustryCategory(e.target.value)}
              placeholder="e.g., Healthcare, Finance, etc."
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div> */}

          <div className="flex items-center space-x-2">
            <input
              id="isPublished"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublished" className="text-sm font-medium">Published</label>
          </div>

          {/* Hero Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hero Image</label>

            {/* Image Upload Options */}
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleHeroImageChange(e);
                    setHeroSelectedFromGallery(false);
                  }}
                  className="hidden"
                />
                <Button type="button" variant="outline" size="sm" asChild>
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
                onClick={() => setShowHeroGallery(true)}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Select from Gallery
              </Button>
            </div>

            {/* Show existing hero image */}
            {existingHeroImage && !heroImageFile && !heroSelectedFromGallery && (
              <div className="mb-3 p-3 border rounded-lg bg-green-50">
                <p className="text-sm text-green-700 font-medium mb-2">✓ Hero image uploaded</p>
                <img
                  src={existingHeroImage.image}
                  alt={existingHeroImage.alt_text}
                  className="h-32 w-full rounded border object-cover"
                />
                <p className="text-xs text-gray-600 mt-1">Alt: {existingHeroImage.alt_text}</p>
                <p className="text-xs text-gray-500 mt-1">Select a new image above to replace</p>
              </div>
            )}

            {/* Gallery selection success */}
            {heroSelectedFromGallery && heroImageId && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Selected from gallery (Alt: {heroImageAltText || 'No alt text'})
              </div>
            )}

            {/* New hero image selection from file */}
            {heroImageFile && !heroSelectedFromGallery && (
              <div className="space-y-2">
                <img
                  src={getFilePreview(heroImageFile)}
                  alt="Hero image preview"
                  className="h-32 w-full rounded border object-cover"
                />
                <div>
                  <label className="text-xs font-medium">Alt Text *</label>
                  <input
                    type="text"
                    value={heroImageAltText}
                    onChange={(e) => setHeroImageAltText(e.target.value)}
                    placeholder="Describe the hero image"
                    maxLength={255}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
                <Button
                  type="button"
                  onClick={uploadHeroImage}
                  disabled={uploadingHeroImage || !heroImageAltText.trim()}
                  size="sm"
                >
                  {uploadingHeroImage ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                  ) : (
                    "Upload Hero Image"
                  )}
                </Button>
              </div>
            )}

            {/* Media Gallery Modal */}
            <MediaGalleryModal
              open={showHeroGallery}
              onOpenChange={setShowHeroGallery}
              onSelect={(media: MediaItem[]) => {
                if (media.length > 0) {
                  const selected = media[0];
                  setHeroImageId(selected.id);
                  setHeroImageAltText(selected.alt_text || '');
                  setHeroImageFile(null);
                  setHeroSelectedFromGallery(true);
                  setExistingHeroImage(null);
                  toast.success('Hero image selected from gallery!');
                }
              }}
              maxSelection={1}
              minSelection={1}
              title="Select Hero Image"
            />
          </div>

          {/* Category Icon */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category Icon</label>

            {/* Image Upload Options */}
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleCategoryIconChange(e);
                    setCategoryIconSelectedFromGallery(false);
                  }}
                  className="hidden"
                />
                <Button type="button" variant="outline" size="sm" asChild>
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
                onClick={() => setShowCategoryIconGallery(true)}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Select from Gallery
              </Button>
            </div>

            {/* Show existing category icon */}
            {existingCategoryIcon && !categoryIconFile && !categoryIconSelectedFromGallery && (
              <div className="mb-3 p-3 border rounded-lg bg-green-50">
                <p className="text-sm text-green-700 font-medium mb-2">✓ Category icon uploaded</p>
                <img
                  src={existingCategoryIcon.image}
                  alt={existingCategoryIcon.alt_text}
                  className="h-16 w-16 rounded border object-cover"
                />
                <p className="text-xs text-gray-600 mt-1">Alt: {existingCategoryIcon.alt_text}</p>
                <p className="text-xs text-gray-500 mt-1">Select a new icon above to replace</p>
              </div>
            )}

            {/* Gallery selection success */}
            {categoryIconSelectedFromGallery && categoryIconId && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Selected from gallery (Alt: {categoryIconAltText || 'No alt text'})
              </div>
            )}

            {/* New category icon selection from file */}
            {categoryIconFile && !categoryIconSelectedFromGallery && (
              <div className="space-y-2">
                <img
                  src={getFilePreview(categoryIconFile)}
                  alt="Category icon preview"
                  className="h-16 w-16 rounded border object-cover"
                />
                <div>
                  <label className="text-xs font-medium">Alt Text *</label>
                  <input
                    type="text"
                    value={categoryIconAltText}
                    onChange={(e) => setCategoryIconAltText(e.target.value)}
                    placeholder="Describe the category icon"
                    maxLength={255}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
                <Button
                  type="button"
                  onClick={uploadCategoryIcon}
                  disabled={uploadingCategoryIcon || !categoryIconAltText.trim()}
                  size="sm"
                >
                  {uploadingCategoryIcon ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                  ) : (
                    "Upload Category Icon"
                  )}
                </Button>
              </div>
            )}

            {/* Media Gallery Modal */}
            <MediaGalleryModal
              open={showCategoryIconGallery}
              onOpenChange={setShowCategoryIconGallery}
              onSelect={(media: MediaItem[]) => {
                if (media.length > 0) {
                  const selected = media[0];
                  setCategoryIconId(selected.id);
                  setCategoryIconAltText(selected.alt_text || '');
                  setCategoryIconFile(null);
                  setCategoryIconSelectedFromGallery(true);
                  setExistingCategoryIcon(null);
                  toast.success('Category icon selected from gallery!');
                }
              }}
              maxSelection={1}
              minSelection={1}
              title="Select Category Icon"
            />
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: Tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm border ${selectedTags.includes(tag.id)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <p className="text-xs text-gray-500">
                  Selected: {selectedTags.map(id => tags.find((t: Tag) => t.id === id)?.name).filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          )}
        </TabsContent>

        {/* Hero Section Tab - Projects Stats */}
        <TabsContent value="hero" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Projects Statistics</label>
              <button
                type="button"
                onClick={addProjectStat}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Add Stat
              </button>
            </div>

            {projectsStatsSection.map((stat, index) => (
              <div key={index} className="grid gap-4 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <input
                      type="text"
                      value={stat.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 100) {
                          updateProjectStat(index, "name", value);
                        }
                      }}
                      placeholder="Stat name (e.g., Clinic Portal)"
                      maxLength={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500">
                      {100 - (stat.name?.length || 0)} characters remaining
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Count</label>
                    <input
                      type="number"
                      value={stat.count}
                      onChange={(e) => {
                        const num = parseInt(e.target.value || "0", 10);
                        updateProjectStat(index, "count", isNaN(num) ? 0 : num);
                      }}
                      placeholder="Count"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeProjectStat(index)}
                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Challenges Section Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Section Title</label>
            <input
              type="text"
              value={challengeSection.title}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 100) {
                  setChallengeSection(prev => ({ ...prev, title: value }));
                }
              }}
              placeholder="e.g., Common challenges"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              {100 - (challengeSection.title?.length || 0)} characters remaining
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Challenge Items</label>
              <button
                type="button"
                onClick={addChallengeItem}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Add Challenge Item
              </button>
            </div>

            {challengeSection.items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateChallengeItem(index, e.target.value)}
                  placeholder={`Challenge point ${index + 1}`}
                  maxLength={200}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeChallengeItem(index)}
                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Expertise Section Tab */}
        <TabsContent value="expertise" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Section Title</label>
            <input
              type="text"
              value={expertiseSection?.title || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 100) {
                  setExpertiseSection(prev => ({ ...prev, title: value }));
                }
              }}
              placeholder="e.g., Our Expertise"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              {100 - (expertiseSection?.title?.length || 0)} characters remaining
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Section Description</label>
            <textarea
              value={expertiseSection?.description || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setExpertiseSection(prev => ({ ...prev, description: value }));
                }
              }}
              placeholder="e.g., We specialize in secure backend services, integrations and UX for clinicians."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              {500 - (expertiseSection?.description?.length || 0)} characters remaining
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Expertise Sub-sections</label>
              <button
                type="button"
                onClick={addExpertiseSubSection}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Add Sub-section
              </button>
            </div>

            {(expertiseSection.sub_sections || []).map((sub, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <input
                    type="text"
                    value={sub.title}
                    onChange={(e) => updateExpertiseSubSection(index, "title", e.target.value)}
                    placeholder="e.g., Backend Development"
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={sub.description}
                    onChange={(e) => updateExpertiseSubSection(index, "description", e.target.value)}
                    placeholder="e.g., Secure and scalable backend services"
                    maxLength={300}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image</label>

                  {/* Image Upload Options */}
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleExpertiseImageChange(index, e)}
                        className="hidden"
                      />
                      <Button type="button" variant="outline" size="sm" asChild>
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
                      onClick={() => setShowExpertiseGallery(index)}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Select from Gallery
                    </Button>
                  </div>

                  {sub.image && !expertiseImageFiles[index] && (
                    <div className="flex items-center gap-2">
                      <img
                        src={sub.image}
                        alt={sub.image_alt_text || "Uploaded image"}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <span className="text-xs text-green-600">Image uploaded</span>
                    </div>
                  )}
                  {expertiseImageFiles[index] && (
                    <div className="flex items-center gap-2">
                      <img
                        src={URL.createObjectURL(expertiseImageFiles[index])}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded"
                      />
                      <span className="text-sm text-gray-600">{expertiseImageFiles[index].name}</span>
                    </div>
                  )}

                  {/* Media Gallery Modal */}
                  <MediaGalleryModal
                    open={showExpertiseGallery === index}
                    onOpenChange={(open) => setShowExpertiseGallery(open ? index : null)}
                    onSelect={(media: MediaItem[]) => {
                      if (media.length > 0) {
                        const selected = media[0];
                        updateExpertiseSubSection(index, "image", selected.image);
                        updateExpertiseSubSection(index, "image_alt_text", selected.alt_text || '');
                        setExpertiseImageFiles(prev => {
                          const newFiles = { ...prev };
                          delete newFiles[index];
                          return newFiles;
                        });
                        toast.success('Expertise image selected from gallery!');
                      }
                    }}
                    maxSelection={1}
                    minSelection={1}
                    title="Select Expertise Image"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image Alt Text</label>
                  <input
                    type="text"
                    value={sub.image_alt_text || ""}
                    onChange={(e) => updateExpertiseSubSection(index, "image_alt_text", e.target.value)}
                    placeholder="Alt text for the image (required before upload)"
                    maxLength={255}
                    disabled={!!sub.image && !expertiseImageFiles[index]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {expertiseImageFiles[index] && (
                  <button
                    type="button"
                    onClick={() => uploadExpertiseImage(index)}
                    disabled={uploadingExpertiseImage === index}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                  >
                    {uploadingExpertiseImage === index ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                      </span>
                    ) : (
                      "Upload Image"
                    )}
                  </button>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeExpertiseSubSection(index)}
                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* What Sets Us Apart Section Tab */}
        <TabsContent value="apart" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Section Title</label>
            <input
              type="text"
              value={whatSetsUsApartSection?.title || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 100) {
                  setWhatSetsUsApartSection(prev => ({ ...prev, title: value }));
                }
              }}
              placeholder="e.g., What Sets Us Apart"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              {100 - (whatSetsUsApartSection?.title?.length || 0)} characters remaining
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Section Description</label>
            <textarea
              value={whatSetsUsApartSection?.description || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setWhatSetsUsApartSection(prev => ({ ...prev, description: value }));
                }
              }}
              placeholder="e.g., Our unique approach to solving problems"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              {500 - (whatSetsUsApartSection?.description?.length || 0)} characters remaining
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Sub-sections</label>
              <button
                type="button"
                onClick={addWsuaSubSection}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Add Sub-section
              </button>
            </div>

            {(whatSetsUsApartSection.sub_sections || []).map((sub, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <input
                    type="text"
                    value={sub.title}
                    onChange={(e) => updateWsuaSubSection(index, "title", e.target.value)}
                    placeholder="e.g., Deep Domain Knowledge"
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={sub.description}
                    onChange={(e) => updateWsuaSubSection(index, "description", e.target.value)}
                    placeholder="e.g., Years of experience in the industry"
                    maxLength={300}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image</label>

                  {/* Image Upload Options */}
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleWsuaImageChange(index, e)}
                        className="hidden"
                      />
                      <Button type="button" variant="outline" size="sm" asChild>
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
                      onClick={() => setShowWsuaGallery(index)}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Select from Gallery
                    </Button>
                  </div>

                  {sub.image && !wsuaImageFiles[index] && (
                    <div className="flex items-center gap-2">
                      <img
                        src={sub.image}
                        alt={sub.image_alt_text || "Uploaded image"}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <span className="text-xs text-green-600">Image uploaded</span>
                    </div>
                  )}
                  {wsuaImageFiles[index] && (
                    <div className="flex items-center gap-2">
                      <img
                        src={URL.createObjectURL(wsuaImageFiles[index])}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded"
                      />
                      <span className="text-sm text-gray-600">{wsuaImageFiles[index].name}</span>
                    </div>
                  )}

                  {/* Media Gallery Modal */}
                  <MediaGalleryModal
                    open={showWsuaGallery === index}
                    onOpenChange={(open) => setShowWsuaGallery(open ? index : null)}
                    onSelect={(media: MediaItem[]) => {
                      if (media.length > 0) {
                        const selected = media[0];
                        updateWsuaSubSection(index, "image", selected.image);
                        updateWsuaSubSection(index, "image_alt_text", selected.alt_text || '');
                        setWsuaImageFiles(prev => {
                          const newFiles = { ...prev };
                          delete newFiles[index];
                          return newFiles;
                        });
                        toast.success('WSUA image selected from gallery!');
                      }
                    }}
                    maxSelection={1}
                    minSelection={1}
                    title="Select WSUA Image"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image Alt Text</label>
                  <input
                    type="text"
                    value={sub.image_alt_text || ""}
                    onChange={(e) => updateWsuaSubSection(index, "image_alt_text", e.target.value)}
                    placeholder="Alt text for the image (required before upload)"
                    maxLength={255}
                    disabled={!!sub.image && !wsuaImageFiles[index]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {wsuaImageFiles[index] && (
                  <button
                    type="button"
                    onClick={() => uploadWsuaImage(index)}
                    disabled={uploadingWsuaImage === index}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                  >
                    {uploadingWsuaImage === index ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                      </span>
                    ) : (
                      "Upload Image"
                    )}
                  </button>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeWsuaSubSection(index)}
                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* We Build Section Tab */}
        <TabsContent value="build" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Section Title</label>
            <input
              type="text"
              value={weBuildSection?.title || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 100) {
                  setWeBuildSection(prev => ({ ...prev, title: value }));
                }
              }}
              placeholder="e.g., What We Build"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              {100 - (weBuildSection?.title?.length || 0)} characters remaining
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Section Description</label>
            <textarea
              value={weBuildSection?.description || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setWeBuildSection(prev => ({ ...prev, description: value }));
                }
              }}
              placeholder="e.g., Solutions we deliver for our clients"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              {500 - (weBuildSection?.description?.length || 0)} characters remaining
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Build Points</label>
              <button
                type="button"
                onClick={addWeBuildSubSection}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Add Point
              </button>
            </div>

            {(weBuildSection.sub_sections || []).map((point, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => updateWeBuildSubSection(index, e.target.value)}
                  placeholder={`Build point ${index + 1}`}
                  maxLength={200}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeWeBuildSubSection(index)}
                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={editIndustry.isPending}>
            Cancel
          </Button>
        )}
        <Button type="button" onClick={handleSave} disabled={editIndustry.isPending}>
          {editIndustry.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  );
}
