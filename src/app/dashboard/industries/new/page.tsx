"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useIndustries } from "@/hooks/useIndustries";
import { useTags } from "@/hooks/useTags";
import { industriesDataService } from "@/services/industries";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { X, Plus, Trash2, Save, RefreshCw, AlertCircle, Loader2, Upload, ImageIcon, CheckCircle2, XCircle } from "lucide-react";
import { MediaGalleryModal } from "@/components/media/MediaGalleryModal";
import type { MediaItem } from "@/services/media";
import { toast } from "sonner";
import type { Tag, CreateIndustryData } from "@/types/types";

// New API structure interfaces (matching EditIndustryForm)
interface ProjectStatItem {
  name: string;
  count: number;
}

interface ChallengeSection {
  title: string;
  items: string[]; // Array of point strings
}

interface ExpertiseSubSection {
  title: string;
  description: string;
  image: string | null; // Image URL
  image_alt_text: string;
}

interface ExpertiseSection {
  title: string;
  description: string;
  sub_sections: ExpertiseSubSection[];
}

interface WsuaSubSection {
  title: string;
  description: string;
  image: string | null; // Image URL
  image_alt_text: string;
}

interface WsuaSection {
  title: string;
  description: string;
  sub_sections: WsuaSubSection[];
}

interface WeBuildSection {
  title: string;
  description: string;
  sub_sections: string[]; // Array of point strings
}

export default function AddIndustryPage() {
  const router = useRouter();
  const { addIndustry } = useIndustries();
  const { getTags } = useTags();
  const { data: tagsResponse } = getTags;
  // Get tags data safely from new API structure
  const tags = tagsResponse?.results

  // Basic industry fields (matching EditIndustryForm)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [industryCategory, setIndustryCategory] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // Slug validation state
  const [slugCheckMessage, setSlugCheckMessage] = useState<string>("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // ...removed stats fields: projectsCount, reviewsCount, industriesCount

  // Hero image state
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImageAltText, setHeroImageAltText] = useState("");
  const [heroImageId, setHeroImageId] = useState<number | null>(null);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);

  // Category icon state
  const [categoryIconFile, setCategoryIconFile] = useState<File | null>(null);
  const [categoryIconAltText, setCategoryIconAltText] = useState("");
  const [categoryIconId, setCategoryIconId] = useState<number | null>(null);
  const [uploadingCategoryIcon, setUploadingCategoryIcon] = useState(false);

  // Section data states (new structure matching EditIndustryForm)
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

  // Validation functions (matching EditIndustryForm)
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
  }, [slug]);

  // Draft management
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  const saveDraft = useCallback(() => {
    const draftData = {
      title,
      description,
      slug,
      metaTitle,
      metaDescription,
      isPublished,
      selectedTags,
      projectsStatsSection,
      challengeSection,
      expertiseSection,
      whatSetsUsApartSection,
      weBuildSection,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("industryDraft", JSON.stringify(draftData));
    setIsDraftSaved(true);
    setLastSaved(new Date());
  }, [title, description, slug, metaTitle, metaDescription, isPublished, selectedTags,  projectsStatsSection, challengeSection, expertiseSection, whatSetsUsApartSection, weBuildSection]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title || description || slug) {
        saveDraft();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, description, slug, metaTitle, metaDescription, isPublished, selectedTags, projectsStatsSection, challengeSection, expertiseSection, whatSetsUsApartSection, weBuildSection, saveDraft]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("industryDraft");
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setTitle(draftData.title || "");
        setDescription(draftData.description || "");
        setSlug(draftData.slug || "");
        setMetaTitle(draftData.metaTitle || "");
        setMetaDescription(draftData.metaDescription || "");
        setIsPublished(draftData.isPublished ?? true);
        setSelectedTags(draftData.selectedTags || []);
        setProjectsStatsSection(draftData.projectsStatsSection || []);
        setChallengeSection(draftData.challengeSection || { title: "", items: [] });
        setExpertiseSection(draftData.expertiseSection || { title: "", description: "", sub_sections: [] });
        setWhatSetsUsApartSection(draftData.whatSetsUsApartSection || { title: "", description: "", sub_sections: [] });
        setWeBuildSection(draftData.weBuildSection || { title: "", description: "", sub_sections: [] });
        setLastSaved(new Date(draftData.timestamp));
        toast.success("Draft loaded successfully!");
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
  }, []);

  const clearDraft = () => {
    localStorage.removeItem("industryDraft");
    setIsDraftSaved(false);
    setLastSaved(null);
    toast.success("Draft cleared!");
  };

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
      toast.error("Failed to upload WSUA image: " + (error.message || "Unknown error"));
    } finally {
      setUploadingWsuaImage(null);
    }
  };

  // Hero image file handler
  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroImageFile(e.target.files[0]);
      setHeroImageAltText("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      // Build JSON payload matching new API structure (same as EditIndustryForm)
      const createData: Record<string, any> = {
        title,
        slug,
        description,
        industry_category: industryCategory,
        meta_title: metaTitle,
        meta_description: metaDescription,
        is_published: isPublished,

        // ...removed stats fields from API payload

        // Tags (array of IDs)
        tags: selectedTags,

        // Images (send IDs)
        hero_image: heroImageId || null,
        category_icon: categoryIconId || null,

        // Section data
        projects_stats_section: projectsStatsSection.length > 0 ? projectsStatsSection : undefined,
        challenge_section: (challengeSection.title || challengeSection.items.length > 0) ? challengeSection : undefined,
        expertise_section: (expertiseSection.title || expertiseSection.description || expertiseSection.sub_sections.length > 0) ? expertiseSection : undefined,
        what_sets_us_apart_section: (whatSetsUsApartSection.title || whatSetsUsApartSection.description || whatSetsUsApartSection.sub_sections.length > 0) ? whatSetsUsApartSection : undefined,
        we_build_section: (weBuildSection.title || weBuildSection.description || weBuildSection.sub_sections.length > 0) ? weBuildSection : undefined,
      };

      // Remove undefined values
      Object.keys(createData).forEach(key => {
        if (createData[key] === undefined) {
          delete createData[key];
        }
      });

      await addIndustry.mutateAsync(createData as CreateIndustryData);
      toast.success("Industry created successfully!");
      clearDraft();
      router.push("/dashboard/industries");
    } catch (error: any) {
      toast.error("Failed to create industry. Please try again.");
      console.error("Industry creation error:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Industry</h1>
          <p className="text-muted-foreground mt-2">
            Add a new industry to showcase your expertise and services
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <p className="text-sm text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Draft
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Draft</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your saved draft. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearDraft}>
                  Clear Draft
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Industry Title *</Label>
                    <Input
                      id="title"
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
                      className={`${errors.title ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <p className={`text-sm ${errors.title ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {errors.title || `${50 - title.length} characters remaining`}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <div className="relative">
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSlug(generateSlug(value));
                          setSlugCheckMessage("");
                          setSlugAvailable(null);
                          if (errors.slug) {
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.slug;
                              return newErrors;
                            });
                          }
                        }}
                        onBlur={() => {
                          const error = validateSlug(slug);
                          if (error) {
                            setErrors(prev => ({ ...prev, slug: error }));
                          }
                        }}
                        placeholder="industry-slug"
                        required
                        className={`${errors.slug ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      {isCheckingSlug && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Auto-generated from industry title • URL-friendly identifier
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
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 500) {
                        setDescription(value);
                      }
                    }}
                    onBlur={() => {
                      const error = validateDescription(description);
                      if (error) {
                        setErrors(prev => ({ ...prev, description: error }));
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
                    className={`${errors.description ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  <p className={`text-sm ${errors.description ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {errors.description || `${500 - description.length} characters remaining`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title *</Label>
                    <Input
                      id="metaTitle"
                      value={metaTitle}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 60) {
                          setMetaTitle(value);
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
                        }
                      }}
                      onBlur={() => {
                        const error = validateMetaTitle(metaTitle);
                        if (error) {
                          setErrors(prev => ({ ...prev, metaTitle: error }));
                        }
                      }}
                      placeholder="SEO meta title"
                      maxLength={60}
                      className={`${errors.metaTitle ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <p className={`text-sm ${errors.metaTitle ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {errors.metaTitle || `${60 - metaTitle.length} characters remaining`}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description *</Label>
                    <Textarea
                      id="metaDescription"
                      value={metaDescription}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 160) {
                          setMetaDescription(value);
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
                        }
                      }}
                      onBlur={() => {
                        const error = validateMetaDescription(metaDescription);
                        if (error) {
                          setErrors(prev => ({ ...prev, metaDescription: error }));
                        }
                      }}
                      placeholder="SEO meta description"
                      maxLength={160}
                      rows={2}
                      className={`${errors.metaDescription ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <p className={`text-sm ${errors.metaDescription ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {errors.metaDescription || `${160 - metaDescription.length} characters remaining`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <Label htmlFor="isPublished">Published</Label>
                </div>

                {/* Hero Image */}
                <div className="space-y-2">
                  <Label>Hero Image</Label>

                  {/* Image Upload Options */}
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer">
                      <Input
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

                  {heroImageId && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {heroSelectedFromGallery ? `Selected from gallery (Alt: ${heroImageAltText || 'No alt text'})` : `Hero image uploaded (ID: ${heroImageId})`}
                    </div>
                  )}

                  {heroImageFile && (
                    <div className="flex items-center gap-2">
                      <img
                        src={getFilePreview(heroImageFile)}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded"
                      />
                      <span className="text-sm text-gray-600">{heroImageFile.name}</span>
                    </div>
                  )}

                  {heroImageFile && !heroSelectedFromGallery && (
                    <div className="space-y-2">
                      <Label>Hero Image Alt Text</Label>
                      <Input
                        value={heroImageAltText}
                        onChange={(e) => setHeroImageAltText(e.target.value)}
                        placeholder="Alt text for hero image"
                        maxLength={255}
                      />
                      <Button
                        type="button"
                        onClick={uploadHeroImage}
                        disabled={uploadingHeroImage}
                        size="sm"
                      >
                        {uploadingHeroImage ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
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
                  <Label>Category Icon</Label>

                  {/* Image Upload Options */}
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer">
                      <Input
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

                  {categoryIconId && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {categoryIconSelectedFromGallery ? `Selected from gallery (Alt: ${categoryIconAltText || 'No alt text'})` : `Category icon uploaded (ID: ${categoryIconId})`}
                    </div>
                  )}

                  {categoryIconFile && (
                    <div className="flex items-center gap-2">
                      <img
                        src={getFilePreview(categoryIconFile)}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded"
                      />
                      <span className="text-sm text-gray-600">{categoryIconFile.name}</span>
                    </div>
                  )}

                  {categoryIconFile && !categoryIconSelectedFromGallery && (
                    <div className="space-y-2">
                      <Label>Category Icon Alt Text</Label>
                      <Input
                        value={categoryIconAltText}
                        onChange={(e) => setCategoryIconAltText(e.target.value)}
                        placeholder="Alt text for category icon"
                        maxLength={255}
                      />
                      <Button
                        type="button"
                        onClick={uploadCategoryIcon}
                        disabled={uploadingCategoryIcon}
                        size="sm"
                      >
                        {uploadingCategoryIcon ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
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
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: Tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleTagToggle(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                    {selectedTags.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Selected: {selectedTags.map(id => tags.find((t: Tag) => t.id === id)?.name).filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hero Section Tab - Projects Stats */}
          <TabsContent value="hero" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Projects Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Statistics</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addProjectStat}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Statistic
                    </Button>
                  </div>

                  {projectsStatsSection.map((stat, index) => (
                    <div key={index} className="grid gap-4 p-4 border rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={stat.name}
                            onChange={(e) => updateProjectStat(index, "name", e.target.value)}
                            placeholder="e.g., Projects Completed"
                            maxLength={50}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Count</Label>
                          <Input
                            type="number"
                            value={stat.count}
                            onChange={(e) => updateProjectStat(index, "count", parseInt(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProjectStat(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Challenges Section Tab */}
          <TabsContent value="challenges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Challenges Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={challengeSection?.title || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 100) {
                        setChallengeSection(prev => ({ ...prev, title: value }));
                      }
                    }}
                    placeholder="e.g., Industry Challenges"
                    maxLength={100}
                  />
                  <p className="text-sm text-muted-foreground">
                    {100 - (challengeSection?.title?.length || 0)} characters remaining
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Challenge Points</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addChallengeItem}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Point
                    </Button>
                  </div>

                  {(challengeSection.items || []).map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          value={item}
                          onChange={(e) => updateChallengeItem(index, e.target.value)}
                          placeholder={`Challenge point ${index + 1}`}
                          maxLength={200}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeChallengeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expertise Section Tab */}
          <TabsContent value="expertise" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expertise Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={expertiseSection?.title || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 100) {
                        setExpertiseSection(prev => ({ ...prev, title: value }));
                      }
                    }}
                    placeholder="e.g., Our Expertise"
                    maxLength={100}
                  />
                  <p className="text-sm text-muted-foreground">
                    {100 - (expertiseSection?.title?.length || 0)} characters remaining
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Section Description</Label>
                  <Textarea
                    value={expertiseSection?.description || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 500) {
                        setExpertiseSection(prev => ({ ...prev, description: value }));
                      }
                    }}
                    placeholder="Expertise section description"
                    maxLength={500}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    {500 - (expertiseSection?.description?.length || 0)} characters remaining
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Expertise Sub-sections</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addExpertiseSubSection}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sub-section
                    </Button>
                  </div>

                  {(expertiseSection.sub_sections || []).map((sub, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={sub.title}
                          onChange={(e) => updateExpertiseSubSection(index, "title", e.target.value)}
                          placeholder="e.g., Backend Development"
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={sub.description}
                          onChange={(e) => updateExpertiseSubSection(index, "description", e.target.value)}
                          placeholder="e.g., Secure and scalable backend services"
                          maxLength={300}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Image</Label>

                        {/* Image Upload Options */}
                        <div className="flex flex-wrap gap-2">
                          <label className="cursor-pointer">
                            <Input type="file" accept="image/*" onChange={(e) => handleExpertiseImageChange(index, e)} className="hidden" />
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
                            <img src={sub.image} alt={sub.image_alt_text || "Uploaded image"} className="w-16 h-16 object-cover rounded" />
                            <span className="text-xs text-green-600">Image uploaded</span>
                          </div>
                        )}
                        {expertiseImageFiles[index] && (
                          <div className="flex items-center gap-2">
                            <img src={getFilePreview(expertiseImageFiles[index])} alt="Preview" className="w-16 h-16 object-cover rounded" />
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
                        <Label>Image Alt Text</Label>
                        <Input
                          value={sub.image_alt_text || ""}
                          onChange={(e) => updateExpertiseSubSection(index, "image_alt_text", e.target.value)}
                          placeholder="Alt text for the image (required before upload)"
                          maxLength={255}
                          disabled={!!sub.image && !expertiseImageFiles[index]}
                        />
                      </div>
                      {expertiseImageFiles[index] && (
                        <Button type="button" onClick={() => uploadExpertiseImage(index)} disabled={uploadingExpertiseImage === index} size="sm">
                          {uploadingExpertiseImage === index ? <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Uploading...</> : "Upload Image"}
                        </Button>
                      )}
                      <div className="flex justify-end">
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeExpertiseSubSection(index)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* What Sets Us Apart Section Tab */}
          <TabsContent value="apart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>What Sets Us Apart Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={whatSetsUsApartSection?.title || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 100) {
                        setWhatSetsUsApartSection(prev => ({ ...prev, title: value }));
                      }
                    }}
                    placeholder="e.g., What Sets Us Apart"
                    maxLength={100}
                  />
                  <p className="text-sm text-muted-foreground">
                    {100 - (whatSetsUsApartSection?.title?.length || 0)} characters remaining
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Section Description</Label>
                  <Textarea
                    value={whatSetsUsApartSection?.description || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 500) {
                        setWhatSetsUsApartSection(prev => ({ ...prev, description: value }));
                      }
                    }}
                    placeholder="What sets us apart description"
                    maxLength={500}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    {500 - (whatSetsUsApartSection?.description?.length || 0)} characters remaining
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Sub-sections</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addWsuaSubSection}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sub-section
                    </Button>
                  </div>

                  {(whatSetsUsApartSection.sub_sections || []).map((sub, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={sub.title}
                          onChange={(e) => updateWsuaSubSection(index, "title", e.target.value)}
                          placeholder="e.g., Deep Domain Knowledge"
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={sub.description}
                          onChange={(e) => updateWsuaSubSection(index, "description", e.target.value)}
                          placeholder="e.g., Years of experience in the industry"
                          maxLength={300}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Image</Label>

                        {/* Image Upload Options */}
                        <div className="flex flex-wrap gap-2">
                          <label className="cursor-pointer">
                            <Input type="file" accept="image/*" onChange={(e) => handleWsuaImageChange(index, e)} className="hidden" />
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
                            <img src={sub.image} alt={sub.image_alt_text || "Uploaded image"} className="w-16 h-16 object-cover rounded" />
                            <span className="text-xs text-green-600">Image uploaded</span>
                          </div>
                        )}
                        {wsuaImageFiles[index] && (
                          <div className="flex items-center gap-2">
                            <img src={getFilePreview(wsuaImageFiles[index])} alt="Preview" className="w-16 h-16 object-cover rounded" />
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
                        <Label>Image Alt Text</Label>
                        <Input
                          value={sub.image_alt_text || ""}
                          onChange={(e) => updateWsuaSubSection(index, "image_alt_text", e.target.value)}
                          placeholder="Alt text for the image (required before upload)"
                          maxLength={255}
                          disabled={!!sub.image && !wsuaImageFiles[index]}
                        />
                      </div>
                      {wsuaImageFiles[index] && (
                        <Button type="button" onClick={() => uploadWsuaImage(index)} disabled={uploadingWsuaImage === index} size="sm">
                          {uploadingWsuaImage === index ? <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Uploading...</> : "Upload Image"}
                        </Button>
                      )}
                      <div className="flex justify-end">
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeWsuaSubSection(index)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* We Build Section Tab */}
          <TabsContent value="build" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>We Build Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={weBuildSection?.title || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 100) {
                        setWeBuildSection(prev => ({ ...prev, title: value }));
                      }
                    }}
                    placeholder="e.g., What We Build"
                    maxLength={100}
                  />
                  <p className="text-sm text-muted-foreground">
                    {100 - (weBuildSection?.title?.length || 0)} characters remaining
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Section Description</Label>
                  <Textarea
                    value={weBuildSection?.description || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 500) {
                        setWeBuildSection(prev => ({ ...prev, description: value }));
                      }
                    }}
                    placeholder="We build section description"
                    maxLength={500}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    {500 - (weBuildSection?.description?.length || 0)} characters remaining
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Build Points</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addWeBuildSubSection}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Point
                    </Button>
                  </div>

                  {(weBuildSection.sub_sections || []).map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          value={item}
                          onChange={(e) => updateWeBuildSubSection(index, e.target.value)}
                          placeholder={`Build point ${index + 1}`}
                          maxLength={200}
                        />
                      </div>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeWeBuildSubSection(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/industries")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addIndustry.isPending}
                  className="min-w-[120px]"
                >
                  {addIndustry.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Industry
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
