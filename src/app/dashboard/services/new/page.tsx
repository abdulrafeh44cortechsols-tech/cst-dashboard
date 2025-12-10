"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/hooks/useServices";
import { useMedia } from "@/hooks/useMedia";
import { servicesDataService } from "@/services/services";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Save, Trash2, RefreshCw, AlertCircle, Upload, ImageIcon, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { MediaGalleryModal } from "@/components/media/MediaGalleryModal";
import type { MediaItem } from "@/services/media";
import type { ServiceSectionsData } from "@/types/types";
import { getDefaultSectionsData } from "@/data/exampleServiceData";
import { getImageUrl } from "@/lib/utils";

export default function AddServicePage() {
  const router = useRouter();
  const { addService } = useServices(1, 10, false); // Don't fetch list - only need mutation
  // Disable media list fetch - we only need upload mutation
  const { uploadMedia } = useMedia(1, 10, false);

  // Basic service fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [projectsDelivered, setProjectsDelivered] = useState<string>("");
  const [clientsSatisfaction, setClientsSatisfaction] = useState<string>("");

  // Slug validation state
  const [slugCheckMessage, setSlugCheckMessage] = useState<string>("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // Media state for uploaded images
  const [serviceMainImageId, setServiceMainImageId] = useState<number | null>(null);
  const [serviceMainImageUrl, setServiceMainImageUrl] = useState<string>("");
  const [iconId, setIconId] = useState<number | null>(null);
  const [iconUrl, setIconUrl] = useState<string>("");
  const [heroImageId, setHeroImageId] = useState<number | null>(null);
  const [uploadedMediaUrls, setUploadedMediaUrls] = useState<Record<string, string>>({});

  // Alt text for icon and service main image
  const [iconAltText, setIconAltText] = useState<string>("");
  const [serviceMainImageAltText, setServiceMainImageAltText] = useState<string>("");


  // Sections data
  const [sectionsData, setSectionsData] = useState<ServiceSectionsData>(
    getDefaultSectionsData()
  );
  const SECTIONS_WITHOUT_IMAGES = [
    'about_section',
    'why_choose_us_section',
    'what_we_offer_section',
    'perfect_business_section',
    'design_section',
    'team_section',
    'tools_used_section',
    'client_feedback_section'
  ];


  // File states for each section
  const [sectionFiles, setSectionFiles] = useState<Record<string, File[]>>({
    hero_section_image_file: [],
    about_section_image_files: [],
    why_choose_us_section_image_files: [],
    what_we_offer_section_image_files: [],
    perfect_business_section_image_files: [],
    design_section_image_files: [],
    team_section_image_files: [],
    tools_used_section_image_files: [],
    client_feedback_section_image_files: [],
    image_files: [],
  });

  // Image alt text states
  const [imageAltTexts, setImageAltTexts] = useState<string[]>([]);
  const [sectionAltTexts, setSectionAltTexts] = useState<Record<string, string[]>>({
    hero_section_image_file: [],
    about_section_image_files: [],
    why_choose_us_section_image_files: [],
    what_we_offer_section_image_files: [],
    perfect_business_section_image_files: [],
    design_section_image_files: [],
    team_section_image_files: [],
    tools_used_section_image_files: [],
    client_feedback_section_image_files: [],
  });

  // Sub-section icon files state
  const [subSectionIcons, setSubSectionIcons] = useState<
    Record<string, Record<number, File[]>>
  >({});

  // Sub-section icon alt texts state
  const [subSectionIconAltTexts, setSubSectionIconAltTexts] = useState<
    Record<string, Record<number, string[]>>
  >({});

  // Team member images state
  const [teamMemberImages, setTeamMemberImages] = useState<Record<number, File[]>>({});

  // Media gallery modal states
  const [showIconGallery, setShowIconGallery] = useState(false);
  const [showMainImageGallery, setShowMainImageGallery] = useState(false);
  const [showHeroGallery, setShowHeroGallery] = useState(false);
  const [iconFromGallery, setIconFromGallery] = useState(false);
  const [mainImageFromGallery, setMainImageFromGallery] = useState(false);
  const [heroFromGallery, setHeroFromGallery] = useState(false);
  // Sub-section gallery modal states (keyed by sectionKey and index)
  const [showSubSectionGallery, setShowSubSectionGallery] = useState<{ sectionKey: string; index: number } | null>(null);
  const [showClientFeedbackGallery, setShowClientFeedbackGallery] = useState<number | null>(null);
  const [showTeamMemberGallery, setShowTeamMemberGallery] = useState<number | null>(null);

  // Team member image alt texts state
  const [teamMemberImageAltTexts, setTeamMemberImageAltTexts] = useState<Record<number, string[]>>({});

  // Client feedback images state
  const [clientFeedbackImages, setClientFeedbackImages] = useState<Record<number, File[]>>({});

  // Client feedback image alt texts state
  const [clientFeedbackImageAltTexts, setClientFeedbackImageAltTexts] = useState<Record<number, string[]>>({});

  // Draft management state
  const [draftExists, setDraftExists] = useState(false);
  const [lastDraftSave, setLastDraftSave] = useState<Date | null>(null);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Validation error states for real-time feedback
  const [errors, setErrors] = useState<Record<string, string>>({});

  const DRAFT_KEY = "service_draft_data";
  const DRAFT_SAVE_INTERVAL = 30000; // 30 seconds

  // Utility function to generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
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
        const response = await servicesDataService.checkSlugAvailability(slug, 'service');
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

  // Real-time validation functions
  const validateField = (fieldName: string, value: string) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'Service title is required';
        } else if (value.length > 100) {
          newErrors.title = 'Service title must be 100 characters or less';
        } else {
          delete newErrors.title;
        }
        break;

      case 'slug':
        if (!value.trim()) {
          newErrors.slug = 'Slug is required';
        } else if (!/^[a-z0-9-]+$/.test(value)) {
          newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
        } else {
          delete newErrors.slug;
        }
        break;

      case 'description':
        if (!value.trim()) {
          newErrors.description = 'Service description is required';
        } else if (value.length < 100) {
          newErrors.description = `Service description must be at least 100 characters (${value.length}/100)`;
        } else if (value.length > 400) {
          newErrors.description = 'Service description must be 400 characters or less';
        } else {
          delete newErrors.description;
        }
        break;

      case 'metaTitle':
        if (!value.trim()) {
          newErrors.metaTitle = 'Meta title is required';
        } else if (value.length > 60) {
          newErrors.metaTitle = 'Meta title must be 60 characters or less';
        } else {
          delete newErrors.metaTitle;
        }
        break;

      case 'metaDescription':
        if (!value.trim()) {
          newErrors.metaDescription = 'Meta description is required';
        } else if (value.length > 160) {
          newErrors.metaDescription = 'Meta description must be 160 characters or less';
        } else {
          delete newErrors.metaDescription;
        }
        break;
    }

    setErrors(newErrors);
  };

  // Scroll to error field
  const scrollToElement = (elementId: string) => {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }, 200);
  };

  // Draft management functions
  const saveDraft = useCallback(() => {
    if (!autoSaveEnabled) return;

    const draftData = {
      title,
      slug,
      description,
      metaTitle,
      metaDescription,
      published,
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
  }, [title, slug, description, metaTitle, metaDescription, published, sectionsData, autoSaveEnabled]);

  const loadDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        setTitle(draftData.title || "");
        setSlug(draftData.slug || "");
        setDescription(draftData.description || "");
        setMetaTitle(draftData.metaTitle || "");
        setMetaDescription(draftData.metaDescription || "");
        setPublished(draftData.published || false); // Load published field
        setSectionsData(draftData.sectionsData || getDefaultSectionsData());
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
      if (title || description || metaTitle || metaDescription) {
        saveDraft();
      }
    }, DRAFT_SAVE_INTERVAL);

    return () => clearInterval(autoSaveInterval);
  }, [saveDraft, title, description, metaTitle, metaDescription, published, autoSaveEnabled]);

  // Check for existing draft on component mount
  useEffect(() => {
    checkForExistingDraft();
  }, [checkForExistingDraft]);

  // Save draft when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (title || description || metaTitle || metaDescription) {
        saveDraft();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveDraft, title, description, metaTitle, metaDescription, published]);

  // Handle title change and auto-generate slug
  const handleTitleChange = (value: string) => {
    setTitle(value);
    validateField('title', value);
    if (!slug || slug === generateSlug(title)) {
      // Only auto-generate if slug is empty or was auto-generated before
      const newSlug = generateSlug(value);
      setSlug(newSlug);
      validateField('slug', newSlug);
    }
  };

  const updateSection = (
    sectionKey: keyof ServiceSectionsData,
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

  const updateSubSection = (
    sectionKey: keyof ServiceSectionsData,
    index: number,
    field: string,
    value: any
  ) => {
    setSectionsData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        sub_sections: prev[sectionKey].sub_sections.map((sub, i) =>
          i === index ? { ...sub, [field]: value } : sub
        ),
      },
    }));
  };

  const addSubSection = (sectionKey: keyof ServiceSectionsData) => {
    setSectionsData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        sub_sections: [
          ...prev[sectionKey].sub_sections,
          sectionKey === "team_section"
            ? { name: "", designation: "", experience: "", summary: "" }
            : sectionKey === "client_feedback_section"
              ? { name: "", designation: "", comment: "", stars: 5 }
              : sectionKey === "what_we_offer_section"
                ? { title: "", points: [""] }
                : { title: "", description: "" },
        ],
      },
    }));
  };

  const removeSubSection = (
    sectionKey: keyof ServiceSectionsData,
    index: number
  ) => {
    setSectionsData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        sub_sections: prev[sectionKey].sub_sections.filter(
          (_, i) => i !== index
        ),
      },
    }));

    // Remove corresponding icon files
    setSubSectionIcons((prev) => {
      const newState = { ...prev };
      if (newState[sectionKey]) {
        delete newState[sectionKey][index];
        // Reindex remaining icons
        const reindexed: Record<number, File[]> = {};
        Object.entries(newState[sectionKey]).forEach(([key, files]) => {
          const oldIndex = parseInt(key);
          if (oldIndex > index) {
            reindexed[oldIndex - 1] = files;
          } else if (oldIndex < index) {
            reindexed[oldIndex] = files;
          }
        });
        newState[sectionKey] = reindexed;
      }
      return newState;
    });

    // Remove team member images if it's team section
    if (sectionKey === 'team_section') {
      setTeamMemberImages(prev => {
        const newState = { ...prev };
        delete newState[index];
        // Reindex remaining images
        const reindexed: Record<number, File[]> = {};
        Object.entries(newState).forEach(([key, files]) => {
          const oldIndex = parseInt(key);
          if (oldIndex > index) {
            reindexed[oldIndex - 1] = files;
          } else if (oldIndex < index) {
            reindexed[oldIndex] = files;
          }
        });
        return reindexed;
      });
    }

    // Remove client feedback images if it's client feedback section
    if (sectionKey === 'client_feedback_section') {
      setClientFeedbackImages(prev => {
        const newState = { ...prev };
        delete newState[index];
        // Reindex remaining images
        const reindexed: Record<number, File[]> = {};
        Object.entries(newState).forEach(([key, files]) => {
          const oldIndex = parseInt(key);
          if (oldIndex > index) {
            reindexed[oldIndex - 1] = files;
          } else if (oldIndex < index) {
            reindexed[oldIndex] = files;
          }
        });
        return reindexed;
      });
    }
  };

  const addPoint = (sectionKey: keyof ServiceSectionsData, subSectionIndex: number) => {
    setSectionsData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        sub_sections: prev[sectionKey].sub_sections.map((sub, i) =>
          i === subSectionIndex
            ? { ...sub, points: [...(sub.points || []), ""] }
            : sub
        )
      }
    }));
  };

  const removePoint = (sectionKey: keyof ServiceSectionsData, subSectionIndex: number, pointIndex: number) => {
    setSectionsData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        sub_sections: prev[sectionKey].sub_sections.map((sub, i) =>
          i === subSectionIndex
            ? { ...sub, points: sub.points?.filter((_, idx) => idx !== pointIndex) || [] }
            : sub
        )
      }
    }));
  };

  const updatePoint = (sectionKey: keyof ServiceSectionsData, subSectionIndex: number, pointIndex: number, value: string) => {
    setSectionsData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        sub_sections: prev[sectionKey].sub_sections.map((sub, i) =>
          i === subSectionIndex
            ? {
              ...sub,
              points: sub.points?.map((point, idx) =>
                idx === pointIndex ? value : point
              ) || []
            }
            : sub
        )
      }
    }));
  };

  const handleFileChange = (sectionKey: string, files: FileList | null) => {
    if (files) {
      const filesArray = Array.from(files);
      setSectionFiles((prev) => ({
        ...prev,
        [sectionKey]: filesArray,
      }));

      // Initialize alt text arrays for the files
      if (sectionKey === 'image_files') {
        // For main service images
        setImageAltTexts(new Array(filesArray.length).fill(""));
      } else {
        // For section images
        setSectionAltTexts((prev) => ({
          ...prev,
          [sectionKey]: new Array(filesArray.length).fill(""),
        }));
      }
    }
  };

  const handleSubSectionIconChange = (
    sectionKey: string,
    subSectionIndex: number,
    files: FileList | null
  ) => {
    if (files) {
      const filesArray = Array.from(files);
      setSubSectionIcons((prev) => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          [subSectionIndex]: filesArray,
        },
      }));

      // Initialize alt text array for the icons
      setSubSectionIconAltTexts((prev) => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          [subSectionIndex]: new Array(filesArray.length).fill(""),
        },
      }));
    }
  };

  const handleTeamMemberImageChange = (memberIndex: number, files: FileList | null) => {
    if (files) {
      const filesArray = Array.from(files);
      setTeamMemberImages(prev => ({
        ...prev,
        [memberIndex]: filesArray
      }));

      // Initialize alt text array for team member images
      setTeamMemberImageAltTexts(prev => ({
        ...prev,
        [memberIndex]: new Array(filesArray.length).fill("")
      }));
    }
  };

  const handleClientFeedbackImageChange = (clientIndex: number, files: FileList | null) => {
    if (files) {
      const filesArray = Array.from(files);
      setClientFeedbackImages(prev => ({
        ...prev,
        [clientIndex]: filesArray
      }));

      // Initialize alt text array for client feedback images
      setClientFeedbackImageAltTexts(prev => ({
        ...prev,
        [clientIndex]: new Array(filesArray.length).fill("")
      }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    validateField('title', title);
    validateField('slug', slug);
    validateField('description', description);
    validateField('metaTitle', metaTitle);
    validateField('metaDescription', metaDescription);

    // Check for basic field errors and scroll to first error
    if (!title) {
      toast.error("Service title is required.");
      scrollToElement('service-title');
      return;
    }

    if (title.length > 100) {
      toast.error("Service title must be 100 characters or less.");
      scrollToElement('service-title');
      return;
    }

    if (!slug) {
      toast.error("Slug is required.");
      scrollToElement('service-slug');
      return;
    }

    // Validate slug format
    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(slug)) {
      toast.error("Slug can only contain lowercase letters, numbers, and hyphens.");
      scrollToElement('service-slug');
      return;
    }

    if (!description) {
      toast.error("Service description is required.");
      scrollToElement('service-description');
      return;
    }

    if (description.length < 100) {
      toast.error("Service description must be at least 100 characters long.");
      scrollToElement('service-description');
      return;
    }

    if (description.length > 400) {
      toast.error("Service description must be 400 characters or less.");
      scrollToElement('service-description');
      return;
    }

    if (!metaTitle) {
      toast.error("Meta title is required.");
      scrollToElement('meta-title');
      return;
    }

    if (metaTitle.length > 60) {
      toast.error("Meta title must be 60 characters or less.");
      scrollToElement('meta-title');
      return;
    }

    if (!metaDescription) {
      toast.error("Meta description is required.");
      scrollToElement('meta-description');
      return;
    }

    if (metaDescription.length > 160) {
      toast.error("Meta description must be 160 characters or less.");
      scrollToElement('meta-description');
      return;
    }


    try {
      // Create FormData object
      const formData = new FormData();

      // Add basic fields
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("description", description);
      formData.append("meta_title", metaTitle);
      formData.append("meta_description", metaDescription);
      formData.append("is_active", published.toString()); // Backend expects is_active, not published

      // Process sections data - convert points to description for what_we_offer_section (for old FormData API)
      const processedSectionsData = JSON.parse(JSON.stringify(sectionsData)); // Deep copy to avoid mutating original state
      Object.keys(processedSectionsData).forEach(sectionKey => {
        if (sectionKey === 'what_we_offer_section') {
          processedSectionsData[sectionKey].sub_sections = processedSectionsData[sectionKey].sub_sections.map((sub: any) => ({
            ...sub,
            description: sub.points ? sub.points.filter((point: any) => point.trim() !== '').join(', ') : '',
            points: undefined // Remove points from processed copy only
          }));
        }
      });

      // Add sections data as JSON
      formData.append("sections_data", JSON.stringify(processedSectionsData));

      // Add files for each section
      // Exclude 'image_files' as it's handled separately below
      Object.entries(sectionFiles).forEach(([key, files]) => {
        if (key === 'image_files') return; // Skip image_files here, handled separately

        if (files && files.length > 0) {
          if (key === "hero_section_image_file") {
            // Hero section expects a single file
            formData.append(key, files[0]);
          } else {
            // Other sections can have multiple files
            files.forEach((file) => {
              formData.append(key, file);
            });
          }
        }
      });

      // Add sub-section icons to the corresponding section files
      Object.entries(subSectionIcons).forEach(
        ([sectionKey, subSectionFiles]) => {
          const sectionFileKey =
            sectionKey === "hero_section"
              ? "hero_section_image_file"
              : `${sectionKey}_image_files`;

          Object.values(subSectionFiles).forEach((files) => {
            files.forEach((file) => {
              formData.append(sectionFileKey, file);
            });
          });
        }
      );

      // Add team member images to team_section_image_files
      Object.values(teamMemberImages).forEach(files => {
        files.forEach(file => {
          formData.append('team_section_image_files', file);
        });
      });

      // Add client feedback images to client_feedback_section_image_files
      Object.values(clientFeedbackImages).forEach(files => {
        files.forEach(file => {
          formData.append('client_feedback_section_image_files', file);
        });
      });

      // Only add image_files if they exist (don't send empty placeholder)
      if (sectionFiles.image_files.length > 0) {
        sectionFiles.image_files.forEach(file => {
          formData.append('image_files', file);
        });
      }

      // Add image alt texts
      if (imageAltTexts.length > 0) {
        formData.append("image_alt_texts", JSON.stringify(imageAltTexts));
      }

      // Add section alt texts
      Object.entries(sectionAltTexts).forEach(([key, altTexts]) => {
        if (altTexts && altTexts.length > 0) {
          formData.append(`${key}_alt_text`, JSON.stringify(altTexts));
        }
      });

      // Add subsection icon alt texts
      Object.entries(subSectionIconAltTexts).forEach(([sectionKey, subSectionAltTexts]) => {
        const altTextsArray = Object.values(subSectionAltTexts).flat().filter(text => text);
        if (altTextsArray.length > 0) {
          const sectionFileKey = sectionKey === "hero_section"
            ? "hero_section_image_file"
            : `${sectionKey}_image_files`;
          formData.append(`${sectionFileKey}_subsection_alt_text`, JSON.stringify(altTextsArray));
        }
      });

      // Add team member image alt texts
      const teamMemberAltTexts = Object.values(teamMemberImageAltTexts).flat().filter(text => text);
      if (teamMemberAltTexts.length > 0) {
        formData.append("team_section_image_files_alt_text", JSON.stringify(teamMemberAltTexts));
      }

      // Add client feedback image alt texts
      const clientFeedbackAltTexts = Object.values(clientFeedbackImageAltTexts).flat().filter(text => text);
      if (clientFeedbackAltTexts.length > 0) {
        formData.append("client_feedback_section_image_files_alt_text", JSON.stringify(clientFeedbackAltTexts));
      }

      // NEW API: Build JSON payload for sols-services endpoint
      // Extract bullet points from tools_used_section subsections
      const bulletPoints = sectionsData.tools_used_section?.sub_sections
        ?.map(sub => sub.title)
        ?.filter(title => title?.trim()) || [];

      const servicePayload = {
        name: title,
        description: description,
        slug: slug,
        meta_title: metaTitle,
        meta_description: metaDescription,
        projects_delivered: projectsDelivered ? parseInt(projectsDelivered) : 0,
        clients_satisfaction: clientsSatisfaction ? parseInt(clientsSatisfaction) : 0,
        icon: iconId, // Image ID from media upload
        icon_alt_text: iconAltText || "", // Alt text for service post icon
        hero_image: serviceMainImageId || heroImageId, // Use service main image as hero_image
        hero_image_alt_text: serviceMainImageAltText || "", // Alt text for hero image
        bullet_points: bulletPoints, // From tools_used_section subsections

        // Section data - map from sectionsData to flat structure
        about_title: sectionsData.about_section?.title || "",
        about_description: sectionsData.about_section?.description || "",
        about_subsections: sectionsData.about_section?.sub_sections?.map(sub => ({
          title: sub.title,
          icon: sub.icon,
          alt_text: sub.iconAltText || sub.alt_text || "",
          description: sub.description
        })) || [],

        why_choose_title: sectionsData.why_choose_us_section?.title || "",
        why_choose_description: sectionsData.why_choose_us_section?.description || "",
        why_choose_subsections: sectionsData.why_choose_us_section?.sub_sections?.map(sub => ({
          title: sub.title,
          icon: sub.icon,
          alt_text: sub.iconAltText || sub.alt_text || "",
          description: sub.description
        })) || [],

        what_we_offer_title: sectionsData.what_we_offer_section?.title || "",
        what_we_offer_description: sectionsData.what_we_offer_section?.description || "",
        what_we_offer_subsections: sectionsData.what_we_offer_section?.sub_sections?.map(sub => ({
          title: sub.title,
          icon: sub.icon,
          alt_text: sub.iconAltText || sub.alt_text || "",
          points: sub.points ? sub.points.filter(point => point.trim() !== '') : []
        })) || [],

        business_title: sectionsData.perfect_business_section?.title || "",
        business_description: sectionsData.perfect_business_section?.description || "",
        business_subsections: sectionsData.perfect_business_section?.sub_sections?.map(sub => ({
          title: sub.title,
          icon: sub.icon,
          alt_text: sub.iconAltText || sub.alt_text || "",
          description: sub.description
        })) || [],

        design_process_title: sectionsData.design_section?.title || "",
        design_process_description: sectionsData.design_section?.description || "",
        design_process_subsections: sectionsData.design_section?.sub_sections || [],

        design_team_title: sectionsData.team_section?.title || "",
        design_team_description: sectionsData.team_section?.description || "",
        design_team_subsections: sectionsData.team_section?.sub_sections?.map(sub => ({
          name: sub.name,
          image: sub.image,
          alt_text: sub.imageAltText || sub.alt_text || "",
          summary: sub.summary,
          experience: sub.experience,
          designation: sub.designation
        })) || [],

        meet_design_team_title: sectionsData.team_section?.title || "",
        meet_design_team_description: sectionsData.team_section?.description || "",
        meet_design_team_subsections: sectionsData.team_section?.sub_sections?.map(sub => ({
          name: sub.name,
          image: sub.image,
          alt_text: sub.imageAltText || sub.alt_text || "",
          summary: sub.summary,
          experience: sub.experience,
          designation: sub.designation
        })) || [],

        tools_title: sectionsData.tools_used_section?.title || "",
        tools_description: sectionsData.tools_used_section?.description || "",
        tools_subsections: sectionsData.tools_used_section?.sub_sections?.map(sub => ({
          title: sub.title,
          icon: sub.icon,
          alt_text: sub.iconAltText || sub.alt_text || "",
          points: sub.points ? sub.points.filter(point => point.trim() !== '') : []
        })) || [],

        testimonials: sectionsData.client_feedback_section?.sub_sections?.map(sub => ({
          name: sub.name,
          image: sub.image,
          alt_text: sub.imageAltText || sub.alt_text || "",
          stars: sub.stars,
          comment: sub.comment,
          designation: sub.designation
        })) || [],

        is_published: published,
      };


      const { servicesDataService } = await import("@/services/services");
      await servicesDataService.createServiceV2(servicePayload);
      clearDraft();
      toast.success("Service created successfully!");
      router.push("/dashboard/services");
    } catch (error: any) {
      console.error("Service creation error:", error);

      // Check for field-specific validation errors
      const errorDetails = error.response?.data?.error_details;
      if (errorDetails) {
        console.log("Field validation errors:", errorDetails);

        // Map backend field errors to frontend error state
        const newErrors: Record<string, string> = {};

        if (errorDetails.title) {
          newErrors.title = Array.isArray(errorDetails.title)
            ? errorDetails.title[0]
            : errorDetails.title;
          scrollToElement('service-title');
        }

        if (errorDetails.slug) {
          newErrors.slug = Array.isArray(errorDetails.slug)
            ? errorDetails.slug[0]
            : errorDetails.slug;
          if (!newErrors.title) scrollToElement('service-slug');
        }

        if (errorDetails.description) {
          newErrors.description = Array.isArray(errorDetails.description)
            ? errorDetails.description[0]
            : errorDetails.description;
          if (!newErrors.title && !newErrors.slug) scrollToElement('service-description');
        }

        if (errorDetails.meta_title) {
          newErrors.metaTitle = Array.isArray(errorDetails.meta_title)
            ? errorDetails.meta_title[0]
            : errorDetails.meta_title;
          if (!newErrors.title && !newErrors.slug && !newErrors.description) scrollToElement('meta-title');
        }

        if (errorDetails.meta_description) {
          newErrors.metaDescription = Array.isArray(errorDetails.meta_description)
            ? errorDetails.meta_description[0]
            : errorDetails.meta_description;
          if (!newErrors.title && !newErrors.slug && !newErrors.description && !newErrors.metaTitle) {
            scrollToElement('meta-description');
          }
        }

        // Update error state to show under fields
        setErrors(newErrors);

        // Show toast with first error
        const firstError = Object.values(newErrors)[0];
        toast.error(firstError || "Validation failed. Please check the form.");
      } else {
        // Generic error without field details
        const errorMessage = error.response?.data?.message
          || error.response?.data?.error
          || error.message
          || "Failed to create service. Please try again.";
        toast.error(errorMessage);
      }

      // Log detailed error for debugging
      if (error.response?.data) {
        console.error("Backend error details:", error.response.data);
      }
    }
  };

  const renderSubSection = (
    sectionKey: keyof ServiceSectionsData,
    subSection: any,
    index: number
  ) => {
    if (sectionKey === "team_section") {
      return (
        <div key={index} className="grid gap-4 p-4 border rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name - h2</Label>
              <Input
                value={subSection.name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSubSection(sectionKey, index, "name", value);
                  }
                }}
                placeholder="Team member name"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {100 - (subSection.name?.length || 0)} characters remaining
              </p>
            </div>
            <div className="space-y-2">
              <Label>Designation - p</Label>
              <Textarea
                value={subSection.designation}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSubSection(sectionKey, index, "designation", value);
                  }
                }}
                placeholder="Job title"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {100 - (subSection.designation?.length || 0)} characters remaining
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Experience - p</Label>
              <Input
                value={subSection.experience}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSubSection(sectionKey, index, "experience", value);
                  }
                }}
                placeholder="e.g., 5+ years"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {100 - (subSection.experience?.length || 0)} characters remaining
              </p>
            </div>
            <div className="space-y-2">
              <Label>Summary - p</Label>
              <Textarea
                value={subSection.summary}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSubSection(sectionKey, index, "summary", value);
                  }
                }}
                placeholder="Brief description"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {100 - (subSection.summary?.length || 0)} characters remaining
              </p>
            </div>
          </div>

          {/* Team Member Image Upload */}
          <div className="space-y-2">
            <Label>Team Member Photo Alt Text</Label>
            <Input
              value={teamMemberImageAltTexts[index]?.[0] || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 255) {
                  setTeamMemberImageAltTexts((prev) => ({
                    ...prev,
                    [index]: [value],
                  }));
                }
              }}
              placeholder="Enter alt text for team member photo"
              maxLength={255}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {255 - (teamMemberImageAltTexts[index]?.[0]?.length || 0)} characters remaining
            </p>

            <Label>Team Member Photo</Label>

            {/* Image Upload Options */}
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const altText = teamMemberImageAltTexts[index]?.[0] || "";
                      if (!altText.trim()) {
                        toast.error("Please enter alt text first");
                        e.target.value = "";
                        return;
                      }

                      try {
                        const result = await uploadMedia.mutateAsync({
                          image: file,
                          alt_text: altText
                        });

                        updateSubSection(sectionKey, index, "image", result.image);
                        if (result.alt_text) {
                          updateSubSection(sectionKey, index, "imageAltText", result.alt_text);
                        }
                        toast.success("Team member photo uploaded!");
                      } catch (error) {
                        console.error("Error uploading photo:", error);
                        toast.error("Failed to upload photo");
                        e.target.value = "";
                      }
                    }
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
                onClick={() => setShowTeamMemberGallery(index)}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Select from Gallery
              </Button>
            </div>

            {/* Media Gallery Modal */}
            <MediaGalleryModal
              open={showTeamMemberGallery === index}
              onOpenChange={(open) => setShowTeamMemberGallery(open ? index : null)}
              onSelect={(media: MediaItem[]) => {
                if (media.length > 0) {
                  const selected = media[0];
                  updateSubSection(sectionKey, index, "image", selected.image);
                  if (selected.alt_text) {
                    updateSubSection(sectionKey, index, "imageAltText", selected.alt_text);
                    setTeamMemberImageAltTexts((prev) => ({
                      ...prev,
                      [index]: [selected.alt_text || ''],
                    }));
                  }
                  toast.success('Team member photo selected from gallery!');
                }
              }}
              maxSelection={1}
              minSelection={1}
              title="Select Team Member Photo"
            />

            {subSection.image && (
              <div className="mt-2 mb-2">
                <img
                  src={getImageUrl(subSection.image)}
                  alt="Team Member Photo"
                  className="h-24 w-24 rounded-full border object-cover"
                />
                <p className="text-xs text-green-600 mt-1">✓ Selected</p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Upload a photo for this team member (stores full URL)
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => removeSubSection(sectionKey, index)}
          >
            Remove Member
          </Button>
        </div>
      );
    }

    if (sectionKey === "client_feedback_section") {
      return (
        <div key={index} className="grid gap-4 p-4 border rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name - h2</Label>
              <Input
                value={subSection.name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSubSection(sectionKey, index, "name", value);
                  }
                }}
                placeholder="Client name"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {100 - (subSection.name?.length || 0)} characters remaining
              </p>
            </div>
            <div className="space-y-2">
              <Label>Designation - p</Label>
              <Input
                value={subSection.designation}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSubSection(sectionKey, index, "designation", value);
                  }
                }}
                placeholder="Job title"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {100 - (subSection.designation?.length || 0)} characters remaining
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Comment - p</Label>
            <Textarea
              value={subSection.comment}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 1000) {
                  updateSubSection(sectionKey, index, "comment", value);
                }
              }}
              placeholder="Client feedback"
              rows={3}
              maxLength={1000}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {1000 - (subSection.comment?.length || 0)} characters remaining
            </p>
          </div>
          <div className="space-y-2">
            <Label>Stars (1-5)</Label>
            <Input
              type="number"
              min={1}
              max={5}
              step="0.1"
              value={subSection.stars === null || subSection.stars === undefined ? '' : subSection.stars}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  // Allow clearing the field
                  updateSubSection(sectionKey, index, 'stars', '');
                  return;
                }
                const value = parseFloat(raw);
                if (!Number.isNaN(value) && value >= 1 && value <= 5) {
                  updateSubSection(sectionKey, index, 'stars', value);
                }
              }}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter a rating between 1 and 5. Decimals allowed (e.g., 4.5).
            </p>
          </div>

          {/* Client Photo Upload */}
          <div className="space-y-2">
            <Label>Client Photo Alt Text</Label>
            <Input
              value={clientFeedbackImageAltTexts[index]?.[0] || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 255) {
                  setClientFeedbackImageAltTexts((prev) => ({
                    ...prev,
                    [index]: [value],
                  }));
                }
              }}
              placeholder="Enter alt text for client photo"
              maxLength={255}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {255 - (clientFeedbackImageAltTexts[index]?.[0]?.length || 0)} characters remaining
            </p>

            <Label>Client Photo</Label>

            {/* Image Upload Options */}
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const altText = clientFeedbackImageAltTexts[index]?.[0] || "";
                      if (!altText.trim()) {
                        toast.error("Please enter alt text first");
                        e.target.value = "";
                        return;
                      }

                      try {
                        const result = await uploadMedia.mutateAsync({
                          image: file,
                          alt_text: altText
                        });

                        updateSubSection(sectionKey, index, "image", result.image);
                        if (result.alt_text) {
                          updateSubSection(sectionKey, index, "imageAltText", result.alt_text);
                        }
                        toast.success("Client photo uploaded!");
                      } catch (error) {
                        console.error("Error uploading photo:", error);
                        toast.error("Failed to upload photo");
                        e.target.value = "";
                      }
                    }
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
                onClick={() => setShowClientFeedbackGallery(index)}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Select from Gallery
              </Button>
            </div>

            {/* Media Gallery Modal */}
            <MediaGalleryModal
              open={showClientFeedbackGallery === index}
              onOpenChange={(open) => setShowClientFeedbackGallery(open ? index : null)}
              onSelect={(media: MediaItem[]) => {
                if (media.length > 0) {
                  const selected = media[0];
                  updateSubSection(sectionKey, index, "image", selected.image);
                  if (selected.alt_text) {
                    updateSubSection(sectionKey, index, "imageAltText", selected.alt_text);
                    setClientFeedbackImageAltTexts((prev) => ({
                      ...prev,
                      [index]: [selected.alt_text || ''],
                    }));
                  }
                  toast.success('Client photo selected from gallery!');
                }
              }}
              maxSelection={1}
              minSelection={1}
              title="Select Client Photo"
            />

            {subSection.image && (
              <div className="mt-2 mb-2">
                <img
                  src={getImageUrl(subSection.image)}
                  alt="Client Photo"
                  className="h-24 w-24 rounded-full border object-cover"
                />
                <p className="text-xs text-green-600 mt-1">✓ Selected</p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Upload a photo for this client (stores full URL)
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => removeSubSection(sectionKey, index)}
          >
            Remove Feedback
          </Button>
        </div>
      );
    }

    // Special simplified UI for tools_used_section - only title and points
    if (sectionKey === 'tools_used_section') {
      return (
        <div key={index} className="grid gap-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label>Title - h2</Label>
            <Input
              value={subSection.title}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 70) {
                  updateSubSection(sectionKey, index, 'title', value);
                }
              }}
              placeholder="Tool or service title"
              maxLength={70}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {70 - (subSection.title?.length || 0)} characters remaining
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Add Points</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addPoint(sectionKey, index)}
              >
                Add Point
              </Button>
            </div>
            <div className="space-y-2">
              {(subSection.points || []).map((point: string, pointIndex: number, arr: any) => {
                // Show the point if it has content OR if it's the last point in the array
                const isLastPoint = pointIndex === arr.length - 1;
                const hasContent = point.trim() !== "";

                if (hasContent || isLastPoint) {
                  return (
                    <div key={pointIndex}>
                      <div className="flex gap-2 items-center">
                        <Input
                          value={point}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 200) {
                              updatePoint(sectionKey, index, pointIndex, value);
                            }
                          }}
                          placeholder={`Point ${pointIndex + 1}`}
                          maxLength={200}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removePoint(sectionKey, index, pointIndex)}
                          disabled={(subSection.points || []).length <= 1}
                        >
                          Remove
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {200 - (point?.length || 0)} characters remaining
                      </p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => removeSubSection(sectionKey, index)}
          >
            Remove
          </Button>
        </div>
      );
    }

    if (sectionKey === 'what_we_offer_section') {
      return (
        <div key={index} className="grid gap-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label>Title - h2</Label>
            <Input
              value={subSection.title}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 70) {
                  updateSubSection(sectionKey, index, 'title', value);
                }
              }}
              placeholder="Sub-section title"
              maxLength={70}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {70 - (subSection.title?.length || 0)} characters remaining
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Points - p</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addPoint(sectionKey, index)}
              >
                Add Point
              </Button>
            </div>
            <div className="space-y-2">
              {(subSection.points || []).map((point: string, pointIndex: number, arr: any) => {
                // Show the point if it has content OR if it's the last point in the array
                const isLastPoint = pointIndex === arr.length - 1;
                const hasContent = point.trim() !== "";

                if (hasContent || isLastPoint) {
                  return (
                    <div key={pointIndex}>
                      <div className="flex gap-2 items-center">
                        <Input
                          value={point}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 200) {
                              updatePoint(sectionKey, index, pointIndex, value);
                            }
                          }}
                          placeholder={`Point ${pointIndex + 1}`}
                          maxLength={200}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removePoint(sectionKey, index, pointIndex)}
                          disabled={(subSection.points || []).length <= 1}
                        >
                          Remove
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {200 - (point?.length || 0)} characters remaining
                      </p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Sub-section Icon Upload (hidden for design_section) */}
          <div className="space-y-2">
            <Label>Sub-section Icon Alt Text</Label>
            <Input
              value={subSectionIconAltTexts[sectionKey]?.[index]?.[0] || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 255) {
                  setSubSectionIconAltTexts((prev) => ({
                    ...prev,
                    [sectionKey]: {
                      ...prev[sectionKey],
                      [index]: [value],
                    },
                  }));
                }
              }}
              placeholder="Enter alt text for sub-section icon"
              maxLength={255}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {255 - (subSectionIconAltTexts[sectionKey]?.[index]?.[0]?.length || 0)} characters remaining
            </p>

            <Label>Sub-section Icon</Label>

            {/* Image Upload Options */}
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const altText = subSectionIconAltTexts[sectionKey]?.[index]?.[0] || "";
                      if (!altText.trim()) {
                        toast.error("Please enter alt text first");
                        e.target.value = "";
                        return;
                      }

                      try {
                        const result = await uploadMedia.mutateAsync({
                          image: file,
                          alt_text: altText
                        });

                        updateSubSection(sectionKey, index, "icon", result.image);
                        if (result.alt_text) {
                          updateSubSection(sectionKey, index, "iconAltText", result.alt_text);
                        }
                        toast.success("Icon uploaded successfully!");
                      } catch (error) {
                        console.error("Error uploading icon:", error);
                        toast.error("Failed to upload icon");
                        e.target.value = "";
                      }
                    }
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
                onClick={() => setShowSubSectionGallery({ sectionKey, index })}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Select from Gallery
              </Button>
            </div>

            {/* Media Gallery Modal */}
            <MediaGalleryModal
              open={showSubSectionGallery?.sectionKey === sectionKey && showSubSectionGallery?.index === index}
              onOpenChange={(open) => setShowSubSectionGallery(open ? { sectionKey, index } : null)}
              onSelect={(media: MediaItem[]) => {
                if (media.length > 0) {
                  const selected = media[0];
                  updateSubSection(sectionKey, index, "icon", selected.image);
                  if (selected.alt_text) {
                    updateSubSection(sectionKey, index, "iconAltText", selected.alt_text);
                    setSubSectionIconAltTexts((prev) => ({
                      ...prev,
                      [sectionKey]: {
                        ...prev[sectionKey],
                        [index]: [selected.alt_text || ''],
                      },
                    }));
                  }
                  toast.success('Sub-section icon selected from gallery!');
                }
              }}
              maxSelection={1}
              minSelection={1}
              title="Select Sub-section Icon"
            />

            {subSection.icon && (
              <div className="mt-2">
                <Label className="text-sm font-medium">Current Icon</Label>
                <img
                  src={getImageUrl(subSection.icon)}
                  alt="Current Sub-section Icon"
                  className="h-24 w-24 rounded border object-cover mt-2 bg-muted/50 p-2"
                />
                <p className="text-xs text-green-600 mt-1">✓ Selected</p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Upload an icon for this sub-section (stores full URL)
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => removeSubSection(sectionKey, index)}
          >
            Remove
          </Button>
        </div>
      );
    }

    return (
      <div key={index} className="grid gap-4 p-4 border rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Title - h2</Label>
            <Input
              value={subSection.title}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 70) {
                  updateSubSection(sectionKey, index, "title", value);
                }
              }}
              placeholder="Sub-section title"
              maxLength={70}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {70 - (subSection.title?.length || 0)} characters remaining
            </p>
          </div>
          <div className="space-y-2">
            <Label>Description - p</Label>
            <Textarea
              value={subSection.description}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 200) {
                  updateSubSection(sectionKey, index, "description", value);
                }
              }}
              placeholder="Sub-section description"
              maxLength={200}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {200 - (subSection.description?.length || 0)} characters remaining
            </p>
          </div>
        </div>

        {/* Sub-section Icon Upload - Only for non-hero sections */}
        {sectionKey !== 'design_section' && (
          <div className="space-y-2">
            <Label>Sub-section Icon Alt Text</Label>
            <Input
              value={subSectionIconAltTexts[sectionKey]?.[index]?.[0] || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 255) {
                  setSubSectionIconAltTexts((prev) => ({
                    ...prev,
                    [sectionKey]: {
                      ...prev[sectionKey],
                      [index]: [value],
                    },
                  }));
                }
              }}
              placeholder="Enter alt text for sub-section icon"
              maxLength={255}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {255 - (subSectionIconAltTexts[sectionKey]?.[index]?.[0]?.length || 0)} characters remaining
            </p>

            <Label>Sub-section Icon</Label>

            {/* Image Upload Options */}
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const altText = subSectionIconAltTexts[sectionKey]?.[index]?.[0] || "";
                      if (!altText.trim()) {
                        toast.error("Please enter alt text first");
                        e.target.value = "";
                        return;
                      }

                      try {
                        const result = await uploadMedia.mutateAsync({
                          image: file,
                          alt_text: altText
                        });

                        updateSubSection(sectionKey, index, "icon", result.image);
                        if (result.alt_text) {
                          updateSubSection(sectionKey, index, "iconAltText", result.alt_text);
                        }
                        toast.success("Icon uploaded successfully!");
                      } catch (error) {
                        console.error("Error uploading icon:", error);
                        toast.error("Failed to upload icon");
                        e.target.value = "";
                      }
                    }
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
                onClick={() => setShowSubSectionGallery({ sectionKey, index })}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                Select from Gallery
              </Button>
            </div>

            {/* Media Gallery Modal */}
            <MediaGalleryModal
              open={showSubSectionGallery?.sectionKey === sectionKey && showSubSectionGallery?.index === index}
              onOpenChange={(open) => setShowSubSectionGallery(open ? { sectionKey, index } : null)}
              onSelect={(media: MediaItem[]) => {
                if (media.length > 0) {
                  const selected = media[0];
                  updateSubSection(sectionKey, index, "icon", selected.image);
                  if (selected.alt_text) {
                    updateSubSection(sectionKey, index, "iconAltText", selected.alt_text);
                    setSubSectionIconAltTexts((prev) => ({
                      ...prev,
                      [sectionKey]: {
                        ...prev[sectionKey],
                        [index]: [selected.alt_text || ''],
                      },
                    }));
                  }
                  toast.success('Sub-section icon selected from gallery!');
                }
              }}
              maxSelection={1}
              minSelection={1}
              title="Select Sub-section Icon"
            />

            {subSection.icon && (
              <div className="mt-2 mb-2">
                <img
                  src={getImageUrl(subSection.icon)}
                  alt="Sub-section Icon"
                  className="h-20 w-20 rounded border object-cover"
                />
                <p className="text-xs text-green-600 mt-1">✓ Selected</p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Upload an icon for this sub-section (stores full URL)
            </p>
          </div>
        )}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => removeSubSection(sectionKey, index)}
        >
          Remove
        </Button>
      </div>
    );
  };

  const renderSection = (
    sectionKey: keyof ServiceSectionsData,
    section: any
  ) => {

    if (sectionKey === 'hero_section') {
      return null;
    }

    // Special handling for client_feedback_section - only show subsections
    if (sectionKey === 'client_feedback_section') {
      return (
        <Card key={sectionKey} className="mb-6">
          <CardHeader>
            <CardTitle className="capitalize">
              Client Feedback Section
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label>Client Testimonials</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSubSection(sectionKey)}
                >
                  Add Testimonial
                </Button>
              </div>
              <div className="space-y-4">
                {section.sub_sections.map((subSection: any, index: number) =>
                  renderSubSection(sectionKey, subSection, index)
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Get the corresponding file upload key for this section
    const fileUploadKey = `${sectionKey}_image_files`;

    return (
      <Card key={sectionKey} className="mb-6">
        <CardHeader>
          <CardTitle className="capitalize">
            {sectionKey.replace(/_/g, " ")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Section Title - h2</Label>
              <Input
                value={section.title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSection(sectionKey, "title", value);
                  }
                }}
                placeholder={`Enter ${sectionKey.replace(/_/g, " ")} title`}
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {100 - (section.title?.length || 0)} characters remaining
              </p>
            </div>
            <div className="space-y-2">
              <Label>Section Description - p</Label>
              <Textarea
                value={section.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 1000) {
                    updateSection(sectionKey, "description", value);
                  }
                }}
                placeholder={`Enter ${sectionKey.replace(
                  /_/g,
                  " "
                )} description`}
                rows={3}
                maxLength={1000}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {1000 - (section.description?.length || 0)} characters remaining
              </p>
            </div>

            {/* File Upload - Only for hero section */}
            {!SECTIONS_WITHOUT_IMAGES.includes(sectionKey) && (
              <div className="space-y-2">
                <Label>Section Image Alt Text</Label>
                <Input
                  value={sectionAltTexts[fileUploadKey]?.[0] || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 255) {
                      setSectionAltTexts((prev) => ({
                        ...prev,
                        [fileUploadKey]: [value],
                      }));
                    }
                  }}
                  placeholder="Enter alt text for hero section image"
                  maxLength={255}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {255 - (sectionAltTexts[fileUploadKey]?.[0]?.length || 0)} characters remaining
                </p>

                <Label>Section Image (Hero Image)</Label>

                {/* Image Upload Options */}
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const altText = sectionAltTexts[fileUploadKey]?.[0] || "";
                            if (!altText) {
                              toast.error("Please enter alt text first");
                              e.target.value = "";
                              return;
                            }

                            const result = await uploadMedia.mutateAsync({
                              image: file,
                              alt_text: altText
                            });

                            setHeroImageId(result.id);
                            setHeroFromGallery(false);
                            if (result.alt_text) {
                              setSectionAltTexts((prev) => ({
                                ...prev,
                                [fileUploadKey]: [result.alt_text],
                              }));
                            }
                            toast.success("Hero image uploaded successfully!");
                            handleFileChange(fileUploadKey, e.target.files);
                          } catch (error) {
                            console.error("Error uploading hero image:", error);
                            toast.error("Failed to upload hero image");
                            e.target.value = "";
                          }
                        }
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

                {/* Media Gallery Modal */}
                <MediaGalleryModal
                  open={showHeroGallery}
                  onOpenChange={setShowHeroGallery}
                  onSelect={(media: MediaItem[]) => {
                    if (media.length > 0) {
                      const selected = media[0];
                      setHeroImageId(selected.id);
                      setHeroFromGallery(true);
                      if (selected.alt_text) {
                        setSectionAltTexts((prev) => ({
                          ...prev,
                          [fileUploadKey]: [selected.alt_text || ''],
                        }));
                      }
                      // Store the URL for preview
                      setUploadedMediaUrls((prev) => ({
                        ...prev,
                        [fileUploadKey]: selected.image,
                      }));
                      toast.success('Hero image selected from gallery!');
                    }
                  }}
                  maxSelection={1}
                  minSelection={1}
                  title="Select Hero Image"
                />

                <p className="text-sm text-gray-500 mt-1">
                  Upload hero image (will store image ID for API)
                </p>

                {/* Hero Section Image Preview */}
                {(sectionFiles[fileUploadKey]?.length > 0 || uploadedMediaUrls[fileUploadKey]) && (
                  <div className="mt-2">
                    <img
                      src={sectionFiles[fileUploadKey]?.length > 0
                        ? URL.createObjectURL(sectionFiles[fileUploadKey][0])
                        : uploadedMediaUrls[fileUploadKey]}
                      alt="Hero Section Preview"
                      className="h-40 w-auto rounded border object-cover"
                    />
                    {heroImageId && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {heroFromGallery ? 'Selected from gallery' : 'Uploaded'} (ID: {heroImageId})
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Sub-sections</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSubSection(sectionKey)}
              >
                Add Sub-section
              </Button>
            </div>
            <div className="space-y-4">
              {section.sub_sections.map((subSection: any, index: number) =>
                renderSubSection(sectionKey, subSection, index)
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full mx-auto p-4 max-w-6xl">
      <div className="flex md:flex-row flex-col justify-between items-center mb-6 gap-3">
        <h1 className="text-3xl font-semibold">Create New Service</h1>

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
            <AlertDialogAction onClick={loadDraft} className="bg-blue-600 hover:bg-blue-700">
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
                        Are you sure you want to clear the saved draft? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearDraft} className="bg-red-600 hover:bg-red-700">
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
        {/* Basic Service Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="service-title">Service Title * - h2</Label>
                <Input
                  id="service-title"
                  value={title}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 100) {
                      handleTitleChange(value);
                    }
                  }}
                  placeholder="Enter service title"
                  maxLength={100}
                  required
                  className={errors.title ? 'border-red-500' : ''}
                />
                <p className={`text-sm mt-1 ${errors.title ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {errors.title || `${100 - title.length} characters remaining`}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-slug">URL Slug *</Label>
                <div className="relative">
                  <Input
                    id="service-slug"
                    value={slug}
                    maxLength={40}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 40) {
                        const newSlug = generateSlug(value);
                        setSlug(newSlug);
                        setSlugCheckMessage("");
                        setSlugAvailable(null);
                        validateField('slug', newSlug);
                      }
                    }}
                    placeholder="url-friendly-slug"
                    required
                    className={errors.slug ? 'border-red-500' : ''}
                  />
                  {isCheckingSlug && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className={`text-sm ${errors.slug ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {errors.slug || 'This will be used in the URL. Only letters, numbers, and hyphens allowed.'}
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

              <div className="space-y-2">
                <Label htmlFor="service-description">Description * - p</Label>
                <Textarea
                  id="service-description"
                  value={description}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 400) {
                      setDescription(value);
                      validateField('description', value);
                    }
                  }}
                  placeholder="Write your service description..."
                  rows={4}
                  maxLength={400}
                  required
                  className={errors.description ? 'border-red-500' : ''}
                />
                <p className={`text-sm mt-1 ${errors.description ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {errors.description || `${description.length}/400 characters (minimum 100 required)`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meta-title">Meta Title *</Label>
                  <Input
                    id="meta-title"
                    value={metaTitle}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 60) {
                        setMetaTitle(value);
                        validateField('metaTitle', value);
                      }
                    }}
                    placeholder="Enter meta title for SEO"
                    maxLength={60}
                    required
                    className={errors.metaTitle ? 'border-red-500' : ''}
                  />
                  <p className={`text-sm mt-1 ${errors.metaTitle ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {errors.metaTitle || `${60 - metaTitle.length} characters remaining`}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta-description">Meta Description *</Label>
                  <Textarea
                    id="meta-description"
                    value={metaDescription}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 160) {
                        setMetaDescription(value);
                        validateField('metaDescription', value);
                      }
                    }}
                    placeholder="Enter meta description for SEO"
                    rows={3}
                    maxLength={160}
                    required
                    className={errors.metaDescription ? 'border-red-500' : ''}
                  />
                  <p className={`text-sm mt-1 ${errors.metaDescription ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {errors.metaDescription || `${160 - metaDescription.length} characters remaining`}
                  </p>
                </div>
              </div>

              {/* Projects Delivered and Clients Satisfaction */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projects-delivered">Projects Delivered</Label>
                  <Input
                    id="projects-delivered"
                    type="number"
                    min="0"
                    value={projectsDelivered}
                    onChange={(e) => setProjectsDelivered(e.target.value)}
                    placeholder="127"
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of projects successfully delivered
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clients-satisfaction">Clients Satisfaction (%)</Label>
                  <Input
                    id="clients-satisfaction"
                    type="number"
                    min="0"
                    max="100"
                    value={clientsSatisfaction}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value !== '' && (parseInt(value) < 0 || parseInt(value) > 100)) {
                        return;
                      }
                      setClientsSatisfaction(value);
                    }}
                    placeholder="98"
                  />
                  <p className="text-sm text-muted-foreground">
                    Client satisfaction percentage (0-100)
                  </p>
                </div>
              </div>

              {/* Published Field */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={published}
                    onCheckedChange={setPublished}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <Label htmlFor="published" className="text-sm font-medium">
                    Publish Service
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, this service will be publicly visible on the website
                </p>
              </div>

              {/* Service Post Icon and Service Main Image - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* General Service Images (Service Post Icon) */}
                <div className="space-y-2">
                  <Label htmlFor="iconAltText">Service Post Icon Alt Text</Label>
                  <Input
                    id="iconAltText"
                    value={iconAltText}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 255) {
                        setIconAltText(value);
                      }
                    }}
                    placeholder="Enter alt text for icon"
                    maxLength={255}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {255 - iconAltText.length} characters remaining
                  </p>

                  <Label>Service Post Icon</Label>

                  {/* Image Upload Options */}
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer">
                      <Input
                        id="serviceImages"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (!iconAltText.trim()) {
                              toast.error("Please enter alt text first");
                              e.target.value = "";
                              return;
                            }

                            try {
                              const result = await uploadMedia.mutateAsync({
                                image: file,
                                alt_text: iconAltText
                              });

                              setIconId(result.id);
                              setIconUrl(result.image);
                              setIconFromGallery(false);
                              if (result.alt_text) {
                                setIconAltText(result.alt_text);
                              }
                              toast.success("Service icon uploaded successfully!");
                            } catch (error) {
                              console.error("Error uploading icon:", error);
                              toast.error("Failed to upload icon");
                              e.target.value = "";
                            }
                          }
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
                      onClick={() => setShowIconGallery(true)}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Select from Gallery
                    </Button>
                  </div>

                  {/* Media Gallery Modal */}
                  <MediaGalleryModal
                    open={showIconGallery}
                    onOpenChange={setShowIconGallery}
                    onSelect={(media: MediaItem[]) => {
                      if (media.length > 0) {
                        const selected = media[0];
                        setIconId(selected.id);
                        setIconUrl(selected.image);
                        setIconAltText(selected.alt_text || '');
                        setIconFromGallery(true);
                        toast.success('Service icon selected from gallery!');
                      }
                    }}
                    maxSelection={1}
                    minSelection={1}
                    title="Select Service Icon"
                  />

                  <p className="text-sm text-gray-500 mt-1">
                    Upload icon for this service
                  </p>
                  {iconUrl && (
                    <div className="mt-2">
                      <img
                        src={getImageUrl(iconUrl)}
                        alt="Service Icon"
                        className="h-40 w-auto rounded border object-cover"
                      />
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {iconFromGallery ? 'Selected from gallery' : 'Uploaded'} (ID: {iconId})
                      </p>
                    </div>
                  )}
                </div>

                {/* Service Main Image */}
                <div className="space-y-2">
                  <Label htmlFor="serviceMainImageAltText">Service Main Image Alt Text</Label>
                  <Input
                    id="serviceMainImageAltText"
                    value={serviceMainImageAltText}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 255) {
                        setServiceMainImageAltText(value);
                      }
                    }}
                    placeholder="Enter alt text for main image"
                    maxLength={255}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {255 - serviceMainImageAltText.length} characters remaining
                  </p>

                  <Label>Service Main Image</Label>

                  {/* Image Upload Options */}
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer">
                      <Input
                        id="serviceMainImage"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (!serviceMainImageAltText.trim()) {
                              toast.error("Please enter alt text first");
                              e.target.value = "";
                              return;
                            }

                            try {
                              const result = await uploadMedia.mutateAsync({
                                image: file,
                                alt_text: serviceMainImageAltText
                              });

                              setServiceMainImageId(result.id);
                              setServiceMainImageUrl(result.image);
                              setMainImageFromGallery(false);
                              if (result.alt_text) {
                                setServiceMainImageAltText(result.alt_text);
                              }
                              toast.success("Service main image uploaded successfully!");
                            } catch (error) {
                              console.error("Error uploading image:", error);
                              toast.error("Failed to upload image");
                              e.target.value = "";
                            }
                          }
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
                      onClick={() => setShowMainImageGallery(true)}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Select from Gallery
                    </Button>
                  </div>

                  {/* Media Gallery Modal */}
                  <MediaGalleryModal
                    open={showMainImageGallery}
                    onOpenChange={setShowMainImageGallery}
                    onSelect={(media: MediaItem[]) => {
                      if (media.length > 0) {
                        const selected = media[0];
                        setServiceMainImageId(selected.id);
                        setServiceMainImageUrl(selected.image);
                        setServiceMainImageAltText(selected.alt_text || '');
                        setMainImageFromGallery(true);
                        toast.success('Service main image selected from gallery!');
                      }
                    }}
                    maxSelection={1}
                    minSelection={1}
                    title="Select Service Main Image"
                  />

                  <p className="text-sm text-gray-500 mt-1">
                    Upload the main service image
                  </p>
                  {serviceMainImageUrl && (
                    <div className="mt-2">
                      <img
                        src={getImageUrl(serviceMainImageUrl)}
                        alt="Service Main"
                        className="h-40 w-auto rounded border object-cover"
                      />
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {mainImageFromGallery ? 'Selected from gallery' : 'Uploaded'} (ID: {serviceMainImageId})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Service Sections</h2>
          {Object.entries(sectionsData).map(([sectionKey, section]) =>
            renderSection(sectionKey as keyof ServiceSectionsData, section)
          )}
        </div>

        {/* Submit Button */}
        <div className="flex flex-col items-start gap-4">
          <Button
            variant={"blue"}
            type="submit"
            disabled={addService.isPending}
            size="lg"
            className="w-fit"
          >
            {addService.isPending ? "Creating Service..." : "Create Service"}
          </Button>
        </div>
      </form>
    </div>
  );
}
