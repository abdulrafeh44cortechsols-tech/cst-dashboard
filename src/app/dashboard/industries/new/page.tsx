"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useIndustries } from "@/hooks/useIndustries";
import { useTags } from "@/hooks/useTags";
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
import { X, Plus, Trash2, Save, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";

interface HeroSubSection {
  title: string;
  count: number;
}

interface ExpertiseSubSection {
  title: string;
  description: string;
}

interface WhatSetsUsApartSubSection {
  title: string;
  description: string;
}

interface WeBuildSubSection {
  description: string;
}

interface IndustrySectionsData {
  hero_section: {
    title: string;
    image_alt_text: string;
    description: string;
    sub_sections: HeroSubSection[];
  };
  challenges_section: {
    title: string;
    description: string;
  };
  expertise_section: {
    title: string;
    description: string;
    sub_sections: ExpertiseSubSection[];
  };
  what_sets_us_apart_section: {
    title: string;
    description: string;
    sub_sections: WhatSetsUsApartSubSection[];
  };
  we_build_section: {
    title: string;
    description: string;
    sub_sections: WeBuildSubSection[];
  };
}

export default function AddIndustryPage() {
  const router = useRouter();
  const { addIndustry } = useIndustries();
  const { getTags } = useTags();
  const { data: tagsResponse } = getTags;
  const tags = tagsResponse?.data;

  // Basic industry fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // Image states
  const [images, setImages] = useState<File[]>([]);
  const [heroSectionImage, setHeroSectionImage] = useState<File | null>(null);
  const [expertiseSectionImages, setExpertiseSectionImages] = useState<File[]>([]);
  const [whatSetsUsApartSectionImages, setWhatSetsUsApartSectionImages] = useState<File[]>([]);

  // Image alt text states for uploaded files (separate from sections_data alt text)
  const [imagesAltTexts, setImagesAltTexts] = useState<string[]>([]);
  const [heroSectionImageAltText, setHeroSectionImageAltText] = useState<string>("");
  const [expertiseSectionImagesAltTexts, setExpertiseSectionImagesAltTexts] = useState<string[]>([]);
  const [whatSetsUsApartSectionImagesAltTexts, setWhatSetsUsApartSectionImagesAltTexts] = useState<string[]>([]);

  // reCAPTCHA verification state
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

  // Error handling state
  const [errors, setErrors] = useState<{
    name?: string;
    slug?: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
    heroSection?: {
      title?: string;
      description?: string;
      image_alt_text?: string;
    };
    challengesSection?: {
      title?: string;
      description?: string;
    };
    expertiseSection?: {
      title?: string;
      description?: string;
      sub_sections?: string;
    };
    whatSetsUsApartSection?: {
      title?: string;
      description?: string;
      sub_sections?: string;
    };
    weBuildSection?: {
      title?: string;
      description?: string;
      sub_sections?: string;
    };
    captcha?: string;
    general?: string;
  }>({});

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
  const validateName = (value: string): string | null => {
    if (!value.trim()) return "Industry name is required";
    if (value.length < 3) return "Name must be at least 3 characters long";
    if (value.length > 100) return "Name must be 100 characters or less";
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

  // Sections data
  const [sectionsData, setSectionsData] = useState<IndustrySectionsData>({
    hero_section: {
      title: "",
      image_alt_text: "",
      description: "",
      sub_sections: [],
    },
    challenges_section: {
      title: "",
      description: "",
    },
    expertise_section: {
      title: "",
      description: "",
      sub_sections: [],
    },
    what_sets_us_apart_section: {
      title: "",
      description: "",
      sub_sections: [],
    },
    we_build_section: {
      title: "",
      description: "",
      sub_sections: [],
    },
  });

  // Draft management
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  const saveDraft = useCallback(() => {
    const draftData = {
      name,
      description,
      slug,
      metaTitle,
      metaDescription,
      isActive,
      selectedTags,
      sectionsData,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("industryDraft", JSON.stringify(draftData));
    setIsDraftSaved(true);
    setLastSaved(new Date());
  }, [name, description, slug, metaTitle, metaDescription, isActive, selectedTags, sectionsData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (name || description || slug) {
        saveDraft();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [name, description, slug, metaTitle, metaDescription, isActive, selectedTags, sectionsData, saveDraft]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("industryDraft");
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setName(draftData.name || "");
        setDescription(draftData.description || "");
        setSlug(draftData.slug || "");
        setMetaTitle(draftData.metaTitle || "");
        setMetaDescription(draftData.metaDescription || "");
        setIsActive(draftData.isActive ?? true);
        setSelectedTags(draftData.selectedTags || []);
        setSectionsData(draftData.sectionsData || sectionsData);
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

  // Helper functions for different sections
  const updateSection = (sectionKey: keyof IndustrySectionsData, field: string, value: string) => {
    setSectionsData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  };

  // Hero Section helpers
  const addHeroSubSection = () => {
    setSectionsData(prev => ({
      ...prev,
      hero_section: {
        ...prev.hero_section,
        sub_sections: [...prev.hero_section.sub_sections, { title: "", count: 0 }],
      },
    }));
  };

  const removeHeroSubSection = (index: number) => {
    setSectionsData(prev => ({
      ...prev,
      hero_section: {
        ...prev.hero_section,
        sub_sections: prev.hero_section.sub_sections.filter((_, i) => i !== index),
      },
    }));
  };

  const updateHeroSubSection = (index: number, field: string, value: string | number) => {
    setSectionsData(prev => ({
      ...prev,
      hero_section: {
        ...prev.hero_section,
        sub_sections: prev.hero_section.sub_sections.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  // Expertise Section helpers
  const addExpertiseSubSection = () => {
    setSectionsData(prev => ({
      ...prev,
      expertise_section: {
        ...prev.expertise_section,
        sub_sections: [...prev.expertise_section.sub_sections, { title: "", description: "" }],
      },
    }));
  };

  const removeExpertiseSubSection = (index: number) => {
    setSectionsData(prev => ({
      ...prev,
      expertise_section: {
        ...prev.expertise_section,
        sub_sections: prev.expertise_section.sub_sections.filter((_, i) => i !== index),
      },
    }));
  };

  const updateExpertiseSubSection = (index: number, field: string, value: string) => {
    setSectionsData(prev => ({
      ...prev,
      expertise_section: {
        ...prev.expertise_section,
        sub_sections: prev.expertise_section.sub_sections.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  // What Sets Us Apart Section helpers
  const addWhatSetsUsApartSubSection = () => {
    setSectionsData(prev => ({
      ...prev,
      what_sets_us_apart_section: {
        ...prev.what_sets_us_apart_section,
        sub_sections: [...prev.what_sets_us_apart_section.sub_sections, { title: "", description: "" }],
      },
    }));
  };

  const removeWhatSetsUsApartSubSection = (index: number) => {
    setSectionsData(prev => ({
      ...prev,
      what_sets_us_apart_section: {
        ...prev.what_sets_us_apart_section,
        sub_sections: prev.what_sets_us_apart_section.sub_sections.filter((_, i) => i !== index),
      },
    }));
  };

  const updateWhatSetsUsApartSubSection = (index: number, field: string, value: string) => {
    setSectionsData(prev => ({
      ...prev,
      what_sets_us_apart_section: {
        ...prev.what_sets_us_apart_section,
        sub_sections: prev.what_sets_us_apart_section.sub_sections.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  // We Build Section helpers
  const addWeBuildSubSection = () => {
    setSectionsData(prev => ({
      ...prev,
      we_build_section: {
        ...prev.we_build_section,
        sub_sections: [...prev.we_build_section.sub_sections, { description: "" }],
      },
    }));
  };

  const removeWeBuildSubSection = (index: number) => {
    setSectionsData(prev => ({
      ...prev,
      we_build_section: {
        ...prev.we_build_section,
        sub_sections: prev.we_build_section.sub_sections.filter((_, i) => i !== index),
      },
    }));
  };

  const updateWeBuildSubSection = (index: number, field: string, value: string) => {
    setSectionsData(prev => ({
      ...prev,
      we_build_section: {
        ...prev.we_build_section,
        sub_sections: prev.we_build_section.sub_sections.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  // File handlers
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(filesArray);
      // Initialize alt text array for main images
      setImagesAltTexts(new Array(filesArray.length).fill(""));
    }
  };

  const handleHeroSectionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroSectionImage(e.target.files[0]);
      // Initialize alt text for hero section image
      setHeroSectionImageAltText("");
    }
  };

  const handleExpertiseSectionImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setExpertiseSectionImages(filesArray);
      // Initialize alt text array for expertise images
      setExpertiseSectionImagesAltTexts(new Array(filesArray.length).fill(""));
    }
  };

  const handleWhatSetsUsApartSectionImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setWhatSetsUsApartSectionImages(filesArray);
      // Initialize alt text array for what sets us apart images
      setWhatSetsUsApartSectionImagesAltTexts(new Array(filesArray.length).fill(""));
    }
  };

  function onCaptchaChange(value: string | null) {
    setCaptchaValue(value);
    setCaptchaVerified(!!value);
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  useEffect(() => {
    if (name && !slug) {
      setSlug(generateSlug(name));
    }
  }, [name, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!captchaVerified) {
      toast.error("Please complete the reCAPTCHA verification.");
      return;
    }

    try {
      const formData = new FormData();

      // Basic fields
      formData.append("name", name);
      formData.append("description", description);
      formData.append("slug", slug);
      formData.append("meta_title", metaTitle);
      formData.append("meta_description", metaDescription);
      formData.append("is_active", isActive.toString());

      // Add images
      images.forEach((file) => {
        formData.append("images", file);
      });

      // Add main images alt texts
      if (imagesAltTexts.length > 0) {
        formData.append("images_alt_text", JSON.stringify(imagesAltTexts));
      }

      // Add hero section image
      if (heroSectionImage) {
        formData.append("hero_section_image", heroSectionImage);
      }

      // Add hero section image alt text
      if (heroSectionImageAltText) {
        formData.append("hero_section_image_alt_text", heroSectionImageAltText);
      }

      // Add expertise section images
      expertiseSectionImages.forEach((file) => {
        formData.append("expertise_section_images", file);
      });

      // Add expertise section images alt texts
      if (expertiseSectionImagesAltTexts.length > 0) {
        formData.append("expertise_section_images_alt_text", JSON.stringify(expertiseSectionImagesAltTexts));
      }

      // Add what sets us apart section images
      whatSetsUsApartSectionImages.forEach((file) => {
        formData.append("what_sets_us_apart_section_images", file);
      });

      // Add what sets us apart section images alt texts
      if (whatSetsUsApartSectionImagesAltTexts.length > 0) {
        formData.append("what_sets_us_apart_section_images_alt_text", JSON.stringify(whatSetsUsApartSectionImagesAltTexts));
      }

      // Add sections data (convert challenge points back to comma-separated)
      const sectionsDataForAPI = {
        ...sectionsData,
        challenges_section: {
          ...sectionsData.challenges_section,
          description: sectionsData.challenges_section.description
            ? sectionsData.challenges_section.description.split("|||").filter(p => p.trim()).join(", ")
            : ""
        }
      };
      formData.append("sections_data", JSON.stringify(sectionsDataForAPI));

      // Add selected tags
      if (selectedTags.length > 0) {
        formData.append("tag_ids", JSON.stringify(selectedTags));
      }

      await addIndustry.mutateAsync(formData);
      toast.success("Industry created successfully!");
      clearDraft();
      router.push("/dashboard/industries");
    } catch (error: any) {
      toast.error("Failed to create industry. Please try again.");
      console.error("Industry creation error:", error);
    }
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const getFilePreview = (file: File) => {
    return URL.createObjectURL(file);
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
                    <Label htmlFor="name">Industry Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setName(value);
                        // Auto-generate slug in real-time as user types
                        if (value.trim()) {
                          setSlug(generateSlug(value));
                        } else {
                          setSlug("");
                        }
                        const error = validateName(value);
                        if (error) {
                          setError('name', error);
                        } else {
                          clearError('name');
                        }
                      }}
                      onBlur={() => {
                        const error = validateName(name);
                        if (error) {
                          setError('name', error);
                        }
                      }}
                      placeholder="Enter industry name"
                      maxLength={100}
                      required
                      className={`${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <p className={`text-sm ${errors.name ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {errors.name || `${100 - name.length} characters remaining`}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 40) {
                          setSlug(value);
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
                      placeholder="industry-slug"
                      maxLength={40}
                      required
                      className={`${errors.slug ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <p className="text-sm text-muted-foreground">
                      Auto-generated from industry name • URL-friendly identifier
                    </p>
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
                      if (description.length < 10) {
                        setError('description', 'Description must be at least 10 characters long');
                      }
                      else{
                        clearError('description');
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
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={metaTitle}
                      onChange={(e) => {
                        const value = e.target.value;
                        setMetaTitle(value);
                        // Real-time validation and error clearing
                        const error = validateMetaTitle(value);
                        if (error) {
                          setError('metaTitle', error);
                        } else {
                          clearError('metaTitle');
                        }
                      }}
                      onBlur={() => {
                        // Additional validation on blur if needed
                        const error = validateMetaTitle(metaTitle);
                        if (error) {
                          setError('metaTitle', error);
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
                    <Label htmlFor="metaDescription">Meta Description</Label>
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
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="space-y-2">
                  <Label>Main Industry Images</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImagesChange}
                    className="cursor-pointer"
                  />
                  {images.length > 0 && (
                    <div className="space-y-4 mt-2">
                      {images.map((file, index) => (
                        <div key={index} className="space-y-2 p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <img
                              src={getFilePreview(file)}
                              alt={`Industry image ${index + 1}`}
                              className="h-20 w-20 rounded border object-cover flex-shrink-0"
                            />
                            <div className="flex-1 space-y-2">
                              <p className="text-xs text-gray-600 truncate">
                                {file.name}
                              </p>
                              <div>
                                <Label htmlFor={`imageAlt${index}`}>Alt Text</Label>
                                <Input
                                  id={`imageAlt${index}`}
                                  value={imagesAltTexts[index] || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.length <= 255) {
                                      const newAltTexts = [...imagesAltTexts];
                                      newAltTexts[index] = value;
                                      setImagesAltTexts(newAltTexts);
                                    }
                                  }}
                                  placeholder={`Alt text for industry image ${index + 1}`}
                                  maxLength={255}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {255 - (imagesAltTexts[index]?.length || 0)} characters remaining
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {tags && tags.length > 0 && (
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hero Section Tab */}
          <TabsContent value="hero" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={sectionsData.hero_section.title}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSection("hero_section", "title", value);
                        // Real-time validation and error clearing
                        if (value.length < 1) {
                          setError('heroSection.title', 'Hero title must be 1 characters or more');
                        } else {
                          clearError('heroSection.title');
                        }
                      }}
                      onBlur={() => {
                        // Additional validation on blur if needed
                        const title = sectionsData.hero_section.title;
                        if (title.length < 1) {
                          setError('heroSection.title', 'Hero title must be 1 characters or more');
                        }
                      }}
                      placeholder="Hero section title"
                      maxLength={100}
                      className={`${errors.heroSection?.title ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <p className={`text-sm ${errors.heroSection?.title ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {errors.heroSection?.title || `${100 - (sectionsData.hero_section.title?.length || 0)} characters remaining`}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Hero Content Alt Text (for sections_data)</Label>
                    <Input
                      value={sectionsData.hero_section.image_alt_text}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSection("hero_section", "image_alt_text", value);
                        // Clear error when user starts typing
                        // Note: Image alt text validation would go here if needed
                      }}
                      onBlur={() => {
                        // Validate on blur if needed
                        if (sectionsData.hero_section.image_alt_text.length > 255) {
                          // Set error if alt text is too long
                        }
                      }}
                      placeholder="Alt text for hero content (stored in sections_data)"
                      maxLength={255}
                      className={`${errors.heroSection?.image_alt_text ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <p className={`text-sm ${errors.heroSection?.image_alt_text ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {errors.heroSection?.image_alt_text || `${255 - (sectionsData.hero_section.image_alt_text?.length || 0)} characters remaining`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={sectionsData.hero_section.description}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateSection("hero_section", "description", value);
                      // Real-time validation and error clearing
                      if (value.length < 10) {
                        setError('heroSection.description', 'Hero description must be at least 10 characters long');
                      } else {
                        clearError('heroSection.description');
                      }
                    }}
                    onBlur={() => {
                      // Additional validation on blur if needed
                      const description = sectionsData.hero_section.description;
                      if (description.length < 10) {
                        setError('heroSection.description', 'Hero description must be at least 10 characters long');
                      }
                    }}
                    placeholder="Hero section description"
                    maxLength={500}
                    rows={3}
                    className={`${errors.heroSection?.description ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  <p className={`text-sm ${errors.heroSection?.description ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {errors.heroSection?.description || `${500 - (sectionsData.hero_section.description?.length || 0)} characters remaining`}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Hero Section Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroSectionImageChange}
                    className="cursor-pointer"
                  />
                  {heroSectionImage && (
                    <div className="space-y-2 p-3 border rounded-lg">
                      <img
                        src={getFilePreview(heroSectionImage)}
                        alt="Hero section preview"
                        className="h-32 w-48 rounded border object-cover"
                      />
                      <div>
                        <Label htmlFor="heroImageAlt">Uploaded Hero Image Alt Text</Label>
                        <Input
                          id="heroImageAlt"
                          value={heroSectionImageAltText}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 255) {
                              setHeroSectionImageAltText(value);
                            }
                          }}
                          placeholder="Alt text for the uploaded hero section image file"
                          maxLength={255}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {255 - heroSectionImageAltText.length} characters remaining
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Statistics Sub-sections</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addHeroSubSection}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Statistic
                    </Button>
                  </div>

                  {sectionsData.hero_section.sub_sections.map((subSection, index) => (
                    <div key={index} className="grid gap-4 p-4 border rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={subSection.title}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 50) {
                                updateHeroSubSection(index, "title", value);
                              }
                            }}
                            placeholder="Statistic title"
                            maxLength={50}
                          />
                          <p className="text-sm text-muted-foreground">
                            {50 - (subSection.title?.length || 0)} characters remaining
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Count</Label>
                          <Input
                            type="number"
                            value={subSection.count}
                            onChange={(e) => {
                              updateHeroSubSection(index, "count", parseInt(e.target.value) || 0);
                            }}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeHeroSubSection(index)}
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
                  <Label>Title</Label>
                  <Input
                    value={sectionsData.challenges_section.title}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateSection("challenges_section", "title", value);
                      // Real-time validation and error clearing
                      if (value.length < 10) {
                        setError('challengesSection.title', 'Challenges title must be 10 characters or more');
                      } else {
                        clearError('challengesSection.title');
                      }
                    }}
                    onBlur={() => {
                      // Additional validation on blur if needed
                      const title = sectionsData.challenges_section.title;
                      if (title.length < 10) {
                        setError('challengesSection.title', 'Challenges title must be 10 characters or more');
                      } else {
                        clearError('challengesSection.title');
                      }
                    }}
                    placeholder="Challenges section title"
                    maxLength={100}
                    className={`${errors.challengesSection?.title ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  <p className={`text-sm ${errors.challengesSection?.title ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {errors.challengesSection?.title || `${100 - (sectionsData.challenges_section.title?.length || 0)} characters remaining`}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={sectionsData.challenges_section.description}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateSection("challenges_section", "description", value);
                      // Clear error when user starts typing
                      // Note: Description validation would go here if needed
                    }}
                    onBlur={() => {
                      // Validate on blur if needed
                      if (sectionsData.challenges_section.description.length < 10) {
                        setError('challengesSection.description', 'Description must be 10 characters or more');
                      }
                    }}
                    placeholder="Challenges section description"
                    maxLength={500}
                    rows={3}
                    className={`${errors.challengesSection?.description ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  <p className={`text-sm ${errors.challengesSection?.description ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {errors.challengesSection?.description || `${500 - (sectionsData.challenges_section.description?.length || 0)} characters remaining`}
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentDescription = sectionsData.challenges_section.description || "";
                      const points = currentDescription ? currentDescription.split("|||") : [];
                      points.push("");
                      updateSection("challenges_section", "description", points.join("|||"));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Challenge Point
                  </Button>
                </div>

                {(() => {
                  const currentDescription = sectionsData.challenges_section.description || "";
                  const points = currentDescription ? currentDescription.split("|||") : [""];
                  const displayPoints = points.length === 0 ? [""] : points;

                  return displayPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          value={point}
                          onChange={(e) => {
                            const newPoints = [...displayPoints];
                            newPoints[index] = e.target.value;
                            updateSection("challenges_section", "description", newPoints.join("|||"));
                            // Real-time validation and error clearing
                            if (e.target.value.length > 200) {
                              setError(`challengesSection.description`, `Challenge point ${index + 1} must be 200 characters or less`);
                            } else {
                              clearError(`challengesSection.description`);
                            }
                          }}
                          onBlur={() => {
                            // Additional validation on blur if needed
                            if (point.length > 200) {
                              setError(`challengesSection.description`, `Challenge point ${index + 1} must be 200 characters or less`);
                            }
                          }}
                          placeholder={`Challenge point ${index + 1}`}
                          maxLength={200}
                          className={`${errors.challengesSection?.description ? 'border-red-500 focus:border-red-500' : ''}`}
                        />
                        <p className={`text-xs ${errors.challengesSection?.description ? 'text-red-600' : 'text-muted-foreground'} mt-1`}>
                          {errors.challengesSection?.description || `${200 - point.length} characters remaining`}
                        </p>
                      </div>
                      {displayPoints.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const newPoints = displayPoints.filter((_, i) => i !== index);
                            updateSection("challenges_section", "description", newPoints.join("|||"));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ));
                })()}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={sectionsData.expertise_section.title}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSection("expertise_section", "title", value);
                        // Real-time validation and error clearing
                        if (value.length < 10) {
                          setError('expertiseSection.title', 'Expertise title must be 10 characters or more');
                        } else {
                          clearError('expertiseSection.title');
                        }
                      }}
                      onBlur={() => {
                        // Additional validation on blur if needed
                        const title = sectionsData.expertise_section.title;
                        if (title.length < 10) {
                          setError('expertiseSection.title', 'Expertise title must be 10 characters or more');
                        }
                      }}
                      placeholder="Expertise section title"
                      maxLength={100}
                      className={`${errors.expertiseSection?.title ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <p className={`text-sm ${errors.expertiseSection?.title ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {errors.expertiseSection?.title || `${100 - (sectionsData.expertise_section.title?.length || 0)} characters remaining`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={sectionsData.expertise_section.description}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateSection("expertise_section", "description", value);
                      // Real-time validation and error clearing
                      if (value.length < 10) {
                        setError('expertiseSection.description', 'Description must be 10 characters or more');
                      } else {
                        clearError('expertiseSection.description');
                      }
                    }}
                    onBlur={() => {
                      // Additional validation on blur if needed
                      const description = sectionsData.expertise_section.description;
                      if (description.length < 10) {
                        setError('expertiseSection.description', 'Description must be 10 characters or more');
                      }
                    }}
                    placeholder="Expertise section description"
                    maxLength={500}
                    rows={3}
                    className={`${errors.expertiseSection?.description ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  <p className={`text-sm ${errors.expertiseSection?.description ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {errors.expertiseSection?.description || `${500 - (sectionsData.expertise_section.description?.length || 0)} characters remaining`}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Expertise Section Images</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleExpertiseSectionImagesChange}
                    className="cursor-pointer"
                  />
                  {expertiseSectionImages.length > 0 && (
                    <div className="space-y-4 mt-2">
                      {expertiseSectionImages.map((file, index) => (
                        <div key={index} className="space-y-2 p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <img
                              src={getFilePreview(file)}
                              alt={`Expertise image ${index + 1}`}
                              className="h-20 w-20 rounded border object-cover flex-shrink-0"
                            />
                            <div className="flex-1 space-y-2">
                              <p className="text-xs text-gray-600 truncate">
                                {file.name}
                              </p>
                              <div>
                                <Label htmlFor={`expertiseAlt${index}`} className="mb-2">Alt Text</Label>
                                <Input
                                  id={`expertiseAlt${index}`}
                                  value={expertiseSectionImagesAltTexts[index] || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.length <= 255) {
                                      const newAltTexts = [...expertiseSectionImagesAltTexts];
                                      newAltTexts[index] = value;
                                      setExpertiseSectionImagesAltTexts(newAltTexts);
                                    }
                                  }}
                                  placeholder={`Alt text for expertise image ${index + 1}`}
                                  maxLength={255}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {255 - (expertiseSectionImagesAltTexts[index]?.length || 0)} characters remaining
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Expertise Sub-sections</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addExpertiseSubSection}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expertise
                    </Button>
                  </div>

                  {sectionsData.expertise_section.sub_sections.map((subSection, index) => (
                    <div key={index} className="grid gap-4 p-4 border rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={subSection.title}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateExpertiseSubSection(index, "title", value);
                              // Real-time validation and error clearing
                              if (value.length < 10) {
                                setError(`expertiseSection.sub_sections`, `Expertise title ${index + 1} must be 10 characters or more`);
                              } else {
                                clearError(`expertiseSection.sub_sections`);
                              }
                            }}
                            onBlur={() => {
                              // Additional validation on blur if needed
                              if (subSection.title.length < 10) {
                                setError(`expertiseSection.sub_sections`, `Expertise title ${index + 1} must be 10 characters or more`);
                              }
                            }}
                            placeholder="Expertise title"
                            maxLength={100}
                            className={`${errors.expertiseSection?.sub_sections ? 'border-red-500 focus:border-red-500' : ''}`}
                          />
                          <p className={`text-sm ${errors.expertiseSection?.sub_sections ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {errors.expertiseSection?.sub_sections || `${100 - (subSection.title?.length || 0)} characters remaining`}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={subSection.description}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateExpertiseSubSection(index, "description", value);
                            // Real-time validation and error clearing
                            if (value.length < 10) {
                              setError(`expertiseSection.sub_sections`, `Expertise description ${index + 1} must be 10 characters or more`);
                            } else {
                              clearError(`expertiseSection.sub_sections`);
                            }
                          }}
                          onBlur={() => {
                            // Additional validation on blur if needed
                            if (subSection.description.length < 10) {
                              setError(`expertiseSection.sub_sections`, `Expertise description ${index + 1} must be 10 characters or more`);
                            }
                          }}
                          placeholder="Expertise description"
                          maxLength={500}
                          rows={3}
                          className={`${errors.expertiseSection?.sub_sections ? 'border-red-500 focus:border-red-500' : ''}`}
                        />
                        <p className={`text-sm ${errors.expertiseSection?.sub_sections ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {errors.expertiseSection?.sub_sections || `${500 - (subSection.description?.length || 0)} characters remaining`}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeExpertiseSubSection(index)}
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

          {/* What Sets Us Apart Section Tab */}
          <TabsContent value="apart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>What Sets Us Apart Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={sectionsData.what_sets_us_apart_section.title}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSection("what_sets_us_apart_section", "title", value);
                        if (value.length < 10) {
                          setError('whatSetsUsApartSection.title', 'What sets us apart title must be 10 characters or more');
                        } else {
                          clearError('whatSetsUsApartSection.title');
                        }
                      }}
                      onBlur={() => {
                        const title = sectionsData.what_sets_us_apart_section.title;
                        if (title.length < 10) {
                          setError('whatSetsUsApartSection.title', 'What sets us apart title must be 10 characters or more');
                        } else {
                          clearError('whatSetsUsApartSection.title');
                        }
                      }}
                      placeholder="What sets us apart title"
                      maxLength={100}
                      className={`${errors.whatSetsUsApartSection?.title ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <p className={`text-sm ${errors.whatSetsUsApartSection?.title ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {errors.whatSetsUsApartSection?.title || `${100 - (sectionsData.what_sets_us_apart_section.title?.length || 0)} characters remaining`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={sectionsData.what_sets_us_apart_section.description}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateSection("what_sets_us_apart_section", "description", value);
                      if (value.length < 10) {
                        setError('whatSetsUsApartSection.description', 'Description must be 10 characters or more');
                      } else {
                        clearError('whatSetsUsApartSection.description');
                      }
                    }}
                    onBlur={() => {
                      const description = sectionsData.what_sets_us_apart_section.description;
                      if (description.length < 10) {
                        setError('whatSetsUsApartSection.description', 'Description must be 10 characters or more');
                      } else {
                        clearError('whatSetsUsApartSection.description');
                      }
                    }}
                    placeholder="What sets us apart description"
                    maxLength={500}
                    rows={3}
                    className={`${errors.whatSetsUsApartSection?.description ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  <p className={`text-sm ${errors.whatSetsUsApartSection?.description ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {errors.whatSetsUsApartSection?.description || `${500 - (sectionsData.what_sets_us_apart_section.description?.length || 0)} characters remaining`}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>What Sets Us Apart Images</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleWhatSetsUsApartSectionImagesChange}
                    className="cursor-pointer"
                  />
                  {whatSetsUsApartSectionImages.length > 0 && (
                    <div className="space-y-4 mt-2">
                      {whatSetsUsApartSectionImages.map((file, index) => (
                        <div key={index} className="space-y-2 p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <img
                              src={getFilePreview(file)}
                              alt={`What sets us apart image ${index + 1}`}
                              className="h-20 w-20 rounded border object-cover flex-shrink-0"
                            />
                            <div className="flex-1 space-y-2">
                              <p className="text-xs text-gray-600 truncate">
                                {file.name}
                              </p>
                              <div>
                                <Label htmlFor={`apartAlt${index}`}>Alt Text</Label>
                                <Input
                                  id={`apartAlt${index}`}
                                  value={whatSetsUsApartSectionImagesAltTexts[index] || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.length <= 255) {
                                      const newAltTexts = [...whatSetsUsApartSectionImagesAltTexts];
                                      newAltTexts[index] = value;
                                      setWhatSetsUsApartSectionImagesAltTexts(newAltTexts);
                                    }
                                  }}
                                  placeholder={`Alt text for what sets us apart image ${index + 1}`}
                                  maxLength={255}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {255 - (whatSetsUsApartSectionImagesAltTexts[index]?.length || 0)} characters remaining
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>What Sets Us Apart Sub-sections</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addWhatSetsUsApartSubSection}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Point
                    </Button>
                  </div>

                  {sectionsData.what_sets_us_apart_section.sub_sections.map((subSection, index) => (
                    <div key={index} className="grid gap-4 p-4 border rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={subSection.title}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateWhatSetsUsApartSubSection(index, "title", value);
                              if (value.length < 10) {
                                setError(`whatSetsUsApartSection.sub_sections`, `Point title ${index + 1} must be 10 characters or more`);
                              } else {
                                clearError(`whatSetsUsApartSection.sub_sections`);
                              }
                            }}
                            onBlur={() => {
                              if (subSection.title.length < 10) {
                                setError(`whatSetsUsApartSection.sub_sections`, `Point title ${index + 1} must be 10 characters or more`);
                              } else {
                                clearError(`whatSetsUsApartSection.sub_sections`);
                              }
                            }}
                            placeholder="Point title"
                            maxLength={100}
                            className={`${errors.whatSetsUsApartSection?.sub_sections ? 'border-red-500 focus:border-red-500' : ''}`}
                          />
                          <p className={`text-sm ${errors.whatSetsUsApartSection?.sub_sections ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {errors.whatSetsUsApartSection?.sub_sections || `${100 - (subSection.title?.length || 0)} characters remaining`}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={subSection.description}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateWhatSetsUsApartSubSection(index, "description", value);
                            if (value.length < 10) {
                              setError(`whatSetsUsApartSection.sub_sections`, `Point description ${index + 1} must be 10 characters or more`);
                            } else {
                              clearError(`whatSetsUsApartSection.sub_sections`);
                            }
                          }}
                          onBlur={() => {
                            if (subSection.description.length < 10) {
                              setError(`whatSetsUsApartSection.sub_sections`, `Point description ${index + 1} must be 10 characters or more`);
                            } else {
                              clearError(`whatSetsUsApartSection.sub_sections`);
                            }
                          }}
                          placeholder="Point description"
                          maxLength={500}
                          rows={3}
                          className={`${errors.whatSetsUsApartSection?.sub_sections ? 'border-red-500 focus:border-red-500' : ''}`}
                        />
                        <p className={`text-sm ${errors.whatSetsUsApartSection?.sub_sections ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {errors.whatSetsUsApartSection?.sub_sections || `${500 - (subSection.description?.length || 0)} characters remaining`}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeWhatSetsUsApartSubSection(index)}
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

          {/* We Build Section Tab */}
          <TabsContent value="build" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>We Build Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={sectionsData.we_build_section.title}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSection("we_build_section", "title", value);
                        if (value.length < 10) {
                          setError('weBuildSection.title', 'We build title must be 10 characters or more');
                        } else {
                          clearError('weBuildSection.title');
                        }
                      }}
                      onBlur={() => {
                        const title = sectionsData.we_build_section.title;
                        if (title.length < 10) {
                          setError('weBuildSection.title', 'We build title must be 10 characters or more');
                        } else {
                          clearError('weBuildSection.title');
                        }
                      }}
                      placeholder="We build section title"
                      maxLength={100}
                      className={`${errors.weBuildSection?.title ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <p className={`text-sm ${errors.weBuildSection?.title ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {errors.weBuildSection?.title || `${100 - (sectionsData.we_build_section.title?.length || 0)} characters remaining`}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={sectionsData.we_build_section.description}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSection("we_build_section", "description", value);
                        if (value.length < 10) {
                          setError('weBuildSection.description', 'Description must be 10 characters or more');
                        } else {
                          clearError('weBuildSection.description');
                        }
                      }}
                      onBlur={() => {
                        const description = sectionsData.we_build_section.description;
                        if (description.length < 10) {
                          setError('weBuildSection.description', 'Description must be 10 characters or more');
                        } else {
                          clearError('weBuildSection.description');
                        }
                      }}
                      placeholder="We build section description"
                      maxLength={500}
                      rows={3}
                      className={`${errors.weBuildSection?.description ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <p className={`text-sm ${errors.weBuildSection?.description ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {errors.weBuildSection?.description || `${500 - (sectionsData.we_build_section.description?.length || 0)} characters remaining`}
                    </p>
                  </div>
                </div>
                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>We Build Sub-sections</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addWeBuildSubSection}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Build Item
                    </Button>
                  </div>

                  {sectionsData.we_build_section.sub_sections.map((subSection, index) => (
                    <div key={index} className="grid gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={subSection.description}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateWeBuildSubSection(index, "description", value);
                            if (value.length < 10) {
                              setError(`weBuildSection.sub_sections`, `Build item description ${index + 1} must be 10 characters or more`);
                            } else {
                              clearError(`weBuildSection.sub_sections`);
                            }
                          }}
                          onBlur={() => {
                            if (subSection.description.length < 10) {
                              setError(`weBuildSection.sub_sections`, `Build item description ${index + 1} must be 10 characters or more`);
                            } else {
                              clearError(`weBuildSection.sub_sections`);
                            }
                          }}
                          placeholder="What we build description"
                          maxLength={500}
                          rows={3}
                          className={`${errors.weBuildSection?.sub_sections ? 'border-red-500 focus:border-red-500' : ''}`}
                        />
                        <p className={`text-sm ${errors.weBuildSection?.sub_sections ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {errors.weBuildSection?.sub_sections || `${500 - (subSection.description?.length || 0)} characters remaining`}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeWeBuildSubSection(index)}
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
        </Tabs>

        {/* reCAPTCHA and Submit */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_URL  || ""}
                onChange={onCaptchaChange}
              />
              
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
                  disabled={addIndustry.isPending || !captchaVerified}
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
