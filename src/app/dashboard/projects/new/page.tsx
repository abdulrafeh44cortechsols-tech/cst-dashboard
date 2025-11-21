"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { X, Plus, Trash2, Save, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ProjectGoalSubSection {
  title: string;
  image_alt_text?: string;
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

export default function AddProjectPage() {
  const router = useRouter();
  const { addProject } = useProjects();
  const { getTags } = useTags();
  const { data: tagsResponse } = getTags;
  const tags = tagsResponse?.data;

  // Basic project fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  // Main project image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAltText, setImageAltText] = useState<string>("");

  // Hero section images
  const [heroSectionImages, setHeroSectionImages] = useState<File[]>([]);
  const [heroSectionAltTexts, setHeroSectionAltTexts] = useState<string[]>([]);

  // Project goals section images (icons - one per subsection)
  const [projectGoalsImages, setProjectGoalsImages] = useState<
    Record<number, File | null>
  >({});
  const [projectGoalsAltTexts, setProjectGoalsAltTexts] = useState<
    Record<number, string>
  >({});

  // Technologies section images (multiple per subsection)
  const [technologiesImages, setTechnologiesImages] = useState<
    Record<number, File[]>
  >({});
  const [technologiesAltTexts, setTechnologiesAltTexts] = useState<
    Record<number, string[]>
  >({});


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
  const [heroDescriptionError, setHeroDescriptionError] = useState<string | null>(null);
  const [aboutDescriptionError, setAboutDescriptionError] = useState<string | null>(null);
  const [techDescriptionError, setTechDescriptionError] = useState<string | null>(null);
  const [servicesDescriptionError, setServicesDescriptionError] = useState<string | null>(null);
  const [serviceSubDescriptionErrors, setServiceSubDescriptionErrors] = useState<Record<number, string | null>>({});

  // Draft management state
  const [draftExists, setDraftExists] = useState(false);
  const [lastDraftSave, setLastDraftSave] = useState<Date | null>(null);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const DRAFT_KEY = "project_draft_data";
  const DRAFT_SAVE_INTERVAL = 30000; // 30 seconds

  const handleNameChange = (value: string) => {
    setName(value);
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 40); // Limit to 40 characters
    setSlug(generatedSlug);
  };

  // Draft management functions
  const saveDraft = useCallback(() => {
    if (!autoSaveEnabled) return;

    const draftData = {
      name,
      slug,
      description,
      selectedTags,
      sectionsData,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      setLastDraftSave(new Date());
      setDraftExists(true);
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, [name, slug, description, selectedTags, sectionsData, autoSaveEnabled]);

  const loadDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        setName(draftData.name || "");
        setSlug(draftData.slug || "");
        setDescription(draftData.description || "");
        setSelectedTags(draftData.selectedTags || []);
        setSectionsData(
          draftData.sectionsData || {
            hero_section: { title: "", description: "", sub_sections: [] },
            about_section: { title: "", description: "" },
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
          }
        );
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
      if (name || description) {
        saveDraft();
      }
    }, DRAFT_SAVE_INTERVAL);

    return () => clearInterval(autoSaveInterval);
  }, [saveDraft, name, description, autoSaveEnabled]);

  // Check for existing draft on component mount
  useEffect(() => {
    checkForExistingDraft();
  }, [checkForExistingDraft]);

  // Save draft when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (name || description) {
        saveDraft();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveDraft, name, description]);

  // Section update helpers
  const updateSection = (
    sectionKey: keyof ProjectSectionsData,
    field: string,
    value: any
  ) => {
    setSectionsData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  };

  // Project Goals Section helpers
  const addProjectGoalSubSection = () => {
    setSectionsData((prev) => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        sub_sections: [
          ...prev.project_goals_section.sub_sections,
          { title: "" },
        ],
      },
    }));
  };

  const removeProjectGoalSubSection = (index: number) => {
    setSectionsData((prev) => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        sub_sections: prev.project_goals_section.sub_sections.filter(
          (_, i) => i !== index
        ),
      },
    }));
    // Remove associated image
    setProjectGoalsImages((prev) => {
      const newImages = { ...prev };
      delete newImages[index];
      return newImages;
    });
  };

  const updateProjectGoalSubSection = (
    index: number,
    field: string,
    value: string
  ) => {
    setSectionsData((prev) => ({
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
    setSectionsData((prev) => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        approaches: [
          ...prev.project_goals_section.approaches,
          { title: "", description: "", additional_info: [""] },
        ],
      },
    }));
  };

  const removeProjectGoalApproach = (index: number) => {
    setSectionsData((prev) => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        approaches: prev.project_goals_section.approaches.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const updateProjectGoalApproach = (
    index: number,
    field: string,
    value: any
  ) => {
    setSectionsData((prev) => ({
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
    setSectionsData((prev) => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        approaches: prev.project_goals_section.approaches.map((approach, i) =>
          i === approachIndex
            ? {
                ...approach,
                additional_info: [...approach.additional_info, ""],
              }
            : approach
        ),
      },
    }));
  };

  const removeApproachInfo = (approachIndex: number, infoIndex: number) => {
    setSectionsData((prev) => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        approaches: prev.project_goals_section.approaches.map((approach, i) =>
          i === approachIndex
            ? {
                ...approach,
                additional_info: approach.additional_info.filter(
                  (_, idx) => idx !== infoIndex
                ),
              }
            : approach
        ),
      },
    }));
  };

  const updateApproachInfo = (
    approachIndex: number,
    infoIndex: number,
    value: string
  ) => {
    setSectionsData((prev) => ({
      ...prev,
      project_goals_section: {
        ...prev.project_goals_section,
        approaches: prev.project_goals_section.approaches.map((approach, i) =>
          i === approachIndex
            ? {
                ...approach,
                additional_info: approach.additional_info.map((info, idx) =>
                  idx === infoIndex ? value : info
                ),
              }
            : approach
        ),
      },
    }));
  };

  // Technologies Section helpers
  const addTechnologySubSection = () => {
    setSectionsData((prev) => ({
      ...prev,
      technologies_used_section: {
        ...prev.technologies_used_section,
        sub_sections: [
          ...prev.technologies_used_section.sub_sections,
          { title: "", image_count: 0, description: "" },
        ],
      },
    }));
  };

  const removeTechnologySubSection = (index: number) => {
    setSectionsData((prev) => ({
      ...prev,
      technologies_used_section: {
        ...prev.technologies_used_section,
        sub_sections: prev.technologies_used_section.sub_sections.filter(
          (_, i) => i !== index
        ),
      },
    }));
    // Remove associated images
    setTechnologiesImages((prev) => {
      const newImages = { ...prev };
      delete newImages[index];
      return newImages;
    });
  };

  const updateTechnologySubSection = (
    index: number,
    field: string,
    value: any
  ) => {
    setSectionsData((prev) => ({
      ...prev,
      technologies_used_section: {
        ...prev.technologies_used_section,
        sub_sections: prev.technologies_used_section.sub_sections.map(
          (item, i) => (i === index ? { ...item, [field]: value } : item)
        ),
      },
    }));
  };

  // Services Section helpers
  const addServiceSubSection = () => {
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
  };

  const removeServiceSubSection = (index: number) => {
    setSectionsData((prev) => ({
      ...prev,
      services_provided_section: {
        ...prev.services_provided_section,
        sub_sections: prev.services_provided_section.sub_sections.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const updateServiceSubSection = (
    index: number,
    field: string,
    value: any
  ) => {
    setSectionsData((prev) => ({
      ...prev,
      services_provided_section: {
        ...prev.services_provided_section,
        sub_sections: prev.services_provided_section.sub_sections.map(
          (item, i) => (i === index ? { ...item, [field]: value } : item)
        ),
      },
    }));
  };

  const addServiceInfo = (serviceIndex: number) => {
    setSectionsData((prev) => ({
      ...prev,
      services_provided_section: {
        ...prev.services_provided_section,
        sub_sections: prev.services_provided_section.sub_sections.map(
          (service, i) =>
            i === serviceIndex
              ? {
                  ...service,
                  additional_info: [...service.additional_info, ""],
                }
              : service
        ),
      },
    }));
  };

  const removeServiceInfo = (serviceIndex: number, infoIndex: number) => {
    setSectionsData((prev) => ({
      ...prev,
      services_provided_section: {
        ...prev.services_provided_section,
        sub_sections: prev.services_provided_section.sub_sections.map(
          (service, i) =>
            i === serviceIndex
              ? {
                  ...service,
                  additional_info: service.additional_info.filter(
                    (_, idx) => idx !== infoIndex
                  ),
                }
              : service
        ),
      },
    }));
  };

  const updateServiceInfo = (
    serviceIndex: number,
    infoIndex: number,
    value: string
  ) => {
    setSectionsData((prev) => ({
      ...prev,
      services_provided_section: {
        ...prev.services_provided_section,
        sub_sections: prev.services_provided_section.sub_sections.map(
          (service, i) =>
            i === serviceIndex
              ? {
                  ...service,
                  additional_info: service.additional_info.map((info, idx) =>
                    idx === infoIndex ? value : info
                  ),
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

  const handleProjectGoalImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setProjectGoalsImages((prev) => ({
        ...prev,
        [index]: e.target.files![0],
      }));
      
      // Initialize alt text for this goal
      setProjectGoalsAltTexts((prev) => ({
        ...prev,
        [index]: "",
      }));
    }
  };

  const handleTechnologyImagesChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files!);
      setTechnologiesImages((prev) => ({
        ...prev,
        [index]: filesArray,
      }));
      
      // Initialize alt text array for this technology subsection
      setTechnologiesAltTexts((prev) => ({
        ...prev,
        [index]: new Array(filesArray.length).fill(""),
      }));
      
      // Update image count in sections data
      updateTechnologySubSection(index, "image_count", e.target.files.length);
    }
  };

  // Helper function to get file preview
  const getFilePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const removeTag = (tagId: number) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      toast.error(
        "Slug can only contain lowercase letters, numbers, and hyphens."
      );
      return;
    }


    // Validate project section descriptions
    // Hero section
    if (
      sectionsData.hero_section.description &&
      sectionsData.hero_section.description.length < 100
    ) {
      toast.error(
        "Hero section description must be at least 100 characters long."
      );
      return;
    }

    // About section
    if (
      sectionsData.about_section.description &&
      sectionsData.about_section.description.length < 100
    ) {
      toast.error(
        "About section description must be at least 100 characters long."
      );
      return;
    }

    // Technologies section
    if (
      sectionsData.technologies_used_section.description &&
      sectionsData.technologies_used_section.description.length < 100
    ) {
      toast.error(
        "Technologies section description must be at least 100 characters long."
      );
      return;
    }

    // Services section
    if (
      sectionsData.services_provided_section.description &&
      sectionsData.services_provided_section.description.length < 100
    ) {
      toast.error(
        "Services section description must be at least 100 characters long."
      );
      return;
    }

    // Validate sub-section descriptions for sections that have them
    // Hero section sub-sections
    if (
      sectionsData.hero_section.sub_sections &&
      Array.isArray(sectionsData.hero_section.sub_sections)
    ) {
      for (let i = 0; i < sectionsData.hero_section.sub_sections.length; i++) {
        const subSection = sectionsData.hero_section.sub_sections[i];
        if (subSection.description && subSection.description.length < 100) {
          toast.error(
            `Hero section sub-section ${
              i + 1
            } description must be at least 100 characters long.`
          );
          return;
        }
      }
    }

    // Technologies section sub-sections
    if (
      sectionsData.technologies_used_section.sub_sections &&
      Array.isArray(sectionsData.technologies_used_section.sub_sections)
    ) {
      for (
        let i = 0;
        i < sectionsData.technologies_used_section.sub_sections.length;
        i++
      ) {
        const subSection =
          sectionsData.technologies_used_section.sub_sections[i];
        if (subSection.description && subSection.description.length < 100) {
          toast.error(
            `Technologies section sub-section ${
              i + 1
            } description must be at least 100 characters long.`
          );
          return;
        }
      }
    }

    // Services section sub-sections
    if (
      sectionsData.services_provided_section.sub_sections &&
      Array.isArray(sectionsData.services_provided_section.sub_sections)
    ) {
      for (
        let i = 0;
        i < sectionsData.services_provided_section.sub_sections.length;
        i++
      ) {
        const subSection =
          sectionsData.services_provided_section.sub_sections[i];
        if (subSection.description && subSection.description.length < 100) {
          toast.error(
            `Services section sub-section ${
              i + 1
            } description must be at least 100 characters long.`
          );
          return;
        }
      }
    }

    try {
      const formData = new FormData();

      // Add basic fields
      formData.append("name", name);
      formData.append("description", description);
      formData.append("slug", slug);

      // Add selected tags as JSON array
      if (selectedTags.length > 0) {
        formData.append("tag_ids", JSON.stringify(selectedTags));
      }

      // Add main image file
      if (imageFile) {
        formData.append("image_file", imageFile);
      }

      // Add main image alt text
      if (imageAltText) {
        formData.append("image_alt_text", imageAltText);
      }

      // Add hero section images
      heroSectionImages.forEach((file: File) => {
        formData.append("hero_section_image_files", file);
      });

      // Add hero section alt texts
      if (heroSectionAltTexts.length > 0) {
        formData.append("hero_section_image_alt_text", JSON.stringify(heroSectionAltTexts));
      }

      // Add project goals section images (icons)
      Object.values(projectGoalsImages).forEach((file) => {
        if (file) {
          formData.append("project_goals_section_image_files", file);
        }
      });

      // Add project goals alt texts
      const goalAltTexts = Object.values(projectGoalsAltTexts).filter(text => text);
      if (goalAltTexts.length > 0) {
        formData.append("project_goals_section_image_alt_text", JSON.stringify(goalAltTexts));
      }

      // Add technologies section images
      Object.values(technologiesImages).forEach((files) => {
        files.forEach((file) => {
          formData.append("technologies_used_section_image_files", file);
        });
      });

      // Add technologies alt texts
      const techAltTexts = Object.values(technologiesAltTexts).flat().filter(text => text);
      if (techAltTexts.length > 0) {
        formData.append("technologies_used_section_image_alt_text", JSON.stringify(techAltTexts));
      }

      // Add sections data as JSON
      formData.append("sections_data", JSON.stringify(sectionsData));

      await addProject.mutateAsync(formData);

      // Clear draft after successful submission
      clearDraft();

      toast.success("Project created successfully!");
      router.push("/dashboard/projects");
    } catch (error: any) {
      toast.error("Failed to create project. Please try again.");
      console.error("Project creation error:", error);
    }
  };

  return (
    <div className="w-full mx-auto p-4 max-w-6xl">
      <div className="flex md:flex-row flex-col justify-between items-center mb-6 gap-3">
        <h1 className="text-3xl font-semibold">Create New Project</h1>
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
          <CardContent className="">
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic" className="cursor-pointer">Basic Info</TabsTrigger>
            <TabsTrigger value="hero" className="cursor-pointer">Hero & About</TabsTrigger>
            <TabsTrigger value="goals" className="cursor-pointer">Project Goals</TabsTrigger>
            <TabsTrigger value="tech" className="cursor-pointer">Technologies</TabsTrigger>
            <TabsTrigger value="services" className="cursor-pointer">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Basic Project Information */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name * - h2</Label>
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
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {100 - name.length} characters remaining
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Project Slug *</Label>
                    <Input
                      id="slug"
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 40) {
                          setSlug(
                            value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                          );
                        }
                      }}
                      placeholder="project-slug"
                      maxLength={40}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {40 - slug.length} characters remaining (lowercase
                      letters, numbers, hyphens only)
                    </p>
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
                      id="mainImage"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      {imageFile ? (
                        <div className="space-y-2">
                          <p className="text-sm text-green-600 font-medium">
                            ✅ Image Selected: {imageFile.name}
                          </p>
                          <img
                            src={getFilePreview(imageFile)}
                            alt="Main project preview"
                            className="h-32 w-auto rounded border object-cover mx-auto"
                          />
                          <p className="text-xs text-gray-500">
                            Click to change image
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Click to upload main project image
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tagId) => {
                        const tag = tags?.find((t: any) => t.id === tagId);
                        return tag ? (
                          <Badge
                            key={tagId}
                            variant="default"
                            className="flex items-center gap-1"
                          >
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
                    <Label>Available Tags</Label>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hero" className="space-y-4">
            {/* Hero Section */}
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title - h2</Label>
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
                          <p className="text-sm text-green-600 font-medium">
                            ✅ {heroSectionImages.length} Image(s) Selected
                          </p>
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
                          <p className="text-xs text-gray-500">
                            Click to change images
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Click to upload hero section images
                          </p>
                          <p className="text-xs text-gray-500">
                            Multiple images allowed • PNG, JPG, GIF
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div> */}
              </CardContent>
            </Card>

            {/* About Section */}
            {/* <Card>
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
            </Card> */}
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
                    onChange={(e) =>
                      updateSection(
                        "project_goals_section",
                        "title",
                        e.target.value
                      )
                    }
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

                  {sectionsData.project_goals_section.sub_sections.map(
                    (subSection, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <Label>Goal {index + 1} - p</Label>
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
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 100) {
                              updateProjectGoalSubSection(
                                index,
                                "title",
                                value
                              );
                            }
                          }}
                          placeholder="Enter goal title"
                          maxLength={100}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {100 - (subSection.title?.length || 0)} characters
                          remaining
                        </p>
                        <div className="space-y-2">
                          <Label>Goal Icon (Upload one icon per goal)</Label>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleProjectGoalImageChange(index, e)
                              }
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="border-2 border-dashed border-blue-200 rounded-lg p-3 text-center hover:border-blue-300 transition-colors">
                              {projectGoalsImages[index] ? (
                                <div className="space-y-2">
                                  <p className="text-sm text-green-600 font-medium">
                                    ✅ Icon Selected:{" "}
                                    {projectGoalsImages[index]!.name}
                                  </p>
                                  <img
                                    src={getFilePreview(
                                      projectGoalsImages[index]!
                                    )}
                                    alt={`Goal ${index + 1} icon preview`}
                                    className="h-16 w-16 rounded border object-cover mx-auto"
                                  />
                                  <p className="text-xs text-gray-500">
                                    Click to change icon
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-sm text-gray-600">
                                    Click to upload goal icon
                                  </p>
                                  <p className="text-xs text-blue-600">
                                    📌 One icon per goal • PNG, JPG, SVG
                                  </p>
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
                    )
                  )}
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

                  {sectionsData.project_goals_section.approaches.map(
                    (approach, approachIndex) => (
                      <div
                        key={approachIndex}
                        className="p-4 border rounded-lg space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <Label>Approach {approachIndex + 1}</Label>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              removeProjectGoalApproach(approachIndex)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={approach.title}
                          onChange={(e) =>
                            updateProjectGoalApproach(
                              approachIndex,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="Enter approach title"
                        />
                        <Textarea
                          value={approach.description}
                          onChange={(e) =>
                            updateProjectGoalApproach(
                              approachIndex,
                              "description",
                              e.target.value
                            )
                          }
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
                                onChange={(e) =>
                                  updateApproachInfo(
                                    approachIndex,
                                    infoIndex,
                                    e.target.value
                                  )
                                }
                                placeholder="Enter additional point"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  removeApproachInfo(approachIndex, infoIndex)
                                }
                                disabled={approach.additional_info.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
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

                  {sectionsData.technologies_used_section.sub_sections.map(
                    (subSection, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-4"
                      >
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
                          <div>
                            <Label>Title - h2</Label>
                            <Input
                              value={subSection.title}
                              onChange={(e) =>
                                updateTechnologySubSection(
                                  index,
                                  "title",
                                  e.target.value
                                )
                              }
                              placeholder="Enter technology category title"
                            />
                          </div>
                          <div>
                            <Label>Description - p</Label>
                            <Textarea
                              value={subSection.description}
                              onChange={(e) =>
                                updateTechnologySubSection(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Enter category description"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>
                            Technology Images (Multiple images allowed)
                          </Label>
                          <div className="relative">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) =>
                                handleTechnologyImagesChange(index, e)
                              }
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="border-2 border-dashed border-green-200 rounded-lg p-3 text-center hover:border-green-300 transition-colors">
                              {technologiesImages[index] &&
                              technologiesImages[index].length > 0 ? (
                                <div className="space-y-3">
                                  <p className="text-sm text-green-600 font-medium">
                                    ✅ {technologiesImages[index].length}{" "}
                                    Image(s) Selected
                                  </p>
                                  <div className="space-y-4">
                                    {technologiesImages[index].map(
                                      (file, fileIndex) => (
                                        <div
                                          key={fileIndex}
                                          className="space-y-2 p-3 border rounded-lg"
                                        >
                                          <div className="flex items-center gap-3">
                                            <img
                                              src={getFilePreview(file)}
                                              alt={`Tech ${index + 1} preview ${
                                                fileIndex + 1
                                              }`}
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
                                      )
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Click to change images
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-sm text-gray-600">
                                    Click to upload technology images
                                  </p>
                                  <p className="text-xs text-green-600">
                                    🖼️ Multiple images allowed • PNG, JPG, GIF
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
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

                  {sectionsData.services_provided_section.sub_sections.map(
                    (service, serviceIndex) => (
                      <div
                        key={serviceIndex}
                        className="p-4 border rounded-lg space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <Label>Service {serviceIndex + 1}</Label>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              removeServiceSubSection(serviceIndex)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div>
                          <Label>Title - h2</Label>
                          <Input
                            value={service.title}
                            onChange={(e) =>
                              updateServiceSubSection(
                                serviceIndex,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Enter service title"
                          />
                        </div>
                        <div>
                          <Label>Description - p</Label>
                          <Textarea
                            value={service.description}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateServiceSubSection(
                                serviceIndex,
                                "description",
                                value
                              );
                              // real-time validation per sub-section
                              setServiceSubDescriptionErrors((prev) => ({
                                ...prev,
                                [serviceIndex]: value.trim().length > 0 && value.trim().length < 100
                                  ? `Services section sub-section ${serviceIndex + 1} description must be at least 100 characters long.`
                                  : null,
                              }));
                            }}
                            placeholder="Enter service description"
                            rows={3}
                            className={serviceSubDescriptionErrors[serviceIndex] ? "border-red-500 focus-visible:ring-red-500" : undefined}
                          />
                          {serviceSubDescriptionErrors[serviceIndex] && (
                            <p className="text-sm text-red-600 mt-1">{serviceSubDescriptionErrors[serviceIndex]}</p>
                          )}
                        </div>

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
                                onChange={(e) =>
                                  updateServiceInfo(
                                    serviceIndex,
                                    infoIndex,
                                    e.target.value
                                  )
                                }
                                placeholder="Enter service feature - p"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  removeServiceInfo(serviceIndex, infoIndex)
                                }
                                disabled={service.additional_info.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex justify-end gap-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/projects")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addProject.isPending}
              variant="blue"
            >
              {addProject.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
