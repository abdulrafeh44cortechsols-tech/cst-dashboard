"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, Loader2, ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Project, Tag } from "@/types/types";
import { useProjects } from "@/hooks/useProjects";
import { useTags } from "@/hooks/useTags";
import { getImageUrl } from "@/lib/utils";

interface ProjectGoalSubSection {
  title: string;
  image_alt_text?: string;
  image?: string;
}

interface ProjectGoalApproach {
  title: string;
  description: string;
  additional_info: string[];
}

interface TechnologySubSection {
  title: string;
  image_count: number;
  description: string;
  image?: string;
  image_alt_text?: string;
}

interface ServiceSubSection {
  title: string;
  description: string;
  additional_info: string[];
}

interface ProjectSectionsData {
  hero_section: {
    title: string;
    description: string;
    sub_sections: any[];
    hero_main_image?: string;
  };
  about_section: {
    title: string;
    description: string;
  };
  project_goals_section: {
    title: string;
    sub_sections: ProjectGoalSubSection[];
    approaches: ProjectGoalApproach[];
  };
  technologies_used_section: {
    title: string;
    description: string;
    sub_sections: TechnologySubSection[];
  };
  services_provided_section: {
    title: string;
    description: string;
    sub_sections: ServiceSubSection[];
  };
}

interface EditProjectFormProps {
  project: Project | null;
  onCancel?: () => void;
  onSaved?: () => void;
}

export function EditProjectForm({ project, onCancel, onSaved }: EditProjectFormProps) {
  const { editProject } = useProjects();
  const { getTags } = useTags();

  // Basic project fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // File uploads
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAltText, setImageAltText] = useState<string>("");
  const [heroSectionImages, setHeroSectionImages] = useState<File[]>([]);
  const [heroSectionAltTexts, setHeroSectionAltTexts] = useState<string[]>([]);
  
  // Existing images from API
  const [existingMainImage, setExistingMainImage] = useState<string>("");
  const [existingHeroImages, setExistingHeroImages] = useState<Array<{image: string, image_alt_text: string}>>([]);

  // Sections data
  const [sectionsData, setSectionsData] = useState<ProjectSectionsData>({
    hero_section: {
      title: "",
      description: "",
      sub_sections: [],
    },
    about_section: {
      title: "",
      description: "",
    },
    project_goals_section: {
      title: "",
      sub_sections: [],
      approaches: [],
    },
    technologies_used_section: {
      title: "",
      description: "",
      sub_sections: [],
    },
    services_provided_section: {
      title: "",
      description: "",
      sub_sections: [],
    },
  });

  // Real-time validation state for sections
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [heroDescriptionError, setHeroDescriptionError] = useState<string | null>(null);
  const [aboutDescriptionError, setAboutDescriptionError] = useState<string | null>(null);
  const [techDescriptionError, setTechDescriptionError] = useState<string | null>(null);
  const [servicesDescriptionError, setServicesDescriptionError] = useState<string | null>(null);
  const [serviceSubDescriptionErrors, setServiceSubDescriptionErrors] = useState<Record<number, string | null>>({});

  const { data: tagsResponse } = getTags;
  const tags = tagsResponse?.data;

  // Load project data when component mounts
  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setSlug(project.slug || "");
      setSelectedTags(project.tags?.map(tag => tag.id) || []);
      setImageAltText(project.image_alt_text || "");
      
      // Load existing images
      setExistingMainImage((project as any).image || "");
      
      // Load sections data if available (API returns 'sections', not 'sections_data')
      const sections = project.sections_data || (project as any).sections;
      if (sections) {
        const heroSection = sections.hero_section || { title: "", description: "", sub_sections: [] };
        if (sections.hero_section?.hero_main_image) {
          heroSection.hero_main_image = sections.hero_section.hero_main_image;
        }
        
        setSectionsData({
          hero_section: heroSection,
          about_section: sections.about_section || { title: "", description: "" },
          project_goals_section: sections.project_goals_section || { title: "", sub_sections: [], approaches: [] },
          technologies_used_section: sections.technologies_used_section || { title: "", description: "", sub_sections: [] },
          services_provided_section: sections.services_provided_section || { title: "", description: "", sub_sections: [] },
        });
        
        // Load existing hero images
        if (sections.hero_section?.sub_sections) {
          setExistingHeroImages(sections.hero_section.sub_sections.map((sub: any) => ({
            image: sub.image || "",
            image_alt_text: sub.image_alt_text || ""
          })));
        }
      }
    }
  }, [project]);

  // Section update helpers
  const updateSection = (
    sectionName: keyof ProjectSectionsData,
    field: string,
    value: string
  ) => {
    setSectionsData((prev) => ({
      ...prev,
      [sectionName]: {
        ...prev[sectionName],
        [field]: value,
      },
    }));
  };

  // Image handling functions
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create an object URL for preview
      const objectUrl = URL.createObjectURL(file);
      
      setSectionsData(prev => ({
        ...prev,
        hero_section: {
          ...prev.hero_section,
          hero_main_image: objectUrl
        }
      }));
      
      // Store the file for submission
      setImageFile(file);
    }
  };

  const handleHeroImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setHeroSectionImages(files);
    setHeroSectionAltTexts(new Array(files.length).fill(""));
  };

  const getFilePreview = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project) {
      toast.error("No project data available.");
      return;
    }

    if (!name || !description) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (description.length < 100) {
      toast.error("Project description must be at least 100 characters long.");
      return;
    }

    try {
      const formData = new FormData();
      
      // Only send changed basic fields
      if (name !== project.name) formData.append("name", name);
      if (description !== project.description) formData.append("description", description);
      if (slug !== project.slug) formData.append("slug", slug);

      // Check main image alt text changes
      if (imageAltText !== project.image_alt_text) {
        console.log("Main image alt text changed:", {
          current: imageAltText,
          original: project.image_alt_text,
          willSend: true
        });
        formData.append("image_alt_text", imageAltText);
      } else {
        console.log("Main image alt text unchanged:", {
          current: imageAltText,
          original: project.image_alt_text,
          willSend: false
        });
      }
      
      // Only send tags if changed
      const currentTagIds = project.tags?.map(tag => tag.id) || [];
      const tagsChanged = JSON.stringify(selectedTags.sort()) !== JSON.stringify(currentTagIds.sort());
      if (tagsChanged) {
        selectedTags.forEach((tagId) => {
          formData.append("tag_ids", tagId.toString());
        });
      }

      // Only send sections data if changed
      const currentSections = project.sections_data || (project as any).sections;
      const sectionsChanged = JSON.stringify(sectionsData) !== JSON.stringify(currentSections);

      // Create a deep copy of sectionsData to avoid mutating the original state
      let finalSectionsData = JSON.parse(JSON.stringify(sectionsData));

      // Handle hero section main image (the one shown at the top of the hero section)
      if (imageFile) {
        // Append the main hero image file
        formData.append('hero_section_image_files', imageFile);
        // Add empty alt text for the main hero image
        formData.append('hero_section_image_alt_text', '');
      }
      
      // Handle the hero_main_image in sections_data (if it's a new upload)
      if (finalSectionsData.hero_section.hero_main_image && 
          finalSectionsData.hero_section.hero_main_image.startsWith('blob:')) {
        try {
          // If we have a blob URL, convert it to a file and add it
          const response = await fetch(finalSectionsData.hero_section.hero_main_image);
          const blob = await response.blob();
          const file = new File([blob], 'hero-section-main-image.jpg', { type: blob.type });
          
          // Append the file to form data with the correct field name
          formData.append('hero_section_image_files', file);
          
          // Add empty alt text for the main hero image
          formData.append('hero_section_image_alt_text', '');
          
          // Clear the blob URL from the sections_data to avoid sending it in the JSON
          finalSectionsData = {
            ...finalSectionsData,
            hero_section: {
              ...finalSectionsData.hero_section,
              hero_main_image: ''
            }
          };
        } catch (error) {
          console.error('Error processing hero section main image:', error);
        }
      }

      // Send existing hero images alt text if they've been updated
      if (existingHeroImages.length > 0) {
        const currentHeroImages = project.sections_data?.hero_section?.sub_sections || (project as any).sections?.hero_section?.sub_sections || [];
        const hasAltTextChanges = existingHeroImages.some((img, index) => {
          const currentAltText = currentHeroImages[index]?.image_alt_text || "";
          return img.image_alt_text !== currentAltText;
        });

        if (hasAltTextChanges) {
          console.log("Hero alt text changes detected:", existingHeroImages.map(img => img.image_alt_text));
          console.log("Current hero images from project:", currentHeroImages.map((img : any) => img.image_alt_text));

          // Update sections data with new hero alt text
          finalSectionsData = {
            ...sectionsData,
            hero_section: {
              ...sectionsData.hero_section,
              sub_sections: existingHeroImages.map((img, index) => ({
                image: img.image,
                image_alt_text: img.image_alt_text || ""
              }))
            }
          };

          console.log("Updated sections_data with hero alt text:", finalSectionsData.hero_section.sub_sections);
        }
      }

      if (sectionsChanged || finalSectionsData !== sectionsData) {
        formData.append("sections_data", JSON.stringify(finalSectionsData));
      }

      await editProject.mutateAsync({
        id: project.id.toString(),
        data: formData,
      });

      toast.success("Project updated successfully!");
      onSaved?.();
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast.error(error?.response?.data?.message || "Failed to update project");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="cursor-pointer">Basic Info</TabsTrigger>
          <TabsTrigger value="hero" className="cursor-pointer">Hero & About</TabsTrigger>
          <TabsTrigger value="goals" className="cursor-pointer">Project Goals</TabsTrigger>
          <TabsTrigger value="tech" className="cursor-pointer">Technologies</TabsTrigger>
          <TabsTrigger value="services" className="cursor-pointer">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter project name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="project-slug"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description * - p</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 2000) {
                      setDescription(value);
                      // real-time validation
                      if (value.trim().length > 0 && value.trim().length < 100) {
                        setDescriptionError("Project description must be at least 100 characters long.");
                      } else {
                        setDescriptionError(null);
                      }
                    }
                  }}
                  placeholder="Enter project description"
                  rows={4}
                  maxLength={2000}
                  required
                  className={descriptionError ? "border-red-500 focus-visible:ring-red-500" : undefined}
                />
                {descriptionError && (
                  <p className="text-sm text-red-600 mt-1">{descriptionError}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {description.length}/2000 characters (minimum 100 required)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Main Project Image Alt Text</Label>
                <Input
                  value={imageAltText}
                  onChange={(e) => setImageAltText(e.target.value)}
                  placeholder="Enter alt text for main image"
                />
              </div>

              {/* Main Project Image Upload */}
              <div className="space-y-2">
                <Label>Main Project Image</Label>
                {existingMainImage && !imageFile && (
                  <div className="mb-3 flex justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    {/* <p className="text-sm text-muted-foreground mb-2">Current Image:</p> */}
                    <img
                      src={existingMainImage}
                      alt="Current main project image"
                      className="h-32 w-48 rounded border object-cover"
                    />
                  </div>
                )}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    {imageFile ? (
                      <div className="space-y-3">
                        <img
                          src={getFilePreview(imageFile)}
                          alt="New main image preview"
                          className="h-32 w-48 rounded border object-cover mx-auto"
                        />
                        <p className="text-sm text-green-600 font-medium">
                          ✅ New Image Selected: {imageFile.name}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600">
                          Click to upload new main project image
                        </p>
                        <p className="text-xs text-green-600">
                          🖼️ PNG, JPG, GIF supported
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags Selection */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {(tags || []).map((tag: Tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(tag.id)
                            ? prev.filter((id) => id !== tag.id)
                            : [...prev, tag.id]
                        );
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add other tabs content similar to the new project page */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title - h1</Label>
                <Input
                  value={sectionsData.hero_section.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 100) {
                      updateSection("hero_section", "title", value);
                    }
                  }}
                  placeholder="Enter hero section title"
                  maxLength={100}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {100 - (sectionsData.hero_section.title?.length || 0)}{" "}
                  characters remaining
                </p>
              </div>
              <div className="space-y-2">
                <Label>Description - p</Label>
                <Textarea
                  value={sectionsData.hero_section.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 1000) {
                      updateSection("hero_section", "description", value);
                      // real-time validation
                      if (value.trim().length > 0 && value.trim().length < 100) {
                        setHeroDescriptionError("Hero section description must be at least 100 characters long.");
                      } else {
                        setHeroDescriptionError(null);
                      }
                    }
                  }}
                  placeholder="Enter hero section description"
                  rows={3}
                  maxLength={1000}
                  className={heroDescriptionError ? "border-red-500 focus-visible:ring-red-500" : undefined}
                />
                {heroDescriptionError && (
                  <p className="text-sm text-red-600 mt-1">{heroDescriptionError}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {1000 -
                    (sectionsData.hero_section.description?.length || 0)}{" "}
                  characters remaining
                </p>
              </div>
              
      
              {/* <div className="space-y-2">
                <Label>Hero Main Image</Label>
                {sectionsData.hero_section.hero_main_image && (
                  <div className="mt-2">
                    <img
                      src={getImageUrl(sectionsData.hero_section.hero_main_image)}
                      alt="Main hero image"
                      className="h-48 w-full max-w-2xl rounded border object-cover mt-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                        target.alt = 'Image not available';
                      }}
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload the main hero image for this project
                </p>
              </div>

      
              <div className="space-y-2">
                <Label>Hero Images</Label>
                {existingHeroImages.length > 0 && heroSectionImages.length === 0 && (
                  <div className="mb-3 space-y-4">
                    {(existingHeroImages || []).map((img, index) => (
                      <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex justify-center md:justify-start">
                            <img
                              src={img.image}
                              alt={img.image_alt_text || `Hero image ${index + 1}`}
                              className="h-32 w-48 rounded border object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label>Image Alt Text</Label>
                            <Input
                              value={img.image_alt_text || ""}
                              onChange={(e) => {
                                const updatedImages = [...existingHeroImages];
                                updatedImages[index] = { ...updatedImages[index], image_alt_text: e.target.value };
                                setExistingHeroImages(updatedImages);
                              }}
                              placeholder="Enter image alt text"
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {heroSectionImages.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600 font-medium">
                        ✅ {heroSectionImages.length} New Image(s) Selected
                      </p>
                      <div className="relative">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleHeroImagesChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <Button type="button" variant="outline" size="sm">
                          Change Images
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {(heroSectionImages || []).map((file, index) => (
                        <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex justify-center md:justify-start">
                              <img
                                src={getFilePreview(file)}
                                alt={`Hero preview ${index + 1}`}
                                className="h-32 w-48 rounded border object-cover"
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <p className="text-sm text-gray-600 font-medium truncate">
                                {file.name}
                              </p>
                              <div>
                                <Label htmlFor={`heroAlt${index}`}>Alt Text</Label>
                                <Input
                                  id={`heroAlt${index}`}
                                  value={heroSectionAltTexts[index] || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.length <= 255) {
                                      const newAltTexts = [...heroSectionAltTexts];
                                      newAltTexts[index] = value;
                                      setHeroSectionAltTexts(newAltTexts);
                                    }
                                  }}
                                  placeholder={`Alt text for hero image ${index + 1}`}
                                  maxLength={255}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleHeroImagesChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <div>
                        <p className="text-sm text-gray-600">
                          Click to upload new hero section images
                        </p>
                        <p className="text-xs text-green-600">
                          🖼️ Multiple images allowed • PNG, JPG, GIF
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title - h2</Label>
                <Input
                  value={sectionsData.about_section.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 100) {
                      updateSection("about_section", "title", value);
                    }
                  }}
                  placeholder="Enter about section title"
                  maxLength={100}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {100 - (sectionsData.about_section.title?.length || 0)}{" "}
                  characters remaining
                </p>
              </div>
              <div className="space-y-2">
                <Label>Description - p</Label>
                <Textarea
                  value={sectionsData.about_section.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 1000) {
                      updateSection("about_section", "description", value);
                      // real-time validation
                      if (value.trim().length > 0 && value.trim().length < 100) {
                        setAboutDescriptionError("About section description must be at least 100 characters long.");
                      } else {
                        setAboutDescriptionError(null);
                      }
                    }
                  }}
                  placeholder="Enter about section description"
                  rows={3}
                  maxLength={1000}
                  className={aboutDescriptionError ? "border-red-500 focus-visible:ring-red-500" : undefined}
                />
                {aboutDescriptionError && (
                  <p className="text-sm text-red-600 mt-1">{aboutDescriptionError}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {1000 -
                    (sectionsData.about_section.description?.length ||
                      0)}{" "}
                  characters remaining
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Goals Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Title - h2</Label>
                <Input
                  value={sectionsData.project_goals_section.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 100) {
                      updateSection("project_goals_section", "title", value);
                    }
                  }}
                  placeholder="Enter project goals section title"
                  maxLength={100}
                />
              </div>

              {/* Project Goals Sub-sections */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Goal Sub-sections</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSectionsData((prev) => ({
                        ...prev,
                        project_goals_section: {
                          ...prev.project_goals_section,
                          sub_sections: [
                            ...prev.project_goals_section.sub_sections,
                            { title: "", image: "", image_alt_text: "" },
                          ],
                        },
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal Sub-section
                  </Button>
                </div>

                {(sectionsData.project_goals_section.sub_sections || []).map((subSection: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Goal Sub-section {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSectionsData((prev) => ({
                            ...prev,
                            project_goals_section: {
                              ...prev.project_goals_section,
                              sub_sections: (prev.project_goals_section.sub_sections || []).filter((_, i) => i !== index),
                            },
                          }));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={subSection.title || ""}
                        onChange={(e) => {
                          const newSubSections = [...sectionsData.project_goals_section.sub_sections];
                          newSubSections[index] = { ...newSubSections[index], title: e.target.value };
                          setSectionsData((prev) => ({
                            ...prev,
                            project_goals_section: {
                              ...prev.project_goals_section,
                              sub_sections: newSubSections,
                            },
                          }));
                        }}
                        placeholder="Enter goal sub-section title"
                      />
                    </div>

                    {/* Show existing image if available */}
                    <div className="space-y-2">
                      <Label>Image</Label>
                      {subSection.image ? (
                        <div className="mb-3 flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <img
                            src={getImageUrl(subSection.image)}
                            alt={subSection.image_alt_text || `Goal ${index + 1}`}
                            className="h-32 w-48 rounded border object-cover"
                            onError={(e) => {
                              // If image fails to load, show a placeholder
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                              target.alt = 'Image not available';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg bg-muted/50">
                          <span className="text-muted-foreground text-sm">No image uploaded</span>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const newSubSections = [...sectionsData.project_goals_section.sub_sections];
                            newSubSections[index] = { 
                              ...newSubSections[index], 
                              image: URL.createObjectURL(file) 
                            };
                            setSectionsData(prev => ({
                              ...prev,
                              project_goals_section: {
                                ...prev.project_goals_section,
                                sub_sections: newSubSections
                              }
                            }));
                          }
                        }}
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Image Alt Text</Label>
                      <Input
                        value={subSection.image_alt_text || ""}
                        onChange={(e) => {
                          const newSubSections = [...sectionsData.project_goals_section.sub_sections];
                          newSubSections[index] = { ...newSubSections[index], image_alt_text: e.target.value };
                          setSectionsData((prev) => ({
                            ...prev,
                            project_goals_section: {
                              ...prev.project_goals_section,
                              sub_sections: newSubSections,
                            },
                          }));
                        }}
                        placeholder="Enter image alt text"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Project Approaches */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Project Approaches</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSectionsData((prev) => ({
                        ...prev,
                        project_goals_section: {
                          ...prev.project_goals_section,
                          approaches: [
                            ...(prev.project_goals_section.approaches || []),
                            { title: "", description: "", additional_info: [""] },
                          ],
                        },
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Approach
                  </Button>
                </div>

                {((sectionsData.project_goals_section?.approaches || []) as any[]).map((approach: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Approach {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSectionsData((prev) => ({
                            ...prev,
                            project_goals_section: {
                              ...prev.project_goals_section,
                              approaches: (prev.project_goals_section.approaches || []).filter((_, i) => i !== index),
                            },
                          }));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={approach.title || ""}
                        onChange={(e) => {
                          const newApproaches = [...sectionsData.project_goals_section.approaches];
                          newApproaches[index] = { ...newApproaches[index], title: e.target.value };
                          setSectionsData((prev) => ({
                            ...prev,
                            project_goals_section: {
                              ...prev.project_goals_section,
                              approaches: newApproaches,
                            },
                          }));
                        }}
                        placeholder="Enter approach title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={approach.description || ""}
                        onChange={(e) => {
                          const newApproaches = [...sectionsData.project_goals_section.approaches];
                          newApproaches[index] = { ...newApproaches[index], description: e.target.value };
                          setSectionsData((prev) => ({
                            ...prev,
                            project_goals_section: {
                              ...prev.project_goals_section,
                              approaches: newApproaches,
                            },
                          }));
                        }}
                        placeholder="Enter approach description"
                        rows={3}
                      />
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Additional Information</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newApproaches = [...sectionsData.project_goals_section.approaches];
                            newApproaches[index] = {
                              ...newApproaches[index],
                              additional_info: [...(newApproaches[index].additional_info || []), ""]
                            };
                            setSectionsData((prev) => ({
                              ...prev,
                              project_goals_section: {
                                ...prev.project_goals_section,
                                approaches: newApproaches,
                              },
                            }));
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Info
                        </Button>
                      </div>
                      
                      {(approach.additional_info || []).map((info: string, infoIndex: number) => (
                        <div key={infoIndex} className="flex gap-2">
                          <Input
                            value={info}
                            onChange={(e) => {
                              const newApproaches = [...sectionsData.project_goals_section.approaches];
                              const newAdditionalInfo = [...(newApproaches[index].additional_info || [])];
                              newAdditionalInfo[infoIndex] = e.target.value;
                              newApproaches[index] = { ...newApproaches[index], additional_info: newAdditionalInfo };
                              setSectionsData((prev) => ({
                                ...prev,
                                project_goals_section: {
                                  ...prev.project_goals_section,
                                  approaches: newApproaches,
                                },
                              }));
                            }}
                            placeholder={`Additional info ${infoIndex + 1}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newApproaches = [...sectionsData.project_goals_section.approaches];
                              const newAdditionalInfo = (newApproaches[index].additional_info || []).filter((_, i) => i !== infoIndex);
                              newApproaches[index] = { ...newApproaches[index], additional_info: newAdditionalInfo };
                              setSectionsData((prev) => ({
                                ...prev,
                                project_goals_section: {
                                  ...prev.project_goals_section,
                                  approaches: newApproaches,
                                },
                              }));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tech" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technologies Used Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Title - h2</Label>
                <Input
                  value={sectionsData.technologies_used_section.title}
                  onChange={(e) =>
                    updateSection(
                      "technologies_used_section",
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="Enter technologies section title"
                />
              </div>
              <div className="space-y-2">
                <Label>Section Description - p</Label>
                <Textarea
                  value={sectionsData.technologies_used_section.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateSection(
                      "technologies_used_section",
                      "description",
                      value
                    );
                    // real-time validation
                    if (value.trim().length > 0 && value.trim().length < 100) {
                      setTechDescriptionError("Technologies section description must be at least 100 characters long.");
                    } else {
                      setTechDescriptionError(null);
                    }
                  }}
                  placeholder="Enter technologies section description"
                  rows={3}
                  className={techDescriptionError ? "border-red-500 focus-visible:ring-red-500" : undefined}
                />
                {techDescriptionError && (
                  <p className="text-sm text-red-600 mt-1">{techDescriptionError}</p>
                )}
              </div>

              {/* Technology Sub-sections */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Technology Categories</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSectionsData((prev) => ({
                        ...prev,
                        technologies_used_section: {
                          ...prev.technologies_used_section,
                          sub_sections: [
                            ...prev.technologies_used_section.sub_sections,
                            { title: "", description: "", image_count: 0 },
                          ],
                        },
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Technology Category
                  </Button>
                </div>

                {(sectionsData.technologies_used_section.sub_sections || []).map((subSection: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Technology Category {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSectionsData((prev) => ({
                            ...prev,
                            technologies_used_section: {
                              ...prev.technologies_used_section,
                              sub_sections: (prev.technologies_used_section.sub_sections || []).filter((_, i) => i !== index),
                            },
                          }));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={subSection.title || ""}
                        onChange={(e) => {
                          const newSubSections = [...sectionsData.technologies_used_section.sub_sections];
                          newSubSections[index] = { ...newSubSections[index], title: e.target.value };
                          setSectionsData((prev) => ({
                            ...prev,
                            technologies_used_section: {
                              ...prev.technologies_used_section,
                              sub_sections: newSubSections,
                            },
                          }));
                        }}
                        placeholder="Enter technology category title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={subSection.description || ""}
                        onChange={(e) => {
                          const newSubSections = [...sectionsData.technologies_used_section.sub_sections];
                          newSubSections[index] = { ...newSubSections[index], description: e.target.value };
                          setSectionsData((prev) => ({
                            ...prev,
                            technologies_used_section: {
                              ...prev.technologies_used_section,
                              sub_sections: newSubSections,
                            },
                          }));
                        }}
                        placeholder="Enter technology category description"
                        rows={3}
                      />
                    </div>

                    {/* Show existing image if available */}
                    {subSection.image && (
                      <div className="mb-3 flex justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        {/* <Label>Current Image</Label> */}
                        <img
                          src={subSection.image}
                          alt={subSection.image_alt_text || `Technology ${index + 1}`}
                          className="h-32 w-48 rounded border object-cover"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Image Alt Text</Label>
                      <Input
                        value={subSection.image_alt_text || ""}
                        onChange={(e) => {
                          const newSubSections = [...sectionsData.technologies_used_section.sub_sections];
                          newSubSections[index] = { ...newSubSections[index], image_alt_text: e.target.value };
                          setSectionsData((prev) => ({
                            ...prev,
                            technologies_used_section: {
                              ...prev.technologies_used_section,
                              sub_sections: newSubSections,
                            },
                          }));
                        }}
                        placeholder="Enter image alt text"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Services Provided Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Title - h2</Label>
                <Input
                  value={sectionsData.services_provided_section.title}
                  onChange={(e) =>
                    updateSection(
                      "services_provided_section",
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="Enter services section title"
                />
              </div>
              <div className="space-y-2">
                <Label>Section Description - p</Label>
                <Textarea
                  value={sectionsData.services_provided_section.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateSection(
                      "services_provided_section",
                      "description",
                      value
                    );
                    // real-time validation
                    if (value.trim().length > 0 && value.trim().length < 100) {
                      setServicesDescriptionError("Services section description must be at least 100 characters long.");
                    } else {
                      setServicesDescriptionError(null);
                    }
                  }}
                  placeholder="Enter services section description"
                  rows={3}
                  className={servicesDescriptionError ? "border-red-500 focus-visible:ring-red-500" : undefined}
                />
                {servicesDescriptionError && (
                  <p className="text-sm text-red-600 mt-1">{servicesDescriptionError}</p>
                )}
              </div>

              {/* Services Sub-sections */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Services</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSectionsData((prev) => ({
                        ...prev,
                        services_provided_section: {
                          ...prev.services_provided_section,
                          sub_sections: [
                            ...prev.services_provided_section.sub_sections,
                            { title: "", description: "", additional_info: [""] },
                          ],
                        },
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>

                {(sectionsData.services_provided_section.sub_sections || []).map((service: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Service {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSectionsData((prev) => ({
                            ...prev,
                            services_provided_section: {
                              ...prev.services_provided_section,
                              sub_sections: (prev.services_provided_section.sub_sections || []).filter((_, i) => i !== index),
                            },
                          }));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={service.title || ""}
                        onChange={(e) => {
                          const newServices = [...sectionsData.services_provided_section.sub_sections];
                          newServices[index] = { ...newServices[index], title: e.target.value };
                          setSectionsData((prev) => ({
                            ...prev,
                            services_provided_section: {
                              ...prev.services_provided_section,
                              sub_sections: newServices,
                            },
                          }));
                        }}
                        placeholder="Enter service title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={service.description || ""}
                        onChange={(e) => {
                          const newServices = [...sectionsData.services_provided_section.sub_sections];
                          newServices[index] = { ...newServices[index], description: e.target.value };
                          setSectionsData((prev) => ({
                            ...prev,
                            services_provided_section: {
                              ...prev.services_provided_section,
                              sub_sections: newServices,
                            },
                          }));
                        }}
                        placeholder="Enter service description"
                        rows={3}
                      />
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Service Features</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newServices = [...sectionsData.services_provided_section.sub_sections];
                            newServices[index] = {
                              ...newServices[index],
                              additional_info: [...(newServices[index].additional_info || []), ""]
                            };
                            setSectionsData((prev) => ({
                              ...prev,
                              services_provided_section: {
                                ...prev.services_provided_section,
                                sub_sections: newServices,
                              },
                            }));
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Feature
                        </Button>
                      </div>
                      
                      {(service.additional_info || []).map((info: string, infoIndex: number) => (
                        <div key={infoIndex} className="flex gap-2">
                          <Input
                            value={info}
                            onChange={(e) => {
                              const newServices = [...sectionsData.services_provided_section.sub_sections];
                              const newAdditionalInfo = [...(newServices[index].additional_info || [])];
                              newAdditionalInfo[infoIndex] = e.target.value;
                              newServices[index] = { ...newServices[index], additional_info: newAdditionalInfo };
                              setSectionsData((prev) => ({
                                ...prev,
                                services_provided_section: {
                                  ...prev.services_provided_section,
                                  sub_sections: newServices,
                                },
                              }));
                            }}
                            placeholder={`Service feature ${infoIndex + 1}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newServices = [...sectionsData.services_provided_section.sub_sections];
                              const newAdditionalInfo = (newServices[index].additional_info || []).filter((_, i) => i !== infoIndex);
                              newServices[index] = { ...newServices[index], additional_info: newAdditionalInfo };
                              setSectionsData((prev) => ({
                                ...prev,
                                services_provided_section: {
                                  ...prev.services_provided_section,
                                  sub_sections: newServices,
                                },
                              }));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={editProject.isPending}
          className="min-w-[100px]"
        >
          {editProject.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Project"
          )}
        </Button>
      </div>
    </form>
  );
}
