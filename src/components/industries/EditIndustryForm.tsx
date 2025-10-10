"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIndustries } from "@/hooks/useIndustries";
import { useTags } from "@/hooks/useTags";
import type { Industry, Tag } from "@/types/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditIndustryFormProps {
  industry: Industry | null;
  onCancel?: () => void;
  onSaved?: () => void;
}

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

// Extracted from EditIndustryModal to reuse on a full page without changing logic
export function EditIndustryForm({ industry, onCancel, onSaved }: EditIndustryFormProps) {
  const { editIndustry } = useIndustries();

  console.log(industry, "industry data from API");
  const { getTags } = useTags();

  // Basic fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

// Image states for existing images from backend
const [existingImages, setExistingImages] = useState<string[]>([]);
const [existingHeroImage, setExistingHeroImage] = useState<string | null>(null);
const [existingExpertiseImages, setExistingExpertiseImages] = useState<string[]>([]);
const [existingWhatSetsUsApartImages, setExistingWhatSetsUsApartImages] = useState<string[]>([]);

// Image alt text states for existing images
const [existingImagesAltTexts, setExistingImagesAltTexts] = useState<string[]>([]);
const [existingHeroImageAltText, setExistingHeroImageAltText] = useState<string>("");
const [existingExpertiseImagesAltTexts, setExistingExpertiseImagesAltTexts] = useState<string[]>([]);
const [existingWhatSetsUsApartImagesAltTexts, setExistingWhatSetsUsApartImagesAltTexts] = useState<string[]>([]);

// Image states for new uploads (separate from existing images)
const [images, setImages] = useState<File[]>([]);
const [heroSectionImage, setHeroSectionImage] = useState<File | null>(null);
const [expertiseSectionImages, setExpertiseSectionImages] = useState<File[]>([]);
const [whatSetsUsApartSectionImages, setWhatSetsUsApartSectionImages] = useState<File[]>([]);

// Image alt text states for new uploads
const [imagesAltTexts, setImagesAltTexts] = useState<string[]>([]);
const [heroSectionImageAltText, setHeroSectionImageAltText] = useState<string>("");
const [expertiseSectionImagesAltTexts, setExpertiseSectionImagesAltTexts] = useState<string[]>([]);
const [whatSetsUsApartSectionImagesAltTexts, setWhatSetsUsApartSectionImagesAltTexts] = useState<string[]>([]);

  // Error handling state (similar to create form)
  const [errors, setErrors] = useState<{
    name?: string;
    slug?: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
    general?: string;
  }>({});

  // reCAPTCHA verification state
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

  // Validation functions (same as create form)
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

  // Get tags data safely
  const tags = getTags.data?.data;

  useEffect(() => {
    if (industry) {
      console.log("Populating form with industry data:", industry);

      setName(industry.name || "");
      setDescription(industry.description || "");
      setSlug(industry.slug || "");
      setMetaTitle(industry.meta_title || "");
      setMetaDescription(industry.meta_description || "");
      setIsActive(industry.is_active ?? true); // Changed from industry.published to industry.is_active
      setSelectedTags(industry.tags?.map(tag => tag.id) || []);

      // Load existing main images
      if (industry.images && industry.images.length > 0) {
        console.log("Loading existing images:", industry.images);
        setExistingImages(industry.images);
        // Initialize alt text arrays for existing images
        setExistingImagesAltTexts(new Array(industry.images.length).fill(""));
      } else {
        console.log("No existing images found in industry data");
      }

      // Load sections data from industry if available (API returns 'sections')
      if ((industry as any).sections) {
        const apiSectionsData = (industry as any).sections;
        console.log("Loading sections data:", apiSectionsData);

        // Convert challenges description from comma-separated to ||| separated for UI
        if (apiSectionsData.challenges_section?.description) {
          const challengesDescription = apiSectionsData.challenges_section.description
            .split(",")
            .map((p: string) => p.trim())
            .filter((p: string) => p)
            .join("|||");
          apiSectionsData.challenges_section.description = challengesDescription;
        }

        setSectionsData(apiSectionsData as IndustrySectionsData);

        // Load existing section images
        if (apiSectionsData.hero_section?.image) {
          // Convert relative path to full URL if needed
          const heroImageUrl = apiSectionsData.hero_section.image.startsWith('http')
            ? apiSectionsData.hero_section.image
            : `${window.location.origin}${apiSectionsData.hero_section.image}`;
          setExistingHeroImage(heroImageUrl);
          setExistingHeroImageAltText(apiSectionsData.hero_section.image_alt_text || "");
        }

        if (apiSectionsData.expertise_section?.sub_sections) {
          const expertiseImages = apiSectionsData.expertise_section.sub_sections
            .filter((sub: any) => sub.image)
            .map((sub: any) => {
              // Convert relative path to full URL if needed
              return sub.image.startsWith('http')
                ? sub.image
                : `${window.location.origin}${sub.image}`;
            });
          setExistingExpertiseImages(expertiseImages);
          setExistingExpertiseImagesAltTexts(
            apiSectionsData.expertise_section.sub_sections
              .filter((sub: any) => sub.image)
              .map((sub: any) => sub.image_alt_text || "")
          );
        }

        if (apiSectionsData.what_sets_us_apart_section?.sub_sections) {
          const wsuaImages = apiSectionsData.what_sets_us_apart_section.sub_sections
            .filter((sub: any) => sub.image)
            .map((sub: any) => {
              // Convert relative path to full URL if needed
              return sub.image.startsWith('http')
                ? sub.image
                : `${window.location.origin}${sub.image}`;
            });
          setExistingWhatSetsUsApartImages(wsuaImages);
          setExistingWhatSetsUsApartImagesAltTexts(
            apiSectionsData.what_sets_us_apart_section.sub_sections
              .filter((sub: any) => sub.image)
              .map((sub: any) => sub.image_alt_text || "")
          );
        }
      } else {
        // Reset sections data if no existing data
        setSectionsData({
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
      }
    }
  }, [industry]);

  function onCaptchaChange(value: string | null) {
    setCaptchaValue(value);
    setCaptchaVerified(!!value);
  }

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
      // Initialize alt text array for new images
      setImagesAltTexts(new Array(filesArray.length).fill(""));
    }
  };

  const handleHeroSectionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroSectionImage(e.target.files[0]);
      // Initialize alt text for new hero section image
      setHeroSectionImageAltText("");
    }
  };

  const handleExpertiseSectionImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setExpertiseSectionImages(filesArray);
      // Initialize alt text array for new expertise images
      setExpertiseSectionImagesAltTexts(new Array(filesArray.length).fill(""));
    }
  };

  const handleWhatSetsUsApartSectionImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setWhatSetsUsApartSectionImages(filesArray);
      // Initialize alt text array for new what sets us apart images
      setWhatSetsUsApartSectionImagesAltTexts(new Array(filesArray.length).fill(""));
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

  const handleSave = async () => {
    if (!industry) return;

    // Clear previous errors
    setErrors({});

    // Validate all required fields
    const nameError = validateName(name);
    const slugError = validateSlug(slug);
    const descriptionError = validateDescription(description);
    const metaTitleError = validateMetaTitle(metaTitle);
    const metaDescriptionError = validateMetaDescription(metaDescription);

    // Set errors if any validation fails
    if (nameError) setErrors(prev => ({ ...prev, name: nameError }));
    if (slugError) setErrors(prev => ({ ...prev, slug: slugError }));
    if (descriptionError) setErrors(prev => ({ ...prev, description: descriptionError }));
    if (metaTitleError) setErrors(prev => ({ ...prev, metaTitle: metaTitleError }));
    if (metaDescriptionError) setErrors(prev => ({ ...prev, metaDescription: metaDescriptionError }));

    // Check if there are any errors
    if (nameError || slugError || descriptionError || metaTitleError || metaDescriptionError) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }

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
      formData.append("is_active", isActive.toString()); // Changed from published to is_active

      // Add images (existing images are already saved, only add new ones)
      images.forEach((file) => {
        formData.append("images", file);
      });

      // Add main images alt texts for new uploads
      if (imagesAltTexts.length > 0) {
        formData.append("images_alt_text", JSON.stringify(imagesAltTexts));
      }

      // Add hero section image (new upload)
      if (heroSectionImage) {
        formData.append("hero_section_image", heroSectionImage);
      }

      // Add hero section image alt text for new upload
      if (heroSectionImageAltText) {
        formData.append("hero_section_image_alt_text", heroSectionImageAltText);
      }

      // Add expertise section images (new uploads)
      expertiseSectionImages.forEach((file) => {
        formData.append("expertise_section_images", file);
      });

      // Add expertise section images alt texts for new uploads
      if (expertiseSectionImagesAltTexts.length > 0) {
        formData.append("expertise_section_images_alt_text", JSON.stringify(expertiseSectionImagesAltTexts));
      }

      // Add what sets us apart section images (new uploads)
      whatSetsUsApartSectionImages.forEach((file) => {
        formData.append("what_sets_us_apart_section_images", file);
      });

      // Add what sets us apart section images alt texts for new uploads
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

      await editIndustry.mutateAsync({ id: industry.id.toString(), data: formData });
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
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="expertise">Expertise</TabsTrigger>
          <TabsTrigger value="apart">What Sets Us Apart</TabsTrigger>
          <TabsTrigger value="build">We Build</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Industry Name *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    setName(value);
                    const error = validateName(value);
                    if (error) {
                      setErrors(prev => ({ ...prev, name: error }));
                    } else {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.name;
                        return newErrors;
                      });
                    }
                  }
                }}
                onBlur={() => {
                  const error = validateName(name);
                  if (error) {
                    setErrors(prev => ({ ...prev, name: error }));
                  }
                }}
                placeholder="Enter industry name"
                maxLength={100}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
              />
              <p className={`text-sm ${errors.name ? 'text-red-600' : 'text-gray-500'}`}>
                {errors.name || `${100 - name.length} characters remaining`}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">Slug *</label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 40) {
                    setSlug(value);
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.slug ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
              />
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.metaTitle ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.metaDescription ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
              />
              <p className={`text-sm ${errors.metaDescription ? 'text-red-600' : 'text-gray-500'}`}>
                {errors.metaDescription || `${160 - metaDescription.length} characters remaining`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium">Active</label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Main Industry Images</label>

            {/* Show existing images */}
            {existingImages.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Existing Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={imageUrl}
                        alt={`Existing industry image ${index + 1}`}
                        className="h-32 w-full rounded border object-cover"
                      />
                      <div>
                        <label className="text-xs font-medium">Alt Text</label>
                        <input
                          type="text"
                          value={existingImagesAltTexts[index] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 255) {
                              const newAltTexts = [...existingImagesAltTexts];
                              newAltTexts[index] = value;
                              setExistingImagesAltTexts(newAltTexts);
                            }
                          }}
                          placeholder={`Alt text for existing image ${index + 1}`}
                          maxLength={255}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {255 - (existingImagesAltTexts[index]?.length || 0)} characters remaining
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show new images */}
            {images.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">New Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((file, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={getFilePreview(file)}
                        alt={`New industry image ${index + 1}`}
                        className="h-32 w-full rounded border object-cover"
                      />
                      <div>
                        <label className="text-xs font-medium">Alt Text</label>
                        <input
                          type="text"
                          value={imagesAltTexts[index] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 255) {
                              const newAltTexts = [...imagesAltTexts];
                              newAltTexts[index] = value;
                              setImagesAltTexts(newAltTexts);
                            }
                          }}
                          placeholder={`Alt text for new image ${index + 1}`}
                          maxLength={255}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {255 - (imagesAltTexts[index]?.length || 0)} characters remaining
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File input for new images */}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className={`px-3 py-1 rounded-full text-sm border ${
                      selectedTags.includes(tag.id)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Hero Section Tab */}
        <TabsContent value="hero" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                value={sectionsData.hero_section.title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSection("hero_section", "title", value);
                  }
                }}
                placeholder="Hero section title"
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500">
                {100 - (sectionsData.hero_section.title?.length || 0)} characters remaining
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image Alt Text</label>
              <input
                type="text"
                value={sectionsData.hero_section.image_alt_text}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 255) {
                    updateSection("hero_section", "image_alt_text", value);
                  }
                }}
                placeholder="Alt text for hero image"
                maxLength={255}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500">
                {255 - (sectionsData.hero_section.image_alt_text?.length || 0)} characters remaining
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={sectionsData.hero_section.description}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  updateSection("hero_section", "description", value);
                }
              }}
              placeholder="Hero section description"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              {500 - (sectionsData.hero_section.description?.length || 0)} characters remaining
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hero Section Image</label>

            {/* Show existing hero image */}
            {existingHeroImage && (
              <div className="space-y-2 p-3 border rounded-lg">
                <p className="text-sm text-gray-600">Existing Hero Image:</p>
                <img
                  src={existingHeroImage}
                  alt="Existing hero section"
                  className="h-32 w-48 rounded border object-cover"
                />
                <div>
                  <label className="text-xs font-medium">Alt Text</label>
                  <input
                    type="text"
                    value={existingHeroImageAltText}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 255) {
                        setExistingHeroImageAltText(value);
                      }
                    }}
                    placeholder="Alt text for existing hero image"
                    maxLength={255}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {255 - existingHeroImageAltText.length} characters remaining
                  </p>
                </div>
              </div>
            )}

            {/* File input for new hero image */}
            <input
              type="file"
              accept="image/*"
              onChange={handleHeroSectionImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Show new hero image */}
            {heroSectionImage && (
              <div className="space-y-2 p-3 border rounded-lg">
                <p className="text-sm text-gray-600">New Hero Image:</p>
                <img
                  src={getFilePreview(heroSectionImage)}
                  alt="New hero section preview"
                  className="h-32 w-48 rounded border object-cover"
                />
                <div>
                  <label className="text-xs font-medium">Alt Text</label>
                  <input
                    type="text"
                    value={heroSectionImageAltText}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 255) {
                        setHeroSectionImageAltText(value);
                      }
                    }}
                    placeholder="Alt text for new hero image"
                    maxLength={255}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {255 - heroSectionImageAltText.length} characters remaining
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Challenges Section Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={sectionsData.challenges_section.title}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 100) {
                  updateSection("challenges_section", "title", value);
                }
              }}
              placeholder="Challenges section title"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              {100 - (sectionsData.challenges_section.title?.length || 0)} characters remaining
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Challenge Points</label>
              <button
                type="button"
                onClick={() => {
                  const currentDescription = sectionsData.challenges_section.description || "";
                  const points = currentDescription ? currentDescription.split("|||") : [];
                  points.push("");
                  updateSection("challenges_section", "description", points.join("|||"));
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Add Challenge Point
              </button>
            </div>

            {(() => {
              const currentDescription = sectionsData.challenges_section.description || "";
              const points = currentDescription ? currentDescription.split("|||") : [""];
              const displayPoints = points.length === 0 ? [""] : points;

              return displayPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => {
                        const newPoints = [...displayPoints];
                        newPoints[index] = e.target.value;
                        updateSection("challenges_section", "description", newPoints.join("|||"));
                      }}
                      placeholder={`Challenge point ${index + 1}`}
                      maxLength={200}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {200 - point.length} characters remaining
                    </p>
                  </div>
                  {displayPoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newPoints = displayPoints.filter((_, i) => i !== index);
                        updateSection("challenges_section", "description", newPoints.join("|||"));
                      }}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ));
            })()}
          </div>
        </TabsContent>

        {/* Expertise Section Tab */}
        <TabsContent value="expertise" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                value={sectionsData.expertise_section.title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSection("expertise_section", "title", value);
                  }
                }}
                placeholder="Expertise section title"
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500">
                {100 - (sectionsData.expertise_section.title?.length || 0)} characters remaining
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={sectionsData.expertise_section.description}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  updateSection("expertise_section", "description", value);
                }
              }}
              placeholder="Expertise section description"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              {500 - (sectionsData.expertise_section.description?.length || 0)} characters remaining
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Expertise Section Images</label>

            {/* Show existing expertise images */}
            {existingExpertiseImages.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Existing Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingExpertiseImages.map((imageUrl, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={imageUrl}
                        alt={`Existing expertise image ${index + 1}`}
                        className="h-32 w-full rounded border object-cover"
                      />
                      <div>
                        <label className="text-xs font-medium">Alt Text</label>
                        <input
                          type="text"
                          value={existingExpertiseImagesAltTexts[index] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 255) {
                              const newAltTexts = [...existingExpertiseImagesAltTexts];
                              newAltTexts[index] = value;
                              setExistingExpertiseImagesAltTexts(newAltTexts);
                            }
                          }}
                          placeholder={`Alt text for existing expertise image ${index + 1}`}
                          maxLength={255}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {255 - (existingExpertiseImagesAltTexts[index]?.length || 0)} characters remaining
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show new expertise images */}
            {expertiseSectionImages.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">New Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {expertiseSectionImages.map((file, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={getFilePreview(file)}
                        alt={`New expertise image ${index + 1}`}
                        className="h-32 w-full rounded border object-cover"
                      />
                      <div>
                        <label className="text-xs font-medium">Alt Text</label>
                        <input
                          type="text"
                          value={expertiseSectionImagesAltTexts[index] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 255) {
                              const newAltTexts = [...expertiseSectionImagesAltTexts];
                              newAltTexts[index] = value;
                              setExpertiseSectionImagesAltTexts(newAltTexts);
                            }
                          }}
                          placeholder={`Alt text for new expertise image ${index + 1}`}
                          maxLength={255}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {255 - (expertiseSectionImagesAltTexts[index]?.length || 0)} characters remaining
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File input for new expertise images */}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleExpertiseSectionImagesChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </TabsContent>

        {/* What Sets Us Apart Section Tab */}
        <TabsContent value="apart" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                value={sectionsData.what_sets_us_apart_section.title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSection("what_sets_us_apart_section", "title", value);
                  }
                }}
                placeholder="What Sets Us Apart section title"
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500">
                {100 - (sectionsData.what_sets_us_apart_section.title?.length || 0)} characters remaining
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={sectionsData.what_sets_us_apart_section.description}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  updateSection("what_sets_us_apart_section", "description", value);
                }
              }}
              placeholder="What Sets Us Apart section description"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              {500 - (sectionsData.what_sets_us_apart_section.description?.length || 0)} characters remaining
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">What Sets Us Apart Section Images</label>

            {/* Show existing WSUA images */}
            {existingWhatSetsUsApartImages.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Existing Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingWhatSetsUsApartImages.map((imageUrl, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={imageUrl}
                        alt={`Existing WSUA image ${index + 1}`}
                        className="h-32 w-full rounded border object-cover"
                      />
                      <div>
                        <label className="text-xs font-medium">Alt Text</label>
                        <input
                          type="text"
                          value={existingWhatSetsUsApartImagesAltTexts[index] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 255) {
                              const newAltTexts = [...existingWhatSetsUsApartImagesAltTexts];
                              newAltTexts[index] = value;
                              setExistingWhatSetsUsApartImagesAltTexts(newAltTexts);
                            }
                          }}
                          placeholder={`Alt text for existing WSUA image ${index + 1}`}
                          maxLength={255}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {255 - (existingWhatSetsUsApartImagesAltTexts[index]?.length || 0)} characters remaining
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show new WSUA images */}
            {whatSetsUsApartSectionImages.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">New Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {whatSetsUsApartSectionImages.map((file, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={getFilePreview(file)}
                        alt={`New WSUA image ${index + 1}`}
                        className="h-32 w-full rounded border object-cover"
                      />
                      <div>
                        <label className="text-xs font-medium">Alt Text</label>
                        <input
                          type="text"
                          value={whatSetsUsApartSectionImagesAltTexts[index] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 255) {
                              const newAltTexts = [...whatSetsUsApartSectionImagesAltTexts];
                              newAltTexts[index] = value;
                              setWhatSetsUsApartSectionImagesAltTexts(newAltTexts);
                            }
                          }}
                          placeholder={`Alt text for new WSUA image ${index + 1}`}
                          maxLength={255}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {255 - (whatSetsUsApartSectionImagesAltTexts[index]?.length || 0)} characters remaining
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File input for new WSUA images */}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleWhatSetsUsApartSectionImagesChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </TabsContent>

        {/* We Build Section Tab */}
        <TabsContent value="build" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                value={sectionsData.we_build_section.title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSection("we_build_section", "title", value);
                  }
                }}
                placeholder="We Build section title"
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500">
                {100 - (sectionsData.we_build_section.title?.length || 0)} characters remaining
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={sectionsData.we_build_section.description}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  updateSection("we_build_section", "description", value);
                }
              }}
              placeholder="We Build section description"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500">
              {500 - (sectionsData.we_build_section.description?.length || 0)} characters remaining
            </p>
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
