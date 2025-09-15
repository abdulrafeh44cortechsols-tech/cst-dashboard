"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";
import type { Industry, Tag } from "@/types/types";
import { useIndustries } from "@/hooks/useIndustries";
import { useTags } from "@/hooks/useTags";

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

interface EditIndustryModalProps {
  industry: Industry | null;
  isOpen: boolean;
  onClose: () => void;
}

export  function EditIndustryModal({
  industry,
  isOpen,
  onClose,
}: EditIndustryModalProps) {
  const { editIndustry } = useIndustries();
  const { getTags } = useTags();
  const { data: tagsResponse } = getTags;
  const tags = tagsResponse?.data;

  // Basic fields
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

  // reCAPTCHA verification state
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

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

  useEffect(() => {
    if (industry) {
      setName(industry.name || "");
      setDescription(industry.description || "");
      setSlug(industry.slug || "");
      setMetaTitle("");
      setMetaDescription("");
      setIsActive(industry.published || true);
      setSelectedTags(industry.tags?.map(tag => tag.id) || []);
      
      // Load sections data from industry if available
      if ((industry as any).sections_data) {
        const loadedSectionsData = { ...(industry as any).sections_data };
        
        // Convert comma-separated challenge points to ||| separator for UI
        if (loadedSectionsData.challenges_section?.description) {
          loadedSectionsData.challenges_section.description = 
            loadedSectionsData.challenges_section.description
              .split(",")
              .map((p: string) => p.trim())
              .filter((p: string) => p)
              .join("|||");
        }
        
        setSectionsData(loadedSectionsData as IndustrySectionsData);
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
      setImages(Array.from(e.target.files));
    }
  };

  const handleHeroSectionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroSectionImage(e.target.files[0]);
    }
  };

  const handleExpertiseSectionImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setExpertiseSectionImages(Array.from(e.target.files));
    }
  };

  const handleWhatSetsUsApartSectionImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setWhatSetsUsApartSectionImages(Array.from(e.target.files));
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

      // Add hero section image
      if (heroSectionImage) {
        formData.append("hero_section_image", heroSectionImage);
      }

      // Add expertise section images
      expertiseSectionImages.forEach((file) => {
        formData.append("expertise_section_images", file);
      });

      // Add what sets us apart section images
      whatSetsUsApartSectionImages.forEach((file) => {
        formData.append("what_sets_us_apart_section_images", file);
      });

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
      onClose();
    } catch (error: any) {
      toast.error("Failed to update industry. Please try again.");
      console.error("Industry update error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full md:min-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Industry</DialogTitle>
          <DialogDescription>
            Update the industry information and content sections.
          </DialogDescription>
        </DialogHeader>

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
                <Label htmlFor="name">Industry Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 100) {
                      setName(value);
                    }
                  }}
                  placeholder="Enter industry name"
                  maxLength={100}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  {100 - name.length} characters remaining
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="industry-slug"
                  required
                />
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
                placeholder="Enter industry description"
                maxLength={500}
                rows={4}
                required
              />
              <p className="text-sm text-muted-foreground">
                {500 - description.length} characters remaining
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
                    if (value.length <= 60) {
                      setMetaTitle(value);
                    }
                  }}
                  placeholder="SEO meta title"
                  maxLength={60}
                />
                <p className="text-sm text-muted-foreground">
                  {60 - metaTitle.length} characters remaining
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 160) {
                      setMetaDescription(value);
                    }
                  }}
                  placeholder="SEO meta description"
                  maxLength={160}
                  rows={2}
                />
                <p className="text-sm text-muted-foreground">
                  {160 - metaDescription.length} characters remaining
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {images.map((file, index) => (
                    <img
                      key={index}
                      src={getFilePreview(file)}
                      alt={`Industry image ${index + 1}`}
                      className="h-20 w-20 rounded border object-cover"
                    />
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
          </TabsContent>

          {/* Hero Section Tab */}
          <TabsContent value="hero" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={sectionsData.hero_section.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 100) {
                      updateSection("hero_section", "title", value);
                    }
                  }}
                  placeholder="Hero section title"
                  maxLength={100}
                />
                <p className="text-sm text-muted-foreground">
                  {100 - (sectionsData.hero_section.title?.length || 0)} characters remaining
                </p>
              </div>

              <div className="space-y-2">
                <Label>Image Alt Text</Label>
                <Input
                  value={sectionsData.hero_section.image_alt_text}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 255) {
                      updateSection("hero_section", "image_alt_text", value);
                    }
                  }}
                  placeholder="Alt text for hero image"
                  maxLength={255}
                />
                <p className="text-sm text-muted-foreground">
                  {255 - (sectionsData.hero_section.image_alt_text?.length || 0)} characters remaining
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
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
              />
              <p className="text-sm text-muted-foreground">
                {500 - (sectionsData.hero_section.description?.length || 0)} characters remaining
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
                <img
                  src={getFilePreview(heroSectionImage)}
                  alt="Hero section preview"
                  className="h-32 w-48 rounded border object-cover"
                />
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
          </TabsContent>

          {/* Challenges Section Tab */}
          <TabsContent value="challenges" className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={sectionsData.challenges_section.title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSection("challenges_section", "title", value);
                  }
                }}
                placeholder="Challenges section title"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground">
                {100 - (sectionsData.challenges_section.title?.length || 0)} characters remaining
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Challenge Points</Label>
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
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        value={point}
                        onChange={(e) => {
                          const newPoints = [...displayPoints];
                          newPoints[index] = e.target.value;
                          updateSection("challenges_section", "description", newPoints.join("|||"));
                        }}
                        placeholder={`Challenge point ${index + 1}`}
                        maxLength={200}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {200 - point.length} characters remaining
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
            </div>
          </TabsContent>

          {/* Expertise Section Tab */}
          <TabsContent value="expertise" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={sectionsData.expertise_section.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 100) {
                      updateSection("expertise_section", "title", value);
                    }
                  }}
                  placeholder="Expertise section title"
                  maxLength={100}
                />
                <p className="text-sm text-muted-foreground">
                  {100 - (sectionsData.expertise_section.title?.length || 0)} characters remaining
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
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
              />
              <p className="text-sm text-muted-foreground">
                {500 - (sectionsData.expertise_section.description?.length || 0)} characters remaining
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {expertiseSectionImages.map((file, index) => (
                    <img
                      key={index}
                      src={getFilePreview(file)}
                      alt={`Expertise image ${index + 1}`}
                      className="h-20 w-20 rounded border object-cover"
                    />
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
                          if (value.length <= 100) {
                            updateExpertiseSubSection(index, "title", value);
                          }
                        }}
                        placeholder="Expertise title"
                        maxLength={100}
                      />
                      <p className="text-sm text-muted-foreground">
                        {100 - (subSection.title?.length || 0)} characters remaining
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={subSection.description}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 500) {
                          updateExpertiseSubSection(index, "description", value);
                        }
                      }}
                      placeholder="Expertise description"
                      maxLength={500}
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground">
                      {500 - (subSection.description?.length || 0)} characters remaining
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
          </TabsContent>

          {/* What Sets Us Apart Section Tab */}
          <TabsContent value="apart" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={sectionsData.what_sets_us_apart_section.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 100) {
                      updateSection("what_sets_us_apart_section", "title", value);
                    }
                  }}
                  placeholder="What sets us apart title"
                  maxLength={100}
                />
                <p className="text-sm text-muted-foreground">
                  {100 - (sectionsData.what_sets_us_apart_section.title?.length || 0)} characters remaining
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={sectionsData.what_sets_us_apart_section.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 500) {
                    updateSection("what_sets_us_apart_section", "description", value);
                  }
                }}
                placeholder="What sets us apart description"
                maxLength={500}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                {500 - (sectionsData.what_sets_us_apart_section.description?.length || 0)} characters remaining
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {whatSetsUsApartSectionImages.map((file, index) => (
                    <img
                      key={index}
                      src={getFilePreview(file)}
                      alt={`What sets us apart image ${index + 1}`}
                      className="h-20 w-20 rounded border object-cover"
                    />
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
                          if (value.length <= 100) {
                            updateWhatSetsUsApartSubSection(index, "title", value);
                          }
                        }}
                        placeholder="Point title"
                        maxLength={100}
                      />
                      <p className="text-sm text-muted-foreground">
                        {100 - (subSection.title?.length || 0)} characters remaining
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={subSection.description}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 500) {
                          updateWhatSetsUsApartSubSection(index, "description", value);
                        }
                      }}
                      placeholder="Point description"
                      maxLength={500}
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground">
                      {500 - (subSection.description?.length || 0)} characters remaining
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
          </TabsContent>

          {/* We Build Section Tab */}
          <TabsContent value="build" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={sectionsData.we_build_section.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 100) {
                      updateSection("we_build_section", "title", value);
                    }
                  }}
                  placeholder="We build section title"
                  maxLength={100}
                />
                <p className="text-sm text-muted-foreground">
                  {100 - (sectionsData.we_build_section.title?.length || 0)} characters remaining
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={sectionsData.we_build_section.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 500) {
                    updateSection("we_build_section", "description", value);
                  }
                }}
                placeholder="We build section description"
                maxLength={500}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                {500 - (sectionsData.we_build_section.description?.length || 0)} characters remaining
              </p>
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
                        if (value.length <= 500) {
                          updateWeBuildSubSection(index, "description", value);
                        }
                      }}
                      placeholder="What we build description"
                      maxLength={500}
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground">
                      {500 - (subSection.description?.length || 0)} characters remaining
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
          </TabsContent>
        </Tabs>

        {/* reCAPTCHA and Footer */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_URL || ""}
              onChange={onCaptchaChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={editIndustry.isPending || !captchaVerified}
          >
            {editIndustry.isPending ? "Updating..." : "Update Industry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 