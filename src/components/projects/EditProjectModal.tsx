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
import type { Project, Tag } from "@/types/types";
import { useProjects } from "@/hooks/useProjects";
import { useTags } from "@/hooks/useTags";

interface ProjectGoalSubSection {
  title: string;
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

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditProjectModal({ project, isOpen, onClose }: EditProjectModalProps) {
  const { editProject } = useProjects();
  const { getTags } = useTags();
  const { data: tagsResponse } = getTags;
  const tags = tagsResponse?.data || [];

  // Basic project fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // Main project image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAltText, setImageAltText] = useState<string>("");

  // Hero section images
  const [heroSectionImages, setHeroSectionImages] = useState<File[]>([]);
  const [heroSectionAltTexts, setHeroSectionAltTexts] = useState<string[]>([]);

  // Project goals section images (icons - one per subsection)
  const [projectGoalsImages, setProjectGoalsImages] = useState<Record<number, File | null>>({});
  const [projectGoalsAltTexts, setProjectGoalsAltTexts] = useState<Record<number, string>>({});

  // Technologies section images (multiple per subsection)
  const [technologiesImages, setTechnologiesImages] = useState<Record<number, File[]>>({});
  const [technologiesAltTexts, setTechnologiesAltTexts] = useState<Record<number, string[]>>({});

  // reCAPTCHA verification state
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

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

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setSlug(project.slug || "");
      
      // Set tags if they exist
      if (project.tags && Array.isArray(project.tags)) {
        setSelectedTags(project.tags.map((tag) => tag.id));
      }

      // Set sections data if it exists
      if (project.sections_data) {
        setSectionsData(prev => ({
          ...prev,
          ...project.sections_data
        }));
      }

      // Load existing alt text data if available
      if (project.image_alt_text) {
        setImageAltText(project.image_alt_text);
      }
    }
  }, [project]);

  function onCaptchaChange(value: string | null) {
    console.log("Captcha value:", value);
    setCaptchaValue(value);
    setCaptchaVerified(!!value);
  }

  // Auto-generate slug from name if slug is empty
  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 40); // Limit to 40 characters
      setSlug(generatedSlug);
    }
  };

  // Section update helpers
  const updateSection = (sectionKey: keyof ProjectSectionsData, field: string, value: any) => {
    setSectionsData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  };

  // Project Goals Section helpers
  const addProjectGoalSubSection = () => {
    setSectionsData(prev => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        sub_sections: [...prev.project_goals_section.sub_sections, { title: "" }],
      },
    }));
  };

  const removeProjectGoalSubSection = (index: number) => {
    setSectionsData(prev => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        sub_sections: prev.project_goals_section.sub_sections.filter((_, i) => i !== index),
      },
    }));
    setProjectGoalsImages(prev => {
      const newImages = { ...prev };
      delete newImages[index];
      return newImages;
    });
  };

  const updateProjectGoalSubSection = (index: number, field: string, value: string) => {
    setSectionsData(prev => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        sub_sections: prev.project_goals_section.sub_sections.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  // Project Goals Approaches helpers
  const addProjectGoalApproach = () => {
    setSectionsData(prev => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        approaches: [...prev.project_goals_section.approaches, { title: "", description: "", additional_info: [""] }],
      },
    }));
  };

  const removeProjectGoalApproach = (index: number) => {
    setSectionsData(prev => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        approaches: prev.project_goals_section.approaches.filter((_, i) => i !== index),
      },
    }));
  };

  const updateProjectGoalApproach = (index: number, field: string, value: any) => {
    setSectionsData(prev => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        approaches: prev.project_goals_section.approaches.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const addApproachInfo = (approachIndex: number) => {
    setSectionsData(prev => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        approaches: prev.project_goals_section.approaches.map((approach, i) =>
          i === approachIndex 
            ? { ...approach, additional_info: [...approach.additional_info, ""] }
            : approach
        ),
      },
    }));
  };

  const removeApproachInfo = (approachIndex: number, infoIndex: number) => {
    setSectionsData(prev => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        approaches: prev.project_goals_section.approaches.map((approach, i) =>
          i === approachIndex 
            ? { ...approach, additional_info: approach.additional_info.filter((_, idx) => idx !== infoIndex) }
            : approach
        ),
      },
    }));
  };

  const updateApproachInfo = (approachIndex: number, infoIndex: number, value: string) => {
    setSectionsData(prev => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        approaches: prev.project_goals_section.approaches.map((approach, i) =>
          i === approachIndex 
            ? { 
                ...approach, 
                additional_info: approach.additional_info.map((info, idx) => 
                  idx === infoIndex ? value : info
                )
              }
            : approach
        ),
      },
    }));
  };

  // Technologies Section helpers
  const addTechnologySubSection = () => {
    setSectionsData(prev => ({
      ...prev,
      technologies_used_section: {
        ...prev.technologies_used_section,
        sub_sections: [...prev.technologies_used_section.sub_sections, { title: "", image_count: 0, description: "" }],
      },
    }));
  };

  const removeTechnologySubSection = (index: number) => {
    setSectionsData(prev => ({
      ...prev,
      technologies_used_section: {
        ...prev.technologies_used_section,
        sub_sections: prev.technologies_used_section.sub_sections.filter((_, i) => i !== index),
      },
    }));
    setTechnologiesImages(prev => {
      const newImages = { ...prev };
      delete newImages[index];
      return newImages;
    });
  };

  const updateTechnologySubSection = (index: number, field: string, value: any) => {
    setSectionsData(prev => ({
      ...prev,
      technologies_used_section: {
        ...prev.technologies_used_section,
        sub_sections: prev.technologies_used_section.sub_sections.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  // Services Section helpers
  const addServiceSubSection = () => {
    setSectionsData(prev => ({
      ...prev,
      services_provided_section: {
        ...prev.services_provided_section,
        sub_sections: [...prev.services_provided_section.sub_sections, { title: "", description: "", additional_info: [""] }],
      },
    }));
  };

  const removeServiceSubSection = (index: number) => {
    setSectionsData(prev => ({
      ...prev,
      services_provided_section: {
        ...prev.services_provided_section,
        sub_sections: prev.services_provided_section.sub_sections.filter((_, i) => i !== index),
      },
    }));
  };

  const updateServiceSubSection = (index: number, field: string, value: any) => {
    setSectionsData(prev => ({
      ...prev,
      services_provided_section: {
        ...prev.services_provided_section,
        sub_sections: prev.services_provided_section.sub_sections.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const addServiceInfo = (serviceIndex: number) => {
    setSectionsData(prev => ({
      ...prev,
      services_provided_section: {
        ...prev.services_provided_section,
        sub_sections: prev.services_provided_section.sub_sections.map((service, i) =>
          i === serviceIndex 
            ? { ...service, additional_info: [...service.additional_info, ""] }
            : service
        ),
      },
    }));
  };

  const removeServiceInfo = (serviceIndex: number, infoIndex: number) => {
    setSectionsData(prev => ({
      ...prev,
      services_provided_section: {
        ...prev.services_provided_section,
        sub_sections: prev.services_provided_section.sub_sections.map((service, i) =>
          i === serviceIndex 
            ? { ...service, additional_info: service.additional_info.filter((_, idx) => idx !== infoIndex) }
            : service
        ),
      },
    }));
  };

  const updateServiceInfo = (serviceIndex: number, infoIndex: number, value: string) => {
    setSectionsData(prev => ({
      ...prev,
      services_provided_section: {
        ...prev.services_provided_section,
        sub_sections: prev.services_provided_section.sub_sections.map((service, i) =>
          i === serviceIndex 
            ? { 
                ...service, 
                additional_info: service.additional_info.map((info, idx) => 
                  idx === infoIndex ? value : info
                )
              }
            : service
        ),
      },
    }));
  };

  // File handlers
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleHeroImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setHeroSectionImages(filesArray);
      // Initialize alt text array
      setHeroSectionAltTexts(new Array(filesArray.length).fill(""));
    }
  };

  const handleProjectGoalImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProjectGoalsImages(prev => ({
        ...prev,
        [index]: e.target.files![0],
      }));
      
      // Initialize alt text for this goal
      setProjectGoalsAltTexts(prev => ({
        ...prev,
        [index]: "",
      }));
    }
  };

  const handleTechnologyImagesChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files!);
      setTechnologiesImages(prev => ({
        ...prev,
        [index]: filesArray,
      }));
      
      // Initialize alt text array for this technology subsection
      setTechnologiesAltTexts(prev => ({
        ...prev,
        [index]: new Array(filesArray.length).fill(""),
      }));
      
      updateTechnologySubSection(index, "image_count", e.target.files.length);
    }
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const removeTag = (tagId: number) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  };

  // Helper function to get file preview
  const getFilePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  const handleSave = async () => {
    if (!project) return;

    // Basic field validation
    if (!name || !description) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Character limit validations
    if (name.length > 100) {
      toast.error("Project name must be 100 characters or less.");
      return;
    }

    if (slug.length > 40) {
      toast.error("Project slug must be 40 characters or less.");
      return;
    }

    if (description.length < 100) {
      toast.error("Project description must be at least 100 characters long.");
      return;
    }

    if (description.length > 2000) {
      toast.error("Project description must be 2000 characters or less.");
      return;
    }

    // Validate slug format
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(slug)) {
      toast.error("Slug can only contain lowercase letters, numbers, and hyphens.");
      return;
    }

    // Check if reCAPTCHA is verified
    if (!captchaVerified || !captchaValue) {
      toast.error("Please complete the reCAPTCHA verification.");
      return;
    }

    // Validate project section descriptions
    // Hero section
    if (sectionsData.hero_section.description && sectionsData.hero_section.description.length < 100) {
      toast.error("Hero section description must be at least 100 characters long.");
      return;
    }
    
    // About section
    if (sectionsData.about_section.description && sectionsData.about_section.description.length < 100) {
      toast.error("About section description must be at least 100 characters long.");
      return;
    }
    
    // Technologies section
    if (sectionsData.technologies_used_section.description && sectionsData.technologies_used_section.description.length < 100) {
      toast.error("Technologies section description must be at least 100 characters long.");
      return;
    }
    
    // Services section
    if (sectionsData.services_provided_section.description && sectionsData.services_provided_section.description.length < 100) {
      toast.error("Services section description must be at least 100 characters long.");
      return;
    }
    
    // Validate sub-section descriptions for sections that have them
    // Hero section sub-sections
    if (sectionsData.hero_section.sub_sections && Array.isArray(sectionsData.hero_section.sub_sections)) {
      for (let i = 0; i < sectionsData.hero_section.sub_sections.length; i++) {
        const subSection = sectionsData.hero_section.sub_sections[i];
        if (subSection.description && subSection.description.length < 100) {
          toast.error(`Hero section sub-section ${i + 1} description must be at least 100 characters long.`);
          return;
        }
      }
    }
    
    // Technologies section sub-sections
    if (sectionsData.technologies_used_section.sub_sections && Array.isArray(sectionsData.technologies_used_section.sub_sections)) {
      for (let i = 0; i < sectionsData.technologies_used_section.sub_sections.length; i++) {
        const subSection = sectionsData.technologies_used_section.sub_sections[i];
        if (subSection.description && subSection.description.length < 100) {
          toast.error(`Technologies section sub-section ${i + 1} description must be at least 100 characters long.`);
          return;
        }
      }
    }
    
    // Services section sub-sections
    if (sectionsData.services_provided_section.sub_sections && Array.isArray(sectionsData.services_provided_section.sub_sections)) {
      for (let i = 0; i < sectionsData.services_provided_section.sub_sections.length; i++) {
        const subSection = sectionsData.services_provided_section.sub_sections[i];
        if (subSection.description && subSection.description.length < 100) {
          toast.error(`Services section sub-section ${i + 1} description must be at least 100 characters long.`);
          return;
        }
      }
    }

    try {
      const formData = new FormData();
      
      // Only add fields that have been filled/changed
      if (name.trim()) {
        formData.append("name", name);
      }
      
      if (description.trim()) {
        formData.append("description", description);
      }
      
      if (slug.trim()) {
        formData.append("slug", slug);
      }
      
      // Add selected tags if any are selected
      if (selectedTags.length > 0) {
        formData.append("tag_ids", JSON.stringify(selectedTags));
      }
      
      // Add main image file if selected
      if (imageFile) {
        formData.append("image_file", imageFile);
      }

      // Add main image alt text
      if (imageAltText) {
        formData.append("image_alt_text", imageAltText);
      }
      
      // Add hero section images if any
      if (heroSectionImages.length > 0) {
        heroSectionImages.forEach((file: File) => {
          formData.append("hero_section_image_files", file);
        });
      }

      // Add hero section alt texts
      if (heroSectionAltTexts.length > 0) {
        formData.append("hero_section_image_alt_text", JSON.stringify(heroSectionAltTexts));
      }
      
      // Add project goals section images (icons) if any
      const goalImages = Object.values(projectGoalsImages).filter(file => file !== null);
      if (goalImages.length > 0) {
        goalImages.forEach((file) => {
          if (file) {
            formData.append("project_goals_section_image_files", file);
          }
        });
      }

      // Add project goals alt texts
      const goalAltTexts = Object.values(projectGoalsAltTexts).filter(text => text);
      if (goalAltTexts.length > 0) {
        formData.append("project_goals_section_image_alt_text", JSON.stringify(goalAltTexts));
      }
      
      // Add technologies section images if any
      const techImages = Object.values(technologiesImages).flat();
      if (techImages.length > 0) {
        techImages.forEach((file) => {
          formData.append("technologies_used_section_image_files", file);
        });
      }

      // Add technologies alt texts
      const techAltTexts = Object.values(technologiesAltTexts).flat().filter(text => text);
      if (techAltTexts.length > 0) {
        formData.append("technologies_used_section_image_alt_text", JSON.stringify(techAltTexts));
      }
      
      // Add sections data if any section has content
      const hasContent = Object.values(sectionsData).some(section => {
        if (typeof section === 'object' && section !== null) {
          return Object.values(section).some(value => {
            if (typeof value === 'string') return value.trim() !== '';
            if (Array.isArray(value)) return value.length > 0;
            return false;
          });
        }
        return false;
      });
      
      if (hasContent) {
        formData.append("sections_data", JSON.stringify(sectionsData));
      }

      await editProject.mutateAsync({ id: project.id.toString(), data: formData });
      toast.success("Project updated successfully!");
      onClose();
    } catch (error: any) {
      toast.error("Failed to update project. Please try again.");
      console.error("Project update error:", error);
    }
  };

  const handleClose = () => {
    // Reset all states
    setName("");
    setDescription("");
    setSlug("");
    setSelectedTags([]);
    setImageFile(null);
    setHeroSectionImages([]);
    setProjectGoalsImages({});
    setTechnologiesImages({});
    setCaptchaVerified(false);
    setCaptchaValue(null);
    setSectionsData({
      hero_section: { title: "", description: "", sub_sections: [] },
      about_section: { title: "", description: "" },
      project_goals_section: { title: "", sub_sections: [], approaches: [] },
      technologies_used_section: { title: "", description: "", sub_sections: [] },
      services_provided_section: { title: "", description: "", sub_sections: [] },
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project details. Only filled fields will be updated.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="hero">Hero & About</TabsTrigger>
            <TabsTrigger value="goals">Project Goals</TabsTrigger>
            <TabsTrigger value="tech">Technologies</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Basic Project Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 100) {
                        handleNameChange(value);
                      }
                    }}
                    placeholder="Enter project name"
                    maxLength={100}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {100 - name.length} characters remaining
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Project Slug</Label>
                  <Input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 40) {
                        setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                      }
                    }}
                    placeholder="project-slug"
                    maxLength={40}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {40 - slug.length} characters remaining (lowercase letters, numbers, hyphens only)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 2000) {
                      setDescription(value);
                    }
                  }}
                  placeholder="Enter project description"
                  rows={4}
                  maxLength={2000}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {description.length}/2000 characters (minimum 100 required)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Main Project Image Alt Text</Label>
                <Input
                  value={imageAltText}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 255) {
                      setImageAltText(value);
                    }
                  }}
                  placeholder="Enter alt text for main project image"
                  maxLength={255}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {255 - imageAltText.length} characters remaining
                </p>

                <Label>Main Project Image</Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    {imageFile ? (
                      <div className="space-y-2">
                        <p className="text-sm text-green-600 font-medium">✅ Image Selected: {imageFile.name}</p>
                        <img
                          src={getFilePreview(imageFile)}
                          alt="Main project preview"
                          className="h-32 w-auto rounded border object-cover mx-auto"
                        />
                        <p className="text-xs text-gray-500">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Click to upload new main project image</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (optional)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <Label>Tags (Optional)</Label>
                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Selected Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tagId => {
                        const tag = tags?.find((t: any) => t.id === tagId);
                        return tag ? (
                          <Badge key={tagId} variant="default" className="flex items-center gap-1">
                            {tag.name}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeTag(tagId)}
                            />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Available Tags */}
                {tags && tags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Available Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {tags
                        .filter((tag: any) => !selectedTags.includes(tag.id))
                        .map((tag: any) => (
                          <Badge 
                            key={tag.id} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                            onClick={() => handleTagToggle(tag.id)}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hero" className="space-y-4">
            {/* Hero Section */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">Hero Section (Optional)</Label>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={sectionsData.hero_section.title}
                  onChange={(e) => updateSection("hero_section", "title", e.target.value)}
                  placeholder="Enter hero section title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={sectionsData.hero_section.description}
                  onChange={(e) => updateSection("hero_section", "description", e.target.value)}
                  placeholder="Enter hero section description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Hero Images</Label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleHeroImagesChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    {heroSectionImages.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm text-green-600 font-medium">✅ {heroSectionImages.length} Image(s) Selected</p>
                        <div className="space-y-4">
                          {heroSectionImages.map((file, index) => (
                            <div key={index} className="space-y-2 p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getFilePreview(file)}
                                  alt={`Hero preview ${index + 1}`}
                                  className="h-20 w-20 rounded border object-cover flex-shrink-0"
                                />
                                <div className="flex-1 space-y-2">
                                  <p className="text-xs text-gray-600 truncate">
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
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {255 - (heroSectionAltTexts[index]?.length || 0)} characters remaining
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">Click to change images</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Click to upload hero section images</p>
                        <p className="text-xs text-gray-500">Multiple images allowed • PNG, JPG, GIF (optional)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* About Section */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">About Section (Optional)</Label>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={sectionsData.about_section.title}
                  onChange={(e) => updateSection("about_section", "title", e.target.value)}
                  placeholder="Enter about section title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={sectionsData.about_section.description}
                  onChange={(e) => updateSection("about_section", "description", e.target.value)}
                  placeholder="Enter about section description"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="space-y-4">
              <Label className="text-lg font-medium">Project Goals Section (Optional)</Label>
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={sectionsData.project_goals_section.title}
                  onChange={(e) => updateSection("project_goals_section", "title", e.target.value)}
                  placeholder="Enter project goals section title"
                />
              </div>

              <Separator />

              {/* Sub-sections */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Goal Sub-sections</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProjectGoalSubSection}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </div>

                {sectionsData.project_goals_section.sub_sections.map((subSection, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Goal {index + 1}</Label>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProjectGoalSubSection(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      value={subSection.title}
                      onChange={(e) => updateProjectGoalSubSection(index, "title", e.target.value)}
                      placeholder="Enter goal title"
                    />
                    <div className="space-y-2">
                      <Label>Goal Icon</Label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleProjectGoalImageChange(index, e)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-blue-200 rounded-lg p-3 text-center hover:border-blue-300 transition-colors">
                          {projectGoalsImages[index] ? (
                            <div className="space-y-2">
                              <p className="text-sm text-green-600 font-medium">✅ Icon Selected: {projectGoalsImages[index]!.name}</p>
                              <img
                                src={getFilePreview(projectGoalsImages[index]!)}
                                alt={`Goal ${index + 1} icon preview`}
                                className="h-16 w-16 rounded border object-cover mx-auto"
                              />
                              <p className="text-xs text-gray-500">Click to change icon</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Click to upload goal icon</p>
                              <p className="text-xs text-blue-600">📌 One icon per goal • PNG, JPG, SVG (optional)</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Alt text field for goal icon */}
                      {projectGoalsImages[index] && (
                        <div className="space-y-2">
                          <Label htmlFor={`goalAlt${index}`}>Goal Icon Alt Text</Label>
                          <Input
                            id={`goalAlt${index}`}
                            value={projectGoalsAltTexts[index] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 255) {
                                setProjectGoalsAltTexts((prev) => ({
                                  ...prev,
                                  [index]: value,
                                }));
                              }
                            }}
                            placeholder={`Alt text for goal ${index + 1} icon`}
                            maxLength={255}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {255 - (projectGoalsAltTexts[index]?.length || 0)} characters remaining
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Approaches */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Approaches</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProjectGoalApproach}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Approach
                  </Button>
                </div>

                {sectionsData.project_goals_section.approaches.map((approach, approachIndex) => (
                  <div key={approachIndex} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Approach {approachIndex + 1}</Label>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProjectGoalApproach(approachIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      value={approach.title}
                      onChange={(e) => updateProjectGoalApproach(approachIndex, "title", e.target.value)}
                      placeholder="Enter approach title"
                    />
                    <Textarea
                      value={approach.description}
                      onChange={(e) => updateProjectGoalApproach(approachIndex, "description", e.target.value)}
                      placeholder="Enter approach description"
                      rows={3}
                    />
                    
                    {/* Additional Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Additional points</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addApproachInfo(approachIndex)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Info
                        </Button>
                      </div>
                      {approach.additional_info.map((info, infoIndex) => (
                        <div key={infoIndex} className="flex gap-2">
                          <Input
                            value={info}
                            onChange={(e) => updateApproachInfo(approachIndex, infoIndex, e.target.value)}
                            placeholder="Enter additional point"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeApproachInfo(approachIndex, infoIndex)}
                            disabled={approach.additional_info.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tech" className="space-y-4">
            <div className="space-y-4">
              <Label className="text-lg font-medium">Technologies Used Section (Optional)</Label>
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={sectionsData.technologies_used_section.title}
                  onChange={(e) => updateSection("technologies_used_section", "title", e.target.value)}
                  placeholder="Enter technologies section title"
                />
              </div>
              <div className="space-y-2">
                <Label>Section Description</Label>
                <Textarea
                  value={sectionsData.technologies_used_section.description}
                  onChange={(e) => updateSection("technologies_used_section", "description", e.target.value)}
                  placeholder="Enter technologies section description"
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Technology Categories</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTechnologySubSection}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Technology Category
                  </Button>
                </div>

                {sectionsData.technologies_used_section.sub_sections.map((subSection, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Technology Category {index + 1}</Label>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeTechnologySubSection(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        value={subSection.title}
                        onChange={(e) => updateTechnologySubSection(index, "title", e.target.value)}
                        placeholder="Enter technology category title"
                      />
                      <Input
                        value={subSection.description}
                        onChange={(e) => updateTechnologySubSection(index, "description", e.target.value)}
                        placeholder="Enter category description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Technology Images</Label>
                      <div className="relative">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleTechnologyImagesChange(index, e)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border-2 border-dashed border-green-200 rounded-lg p-3 text-center hover:border-green-300 transition-colors">
                          {technologiesImages[index] && technologiesImages[index].length > 0 ? (
                            <div className="space-y-3">
                              <p className="text-sm text-green-600 font-medium">✅ {technologiesImages[index].length} Image(s) Selected</p>
                              <div className="space-y-4">
                                {technologiesImages[index].map((file, fileIndex) => (
                                  <div key={fileIndex} className="space-y-2 p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={getFilePreview(file)}
                                        alt={`Tech ${index + 1} preview ${fileIndex + 1}`}
                                        className="h-20 w-20 rounded border object-cover flex-shrink-0"
                                      />
                                      <div className="flex-1 space-y-2">
                                        <p className="text-xs text-gray-600 truncate">
                                          {file.name}
                                        </p>
                                        <div>
                                          <Label htmlFor={`techAlt${index}_${fileIndex}`}>Alt Text</Label>
                                          <Input
                                            id={`techAlt${index}_${fileIndex}`}
                                            value={technologiesAltTexts[index]?.[fileIndex] || ""}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              if (value.length <= 255) {
                                                setTechnologiesAltTexts((prev) => ({
                                                  ...prev,
                                                  [index]: (prev[index] || []).map((altText, i) =>
                                                    i === fileIndex ? value : altText
                                                  ),
                                                }));
                                              }
                                            }}
                                            placeholder={`Alt text for technology image ${fileIndex + 1}`}
                                            maxLength={255}
                                          />
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {255 - (technologiesAltTexts[index]?.[fileIndex]?.length || 0)} characters remaining
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500">Click to change images</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Click to upload technology images</p>
                              <p className="text-xs text-green-600">🖼️ Multiple images allowed • PNG, JPG, GIF (optional)</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="space-y-4">
              <Label className="text-lg font-medium">Services Provided Section (Optional)</Label>
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={sectionsData.services_provided_section.title}
                  onChange={(e) => updateSection("services_provided_section", "title", e.target.value)}
                  placeholder="Enter services section title"
                />
              </div>
              <div className="space-y-2">
                <Label>Section Description</Label>
                <Textarea
                  value={sectionsData.services_provided_section.description}
                  onChange={(e) => updateSection("services_provided_section", "description", e.target.value)}
                  placeholder="Enter services section description"
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Services</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addServiceSubSection}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>

                {sectionsData.services_provided_section.sub_sections.map((service, serviceIndex) => (
                  <div key={serviceIndex} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Service {serviceIndex + 1}</Label>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeServiceSubSection(serviceIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      value={service.title}
                      onChange={(e) => updateServiceSubSection(serviceIndex, "title", e.target.value)}
                      placeholder="Enter service title"
                    />
                    <Textarea
                      value={service.description}
                      onChange={(e) => updateServiceSubSection(serviceIndex, "description", e.target.value)}
                      placeholder="Enter service description"
                      rows={3}
                    />
                    
                    {/* Additional Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Service Features</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addServiceInfo(serviceIndex)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Feature
                        </Button>
                      </div>
                      {service.additional_info.map((info, infoIndex) => (
                        <div key={infoIndex} className="flex gap-2">
                          <Input
                            value={info}
                            onChange={(e) => updateServiceInfo(serviceIndex, infoIndex, e.target.value)}
                            placeholder="Enter service feature"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeServiceInfo(serviceIndex, infoIndex)}
                            disabled={service.additional_info.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col items-start gap-4 pt-4">
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_URL || ""}
            onChange={onCaptchaChange}
          />
          
          <DialogFooter className="w-full">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={editProject.isPending || !captchaVerified}
              variant="blue"
            >
              {editProject.isPending ? "Updating..." : "Update Project"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}