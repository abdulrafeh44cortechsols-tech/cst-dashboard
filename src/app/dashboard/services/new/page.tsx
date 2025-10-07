"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useServices } from "@/hooks/useServices";
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
import ReCAPTCHA from "react-google-recaptcha";
import { Save, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import type { ServiceSectionsData } from "@/types/types";
import { getDefaultSectionsData } from "@/data/exampleServiceData";

export default function AddServicePage() {
  const router = useRouter();
  const { addService } = useServices();

  // Basic service fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [published, setPublished] = useState(false);

  // reCAPTCHA verification state
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

  // Sections data
  const [sectionsData, setSectionsData] = useState<ServiceSectionsData>(
    getDefaultSectionsData()
  );

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
        } else if (value.length > 2000) {
          newErrors.description = 'Service description must be 2000 characters or less';
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

  function onCaptchaChange(value: string | null) {
    console.log("Captcha value:", value);
    setCaptchaValue(value);
    setCaptchaVerified(!!value); // Set to true if value exists, false otherwise
  }

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

    if (description.length > 2000) {
      toast.error("Service description must be 2000 characters or less.");
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

    // Check if reCAPTCHA is verified
    if (!captchaVerified || !captchaValue) {
      toast.error("Please complete the reCAPTCHA verification.");
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

      // Process sections data - convert points to description for what_we_offer_section
      const processedSectionsData = { ...sectionsData };
      Object.keys(processedSectionsData).forEach(sectionKey => {
        if (sectionKey === 'what_we_offer_section') {
          processedSectionsData[sectionKey].sub_sections = processedSectionsData[sectionKey].sub_sections.map(sub => ({
            ...sub,
            description: sub.points ? sub.points.filter(point => point.trim() !== '').join(', ') : '',
            points: undefined // Remove points from final data
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
        formData.append("image_alt_text", JSON.stringify(imageAltTexts));
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

      await addService.mutateAsync(formData);
      
      // Clear draft after successful submission
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
                  if (value.length <= 50) {
                    updateSubSection(sectionKey, index, "experience", value);
                  }
                }}
                placeholder="e.g., 5+ years"
                maxLength={50}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {50 - (subSection.experience?.length || 0)} characters remaining
              </p>
            </div>
            <div className="space-y-2">
              <Label>Summary - p</Label>
              <Textarea
                value={subSection.summary}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 200) {
                    updateSubSection(sectionKey, index, "summary", value);
                  }
                }}
                placeholder="Brief description"
                maxLength={200}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {200 - (subSection.summary?.length || 0)} characters remaining
              </p>
            </div>
          </div>
          
          {/* Team Member Image Upload */}
          <div className="space-y-2">
            <Label>Team Member Photo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleTeamMemberImageChange(index, e.target.files)}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload a photo for this team member
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
              min="1"
              max="5"
              value={subSection.stars}
              onChange={(e) =>
                updateSubSection(
                  sectionKey,
                  index,
                  "stars",
                  parseInt(e.target.value)
                )
              }
            />
          </div>
          
          {/* Client Photo Upload */}
          <div className="space-y-2">
            <Label>Client Photo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleClientFeedbackImageChange(index, e.target.files)}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload a photo for this client
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

    if (sectionKey === 'what_we_offer_section') {
      return (
        <div key={index} className="grid gap-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label>Title - h2</Label>
            <Input
              value={subSection.title}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 100) {
                  updateSubSection(sectionKey, index, 'title', value);
                }
              }}
              placeholder="Sub-section title"
              maxLength={100}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {100 - (subSection.title?.length || 0)} characters remaining
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
              {(subSection.points || [""]).map((point: string, pointIndex: number) => (
                <div key={pointIndex} className="flex gap-2">
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
              ))}
            </div>
          </div>

          {/* Sub-section Icon Upload */}
          <div className="space-y-2">
            <Label>Sub-section Icon</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleSubSectionIconChange(sectionKey, index, e.target.files)}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload an icon for this sub-section
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
                if (value.length <= 100) {
                  updateSubSection(sectionKey, index, "title", value);
                }
              }}
              placeholder="Sub-section title"
              maxLength={100}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {100 - (subSection.title?.length || 0)} characters remaining
            </p>
          </div>
          <div className="space-y-2">
            <Label>Description - p</Label>
            <Textarea
              value={subSection.description}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  updateSubSection(sectionKey, index, "description", value);
                }
              }}
              placeholder="Sub-section description"
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {500 - (subSection.description?.length || 0)} characters remaining
            </p>
          </div>
        </div>

        {/* Sub-section Icon Upload - Only for non-hero sections */}
        {sectionKey !== "hero_section" && (
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
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleSubSectionIconChange(sectionKey, index, e.target.files)
              }
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload an icon for this sub-section
            </p>

            {/* Icon Preview */}
            {subSectionIcons[sectionKey]?.[index]?.length > 0 && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(subSectionIcons[sectionKey][index][0])}
                  alt="Sub-section Icon Preview"
                  className="h-20 w-20 rounded border object-cover"
                />
              </div>
            )}
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
    // Get the corresponding file upload key for this section
    const fileUploadKey =
      sectionKey === "hero_section"
        ? "hero_section_image_file"
        : `${sectionKey}_image_files`;

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
            {sectionKey === "hero_section" && (
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
                
                <Label>Section Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(fileUploadKey, e.target.files)
                  }
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload a single image for the hero section
                </p>
                
                {/* Hero Section Image Preview */}
                {sectionFiles[fileUploadKey]?.length > 0 && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(sectionFiles[fileUploadKey][0])}
                      alt="Hero Section Preview"
                      className="h-40 w-auto rounded border object-cover"
                    />
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
                 <Input
                   id="service-slug"
                   value={slug}
                   maxLength={40}
                   onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 40) {
                      const newSlug = generateSlug(value);
                      setSlug(newSlug);
                      validateField('slug', newSlug);
                    }
                  }}
                   placeholder="url-friendly-slug"
                   required
                   className={errors.slug ? 'border-red-500' : ''}
                 />
                 <p className={`text-sm ${errors.slug ? 'text-red-500' : 'text-muted-foreground'}`}>
                   {errors.slug || 'This will be used in the URL. Only letters, numbers, and hyphens allowed.'}
                 </p>
               </div>

              <div className="space-y-2">
                <Label htmlFor="service-description">Description * - p</Label>
                <Textarea
                  id="service-description"
                  value={description}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 2000) {
                      setDescription(value);
                      validateField('description', value);
                    }
                  }}
                  placeholder="Write your service description..."
                  rows={4}
                  maxLength={2000}
                  required
                  className={errors.description ? 'border-red-500' : ''}
                />
                <p className={`text-sm mt-1 ${errors.description ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {errors.description || `${description.length}/2000 characters (minimum 100 required)`}
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

              {/* General Service Images */}
              <div className="space-y-2">
                <Label htmlFor="serviceImages">Service Post Icon</Label>
                <Input
                  id="serviceImages"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileChange('image_files', e.target.files)}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload general images for this service
                </p>
                
                {/* Image Previews and Alt Text */}
                {sectionFiles.image_files.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {sectionFiles.image_files.map((file, idx) => (
                      <div key={idx} className="space-y-2 p-4 border rounded-lg">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Service Image ${idx + 1}`}
                          className="h-40 w-auto rounded border object-cover"
                        />
                        <div>
                          <Label htmlFor={`serviceImageAlt${idx}`}>Alt Text for Image {idx + 1}</Label>
                          <Input
                            id={`serviceImageAlt${idx}`}
                            value={imageAltTexts[idx] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 255) {
                                const newAltTexts = [...imageAltTexts];
                                newAltTexts[idx] = value;
                                setImageAltTexts(newAltTexts);
                              }
                            }}
                            placeholder={`Enter alt text for service image ${idx + 1}`}
                            maxLength={255}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            {255 - (imageAltTexts[idx]?.length || 0)} characters remaining
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_URL || ""}
            onChange={onCaptchaChange}
          />
          <Button
            variant={"blue"}
            type="submit"
            disabled={addService.isPending || !captchaVerified}
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
