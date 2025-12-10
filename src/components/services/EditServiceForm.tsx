"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { Save, Trash2, RefreshCw, AlertCircle, Loader2, Upload, ImageIcon, CheckCircle2, XCircle } from "lucide-react";
import { MediaGalleryModal } from "@/components/media/MediaGalleryModal";
import type { MediaItem } from "@/services/media";
import type { Service, ServiceSectionsData } from "@/types/types";
import { useServices } from "@/hooks/useServices";
import { useMedia } from "@/hooks/useMedia";
import { getDefaultSectionsData } from "@/data/exampleServiceData";
import { getImageUrl } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { servicesDataService } from "@/services/services";

interface EditServiceFormProps {
  service: Service | null;
  onCancel?: () => void;
  onSaved?: () => void;
}

export function EditServiceForm({ service, onCancel, onSaved }: EditServiceFormProps) {
  const { editService } = useServices(1, 10, false); // Don't fetch list - only need mutation
  // Disable media list fetch - we only need upload mutation
  const { uploadMedia } = useMedia(1, 10, false);

  // Service ID for updates
  const [serviceId, setServiceId] = useState<number | null>(null);

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
  const [originalSlug, setOriginalSlug] = useState<string>("");
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
  const [sectionsData, setSectionsData] = useState<ServiceSectionsData>(getDefaultSectionsData());


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
    image_files: []
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
  const [subSectionIcons, setSubSectionIcons] = useState<Record<string, Record<number, File[]>>>({});

  // Sub-section icon alt texts state
  const [subSectionIconAltTexts, setSubSectionIconAltTexts] = useState<Record<string, Record<number, string[]>>>({});

  // Team member images state
  const [teamMemberImages, setTeamMemberImages] = useState<Record<number, File[]>>({});

  // Team member image alt texts state
  const [teamMemberImageAltTexts, setTeamMemberImageAltTexts] = useState<Record<number, string[]>>({});

  // Client feedback images state
  const [clientFeedbackImages, setClientFeedbackImages] = useState<Record<number, File[]>>({});

  // Client feedback image alt texts state
  const [clientFeedbackImageAltTexts, setClientFeedbackImageAltTexts] = useState<Record<number, string[]>>({});

  // Media gallery modal states
  const [showIconGallery, setShowIconGallery] = useState(false);
  const [showMainImageGallery, setShowMainImageGallery] = useState(false);
  const [iconFromGallery, setIconFromGallery] = useState(false);
  const [mainImageFromGallery, setMainImageFromGallery] = useState(false);
  // Sub-section gallery modal states
  const [showSubSectionGallery, setShowSubSectionGallery] = useState<{ sectionKey: string; index: number } | null>(null);
  const [showClientFeedbackGallery, setShowClientFeedbackGallery] = useState<number | null>(null);
  const [showTeamMemberGallery, setShowTeamMemberGallery] = useState<number | null>(null);

  useEffect(() => {
    if (service) {
      const svc = service as any;

      // Set service ID
      if (svc.id) setServiceId(svc.id);

      // Basic fields - API uses "name" not "title"
      setTitle(svc.name || svc.title || "");
      setSlug(svc.slug || "");
      setDescription(svc.description || "");
      setMetaTitle(svc.meta_title || "");
      setMetaDescription(svc.meta_description || "");
      setPublished(svc.is_published || false);
      setProjectsDelivered(svc.projects_delivered ? String(svc.projects_delivered) : "");
      setClientsSatisfaction(svc.clients_satisfaction ? String(svc.clients_satisfaction) : "");

      // Image IDs - API returns objects with {id, image, alt_text}
      if (svc.icon) {
        if (typeof svc.icon === 'object' && svc.icon.id) {
          setIconId(svc.icon.id);
          setIconUrl(svc.icon.image);
          setIconAltText(svc.icon.alt_text || "");
        } else if (typeof svc.icon === 'number') {
          setIconId(svc.icon);
        }
      }

      if (svc.hero_image) {
        if (typeof svc.hero_image === 'object' && svc.hero_image.id) {
          setHeroImageId(svc.hero_image.id);
          // Also use hero_image as service_main_image since they're the same
          setServiceMainImageId(svc.hero_image.id);
          setServiceMainImageUrl(svc.hero_image.image);
          setServiceMainImageAltText(svc.hero_image.alt_text || "");
        } else if (typeof svc.hero_image === 'number') {
          setHeroImageId(svc.hero_image);
          setServiceMainImageId(svc.hero_image);
        }
      }

      if (svc.service_main_image) {
        if (typeof svc.service_main_image === 'object' && svc.service_main_image.id) {
          setServiceMainImageId(svc.service_main_image.id);
          setServiceMainImageUrl(svc.service_main_image.image);
          setServiceMainImageAltText(svc.service_main_image.alt_text || "");
        } else if (typeof svc.service_main_image === 'number') {
          setServiceMainImageId(svc.service_main_image);
        }
      }

      // Map sections data from new API structure
      const newSectionsData: ServiceSectionsData = {
        hero_section: {
          title: "",
          description: "",
          sub_sections: []
        },
        about_section: {
          title: svc.about_title || "",
          description: svc.about_description || "",
          sub_sections: (svc.about_subsections || []).map((sub: any) => ({
            title: sub.title || "",
            description: sub.description || "",
            icon: sub.icon || "",
            iconAltText: sub.alt_text || "",
            alt_text: sub.alt_text || ""
          }))
        },
        why_choose_us_section: {
          title: svc.why_choose_title || "",
          description: svc.why_choose_description || "",
          sub_sections: (svc.why_choose_subsections || []).map((sub: any) => ({
            title: sub.title || "",
            description: sub.description || "",
            icon: sub.icon || "",
            iconAltText: sub.alt_text || "",
            alt_text: sub.alt_text || ""
          }))
        },
        what_we_offer_section: {
          title: svc.what_we_offer_title || "",
          description: svc.what_we_offer_description || "",
          sub_sections: (svc.what_we_offer_subsections || []).map((sub: any) => ({
            title: sub.title || "",
            points: sub.points || [""],
            icon: sub.icon || "",
            iconAltText: sub.alt_text || "",
            alt_text: sub.alt_text || ""
          }))
        },
        perfect_business_section: {
          title: svc.business_title || "",
          description: svc.business_description || "",
          sub_sections: (svc.business_subsections || []).map((sub: any) => ({
            title: sub.title || "",
            description: sub.description || "",
            icon: sub.icon || "",
            iconAltText: sub.alt_text || "",
            alt_text: sub.alt_text || ""
          }))
        },
        design_section: {
          title: svc.design_process_title || "",
          description: svc.design_process_description || "",
          sub_sections: (svc.design_process_subsections || []).map((sub: any) => ({
            title: sub.title || "",
            description: sub.description || ""
          }))
        },
        team_section: {
          title: svc.design_team_title || svc.meet_design_team_title || "",
          description: svc.design_team_description || svc.meet_design_team_description || "",
          sub_sections: (svc.design_team_subsections || svc.meet_design_team_subsections || []).map((sub: any) => ({
            name: sub.name || "",
            designation: sub.designation || "",
            experience: sub.experience || "",
            summary: sub.summary || "",
            image: sub.image || "",
            imageAltText: sub.alt_text || "",
            alt_text: sub.alt_text || ""
          }))
        },
        tools_used_section: {
          title: svc.tools_title || "",
          description: svc.tools_description || "",
          sub_sections: (svc.tools_subsections || []).map((sub: any) => ({
            title: sub.title || "",
            points: sub.points || [""]
          }))
        },
        client_feedback_section: {
          title: "",
          description: "",
          sub_sections: (svc.testimonials || []).map((sub: any) => ({
            name: sub.name || "",
            designation: sub.designation || "",
            comment: sub.comment || "",
            stars: sub.stars || 5,
            image: sub.image || "",
            imageAltText: sub.alt_text || "",
            alt_text: sub.alt_text || ""
          }))
        }
      };

      setSectionsData(newSectionsData);

      // Populate alt text states for subsection icons
      const subSectionAltTexts: Record<string, Record<number, string[]>> = {};

      // About section icons
      if (svc.about_subsections?.length > 0) {
        subSectionAltTexts['about_section'] = {};
        svc.about_subsections.forEach((sub: any, index: number) => {
          if (sub.alt_text) {
            subSectionAltTexts['about_section'][index] = [sub.alt_text];
          }
        });
      }

      // Why choose section icons
      if (svc.why_choose_subsections?.length > 0) {
        subSectionAltTexts['why_choose_us_section'] = {};
        svc.why_choose_subsections.forEach((sub: any, index: number) => {
          if (sub.alt_text) {
            subSectionAltTexts['why_choose_us_section'][index] = [sub.alt_text];
          }
        });
      }

      // What we offer section icons
      if (svc.what_we_offer_subsections?.length > 0) {
        subSectionAltTexts['what_we_offer_section'] = {};
        svc.what_we_offer_subsections.forEach((sub: any, index: number) => {
          if (sub.alt_text) {
            subSectionAltTexts['what_we_offer_section'][index] = [sub.alt_text];
          }
        });
      }

      // Business section icons
      if (svc.business_subsections?.length > 0) {
        subSectionAltTexts['perfect_business_section'] = {};
        svc.business_subsections.forEach((sub: any, index: number) => {
          if (sub.alt_text) {
            subSectionAltTexts['perfect_business_section'][index] = [sub.alt_text];
          }
        });
      }

      // Note: Tools section doesn't have icons anymore

      setSubSectionIconAltTexts(subSectionAltTexts);

      // Populate team member image alt texts
      const teamAltTexts: Record<number, string[]> = {};
      const teamSubsections = svc.design_team_subsections || svc.meet_design_team_subsections || [];
      teamSubsections.forEach((sub: any, index: number) => {
        if (sub.alt_text) {
          teamAltTexts[index] = [sub.alt_text];
        }
      });
      setTeamMemberImageAltTexts(teamAltTexts);

      // Populate client feedback image alt texts
      const clientAltTexts: Record<number, string[]> = {};
      (svc.testimonials || []).forEach((sub: any, index: number) => {
        if (sub.alt_text) {
          clientAltTexts[index] = [sub.alt_text];
        }
      });
      setClientFeedbackImageAltTexts(clientAltTexts);

      // Store original slug for validation
      setOriginalSlug(svc.slug || "");
    }
  }, [service]);

  // Utility function to generate slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
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
  }, [slug, originalSlug]);

  const updateSection = (sectionKey: keyof ServiceSectionsData, field: string, value: any) => {
    setSectionsData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value
      }
    }));
  };

  const updateSubSection = (sectionKey: keyof ServiceSectionsData, index: number, field: string, value: any) => {
    setSectionsData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        sub_sections: prev[sectionKey].sub_sections.map((sub, i) =>
          i === index ? { ...sub, [field]: value } : sub
        )
      }
    }));
  };

  const addSubSection = (sectionKey: keyof ServiceSectionsData) => {
    setSectionsData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        sub_sections: [...prev[sectionKey].sub_sections,
        sectionKey === 'team_section'
          ? { name: "", designation: "", experience: "", summary: "" }
          : sectionKey === 'client_feedback_section'
            ? { name: "", designation: "", comment: "", stars: 5 }
            : sectionKey === 'what_we_offer_section'
              ? { title: "", points: [""] }
              : { title: "", description: "" }
        ]
      }
    }));
  };

  const removeSubSection = (sectionKey: keyof ServiceSectionsData, index: number) => {
    setSectionsData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        sub_sections: prev[sectionKey].sub_sections.filter((_, i) => i !== index)
      }
    }));

    // Remove corresponding icon files
    setSubSectionIcons(prev => {
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
      // For service general images in edit mode, allow only a single image to replace existing
      const filesArray = sectionKey === 'image_files' ? (files.length ? [files[0]] : []) : Array.from(files);
      setSectionFiles(prev => ({
        ...prev,
        [sectionKey]: filesArray
      }));

      // Initialize alt text arrays for the files
      if (sectionKey === 'image_files') {
        // Only one alt text for the single replacement image
        setImageAltTexts(filesArray.length ? [""] : []);
      } else {
        // For section images
        setSectionAltTexts((prev) => ({
          ...prev,
          [sectionKey]: new Array(filesArray.length).fill(""),
        }));
      }
    }
  };

  const handleSubSectionIconChange = async (sectionKey: string, subSectionIndex: number, files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const altText = subSectionIconAltTexts[sectionKey]?.[subSectionIndex]?.[0] || "";

      if (!altText.trim()) {
        toast.error("Please enter alt text first");
        return;
      }

      try {
        const result = await uploadMedia.mutateAsync({
          image: file,
          alt_text: altText
        });

        // Update subsection with image URL from API
        updateSubSection(sectionKey as keyof ServiceSectionsData, subSectionIndex, "icon", result.image);

        // Capture alt_text from response
        if (result.alt_text) {
          updateSubSection(sectionKey as keyof ServiceSectionsData, subSectionIndex, "iconAltText", result.alt_text);
          setSubSectionIconAltTexts((prev) => ({
            ...prev,
            [sectionKey]: {
              ...prev[sectionKey],
              [subSectionIndex]: [result.alt_text],
            },
          }));
        }

        toast.success("Icon uploaded successfully!");
      } catch (error) {
        console.error("Error uploading icon:", error);
        toast.error("Failed to upload icon");
      }
    }
  };

  const handleTeamMemberImageChange = async (memberIndex: number, files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const altText = teamMemberImageAltTexts[memberIndex]?.[0] || "";

      if (!altText.trim()) {
        toast.error("Please enter alt text first");
        return;
      }

      try {
        const result = await uploadMedia.mutateAsync({
          image: file,
          alt_text: altText
        });

        // Update team member with image URL from API
        updateSubSection('team_section', memberIndex, "image", result.image);

        // Capture alt_text from response
        if (result.alt_text) {
          updateSubSection('team_section', memberIndex, "imageAltText", result.alt_text);
          setTeamMemberImageAltTexts(prev => ({
            ...prev,
            [memberIndex]: [result.alt_text]
          }));
        }

        toast.success("Team member photo uploaded!");
      } catch (error) {
        console.error("Error uploading photo:", error);
        toast.error("Failed to upload photo");
      }
    }
  };

  const handleClientFeedbackImageChange = async (clientIndex: number, files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const altText = clientFeedbackImageAltTexts[clientIndex]?.[0] || "";

      if (!altText.trim()) {
        toast.error("Please enter alt text first");
        return;
      }

      try {
        const result = await uploadMedia.mutateAsync({
          image: file,
          alt_text: altText
        });

        // Update client feedback with image URL from API
        updateSubSection('client_feedback_section', clientIndex, "image", result.image);

        // Capture alt_text from response
        if (result.alt_text) {
          updateSubSection('client_feedback_section', clientIndex, "imageAltText", result.alt_text);
          setClientFeedbackImageAltTexts(prev => ({
            ...prev,
            [clientIndex]: [result.alt_text]
          }));
        }

        toast.success("Client photo uploaded!");
      } catch (error) {
        console.error("Error uploading photo:", error);
        toast.error("Failed to upload photo");
      }
    }
  };

  const scrollToTab = (tabValue: string) => {
    console.log('Attempting to scroll to tab:', tabValue);

    // Try multiple selectors to find the tab trigger
    const selectors = [
      `button[value="${tabValue}"]`,
      `[role="tab"][value="${tabValue}"]`,
      `[data-state][value="${tabValue}"]`,
      `.cursor-pointer[value="${tabValue}"]`
    ];

    let tabTrigger: HTMLElement | null = null;
    for (const selector of selectors) {
      tabTrigger = document.querySelector(selector) as HTMLElement;
      if (tabTrigger) {
        console.log('Found tab trigger with selector:', selector);
        break;
      }
    }

    if (tabTrigger) {
      // Force click the tab
      tabTrigger.click();

      // Scroll to top immediately
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Then scroll to the tab content after a delay
      setTimeout(() => {
        const activeTabPanel = document.querySelector('[role="tabpanel"][data-state="active"]');
        if (activeTabPanel) {
          activeTabPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    } else {
      console.error('Tab trigger not found for:', tabValue);
      toast.error(`Please switch to the "${tabValue}" tab to fix the validation error.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToElement = (elementId: string) => {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }, 200);
  };

  const handleSave = async () => {
    if (!service || !serviceId) return;

    // Basic field validations
    if (!title) {
      toast.error("Service title is required.");
      return;
    }

    if (!description) {
      toast.error("Service description is required.");
      return;
    }

    if (!metaTitle) {
      toast.error("Meta title is required.");
      return;
    }

    if (!metaDescription) {
      toast.error("Meta description is required.");
      return;
    }

    // Validate slug format if provided
    if (slug) {
      const slugPattern = /^[a-z0-9-]+$/;
      if (!slugPattern.test(slug)) {
        toast.error("Slug can only contain lowercase letters, numbers, and hyphens.");
        return;
      }
    }

    try {
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
        icon: iconId, // Image ID
        icon_alt_text: iconAltText || "", // Alt text for service post icon
        hero_image: serviceMainImageId || heroImageId, // Use service main image as hero_image
        hero_image_alt_text: serviceMainImageAltText || "", // Alt text for hero image
        bullet_points: bulletPoints,

        // Section data
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

      console.log("============================================");
      console.log("🔄 UPDATING SERVICE:", serviceId);
      console.log("============================================");
      console.log(JSON.stringify(servicePayload, null, 2));
      console.log("============================================");

      // Call update API
      const { servicesDataService } = await import("@/services/services");
      await servicesDataService.updateServiceV2(serviceId, servicePayload);

      toast.success("Service updated successfully!");
      onSaved?.();
    } catch (error: any) {
      console.error("Service update error:", error);

      // Check for field-specific validation errors from backend
      const errorDetails = error.response?.data?.error_details;
      if (errorDetails) {
        console.log("Field validation errors:", errorDetails);

        // Show first error
        const firstErrorKey = Object.keys(errorDetails)[0];
        const firstErrorValue = errorDetails[firstErrorKey];
        const errorMsg = Array.isArray(firstErrorValue) ? firstErrorValue[0] : firstErrorValue;
        toast.error(errorMsg || "Validation failed. Please check the form.");
      } else {
        // Generic error without field details
        const errorMessage = error.response?.data?.message
          || error.response?.data?.error
          || error.message
          || "Failed to update service. Please try again.";
        toast.error(errorMessage);
      }

      // Log detailed error for debugging
      if (error.response?.data) {
        console.error("Backend error details:", error.response.data);
      }
    }
  };

  const renderSubSection = (sectionKey: keyof ServiceSectionsData, subSection: any, index: number) => {
    if (sectionKey === 'team_section') {
      return (
        <div key={index} className="grid gap-4 p-4 border rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={subSection.name}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSubSection(sectionKey, index, 'name', value);
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
              <Label>Designation</Label>
              <Input
                value={subSection.designation}
                onChange={(e) => updateSubSection(sectionKey, index, 'designation', e.target.value)}
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
              <Label>Experience</Label>
              <Input
                value={subSection.experience}
                onChange={(e) => updateSubSection(sectionKey, index, 'experience', e.target.value)}
                placeholder="e.g., 5+ years"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {100 - (subSection.experience?.length || 0)} characters remaining
              </p>
            </div>
            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                rows={3}
                value={subSection.summary}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSubSection(sectionKey, index, 'summary', value);
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
                  onChange={(e) => handleTeamMemberImageChange(index, e.target.files)}
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
              <div className="mt-2">
                <Label className="text-sm font-medium">Current Photo</Label>
                <img
                  src={getImageUrl(subSection.image)}
                  alt={`${subSection.name}'s photo`}
                  className="h-32 w-32 rounded-full border object-cover mt-2 bg-muted/50 p-2"
                />
                <p className="text-xs text-green-600 mt-1">✓ Selected</p>
              </div>
            )}
            {(teamMemberImages[index]?.length || 0) > 0 && (
              <div className="mt-2">
                <Label className="text-sm font-medium">New Photo to Upload</Label>
                <img
                  src={URL.createObjectURL(teamMemberImages[index][0])}
                  alt={`New photo preview for ${subSection.name}`}
                  className="h-32 w-32 rounded-full border object-cover mt-2"
                />
              </div>
            )}
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

    if (sectionKey === 'client_feedback_section') {
      return (
        <div key={index} className="grid gap-4 p-4 border rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={subSection.name}
                onChange={(e) => updateSubSection(sectionKey, index, 'name', e.target.value)}
                placeholder="Client name"
                maxLength={50}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {50 - (subSection.name?.length || 0)} characters remaining
              </p>
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input
                value={subSection.designation}
                onChange={(e) => updateSubSection(sectionKey, index, 'designation', e.target.value)}
                placeholder="Job title"
                maxLength={50}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {50 - (subSection.designation?.length || 0)} characters remaining
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Comment</Label>
            <Textarea
              value={subSection.comment}
              onChange={(e) => updateSubSection(sectionKey, index, 'comment', e.target.value)}
              placeholder="Client feedback"
              rows={3}
              maxLength={100}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {100 - (subSection.comment?.length || 0)} characters remaining
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
                  onChange={(e) => handleClientFeedbackImageChange(index, e.target.files)}
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
              <div className="mt-2">
                <Label className="text-sm font-medium">Current Client Photo</Label>
                <img
                  src={getImageUrl(subSection.image)}
                  alt="Current Client Photo"
                  className="h-32 w-32 rounded-full border object-cover mt-2 bg-muted/50 p-2"
                />
                <p className="text-xs text-green-600 mt-1">✓ Selected</p>
              </div>
            )}
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

    // Special handling for sections with points (what_we_offer and tools_used)
    if (sectionKey === 'what_we_offer_section' || sectionKey === 'tools_used_section') {
      return (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={subSection.title}
              onChange={(e) => updateSubSection(sectionKey, index, 'title', e.target.value)}
              placeholder="Sub-section title"
              maxLength={70}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {70 - (subSection.title?.length || 0)} characters remaining
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Points</Label>
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
                    <div key={pointIndex} className="flex gap-2 items-center">
                      <Input
                        value={point}
                        onChange={(e) => updatePoint(sectionKey, index, pointIndex, e.target.value)}
                        placeholder={`Point ${pointIndex + 1}`}
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
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Sub-section Icon Upload - Only show for what_we_offer_section */}
          {sectionKey === 'what_we_offer_section' && (
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
                    onChange={(e) => handleSubSectionIconChange(sectionKey, index, e.target.files)}
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
                    src={subSection.icon}
                    alt="Current Sub-section Icon"
                    className="h-24 w-24 rounded border object-cover mt-2 bg-muted/50 p-2"
                  />
                  <p className="text-xs text-green-600 mt-1">✓ Selected</p>
                </div>
              )}
              {(subSectionIcons[sectionKey]?.[index]?.length || 0) > 0 && (
                <div className="mt-2">
                  <Label className="text-sm font-medium">New Icon to Upload</Label>
                  <img
                    src={URL.createObjectURL(subSectionIcons[sectionKey][index][0])}
                    alt="New Sub-section Icon Preview"
                    className="h-24 w-24 rounded border object-cover mt-2"
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
    }

    return (
      <div key={index} className="grid gap-4 p-4 border rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={subSection.title}
              onChange={(e) => updateSubSection(sectionKey, index, 'title', e.target.value)}
              placeholder="Sub-section title"
              maxLength={70}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {70 - (subSection.title?.length || 0)} characters remaining
            </p>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={subSection.description}
              onChange={(e) => updateSubSection(sectionKey, index, 'description', e.target.value)}
              placeholder="Sub-section description"
              maxLength={200}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {200 - (subSection.description?.length || 0)} characters remaining
            </p>
          </div>
        </div>

        {/* Sub-section Icon Upload - Only for non-hero sections and not for design_section */}
        {sectionKey !== 'hero_section' && sectionKey !== 'design_section' && (
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
                  onChange={(e) => handleSubSectionIconChange(sectionKey, index, e.target.files)}
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
                  src={subSection.icon}
                  alt="Current Sub-section Icon"
                  className="h-24 w-24 rounded border object-cover mt-2 bg-muted/50 p-2"
                />
                <p className="text-xs text-green-600 mt-1">✓ Selected</p>
              </div>
            )}
            {(subSectionIcons[sectionKey]?.[index]?.length || 0) > 0 && (
              <div className="mt-2">
                <Label className="text-sm font-medium">New Icon to Upload</Label>
                <img
                  src={URL.createObjectURL(subSectionIcons[sectionKey][index][0])}
                  alt="New Sub-section Icon Preview"
                  className="h-24 w-24 rounded border object-cover mt-2"
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

  const renderSection = (sectionKey: keyof ServiceSectionsData, section: any) => {

    if (sectionKey === 'hero_section') {
      return null;
    }

    // Skip title and description for client feedback section
    if (sectionKey === 'client_feedback_section') {
      return (
        <Card key={sectionKey} className="mb-4">
          <CardHeader>
            <CardTitle className="capitalize text-sm">
              Client Testimonials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-4">
                {section.sub_sections.map((subSection: any, index: number) =>
                  renderSubSection(sectionKey, subSection, index)
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSubSection(sectionKey)}
                  className="w-full"
                >
                  + Add Testimonial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    const fileUploadKey = `${sectionKey}_image_files`;
    return (
      <Card key={sectionKey} className="mb-4">
        <CardHeader>
          <CardTitle className="capitalize text-sm">
            {sectionKey.replace(/_/g, ' ')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">

            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input
                value={section.title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    updateSection(sectionKey, 'title', value);
                  }
                }}
                placeholder={`Enter ${sectionKey.replace(/_/g, ' ')} title`}
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {100 - (section.title?.length || 0)} characters remaining
              </p>
            </div>

            <div className="space-y-2">
              <Label>Section Description</Label>
              <Textarea
                value={section.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 1000) {
                    updateSection(sectionKey, 'description', value);
                  }
                }}
                placeholder={`Enter ${sectionKey.replace(/_/g, ' ')} description`}
                rows={2}
                maxLength={1000}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {1000 - (section.description?.length || 0)} characters remaining
              </p>
            </div>
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

                <Label>Section Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(fileUploadKey, e.target.files)}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload a single image for the hero section
                </p>

                {section.image && (
                  <div className="mt-2">
                    <Label className="text-sm font-medium">Current Hero Image</Label>
                    <img
                      src={getImageUrl(section.image)}
                      alt="Current Hero Section Image"
                      className="h-40 w-auto rounded border object-cover mt-2 bg-muted/50 p-2"
                    />
                  </div>
                )}

                {sectionFiles[fileUploadKey]?.length > 0 && (
                  <div className="mt-2">
                    <Label className="text-sm font-medium">New Hero Image to Upload</Label>
                    <img
                      src={URL.createObjectURL(sectionFiles[fileUploadKey][0])}
                      alt="Hero Section Preview"
                      className="h-40 w-auto rounded border object-cover mt-2"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <>
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

          </>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic" className="cursor-pointer">Basic Info</TabsTrigger>
          <TabsTrigger value="sections" className="cursor-pointer">Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="service-title">Title</Label>
              <Input
                id="service-title"
                value={title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    setTitle(value);
                  }
                }}
                placeholder="Enter service title"
                maxLength={100}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                {100 - (title?.length || 0)} characters remaining
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service-slug">Slug</Label>
              <div className="relative">
                <Input
                  id="service-slug"
                  value={slug}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 100) {
                      setSlug(generateSlug(value));
                      setSlugCheckMessage("");
                      setSlugAvailable(null);
                    }
                  }}
                  placeholder="url-friendly-slug"
                  maxLength={100}
                />
                {isCheckingSlug && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Use lowercase letters, numbers, and hyphens only
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

            <div className="grid gap-2">
              <Label htmlFor="service-description">Description</Label>
              <Textarea
                id="service-description"
                value={description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 400) {
                    setDescription(value);
                  }
                }}
                placeholder="Enter service description"
                rows={4}
                maxLength={400}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                {(description?.length || 0)}/400 characters (minimum 100 required)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meta-title">Meta Title</Label>
              <Input
                id="meta-title"
                value={metaTitle}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 60) {
                    setMetaTitle(value);
                  }
                }}
                placeholder="Enter meta title for SEO"
                maxLength={60}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                {60 - (metaTitle?.length || 0)} characters remaining
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meta-description">Meta Description</Label>
              <Textarea
                id="meta-description"
                value={metaDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  const value = e.target.value;
                  if (value.length <= 160) {
                    setMetaDescription(value);
                  }
                }}
                placeholder="Enter meta description for SEO"
                rows={3}
                maxLength={160}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                {160 - (metaDescription?.length || 0)} characters remaining
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="projects-delivered">Projects Delivered</Label>
                <Input
                  id="projects-delivered"
                  type="number"
                  value={projectsDelivered}
                  onChange={(e) => setProjectsDelivered(e.target.value)}
                  placeholder="e.g., 200"
                  min="0"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Number of projects completed
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="clients-satisfaction">Clients Satisfaction (%)</Label>
                <Input
                  id="clients-satisfaction"
                  type="number"
                  value={clientsSatisfaction}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value !== '' && (parseInt(value) < 0 || parseInt(value) > 100)) {
                      return;
                    }
                    setClientsSatisfaction(value);
                  }}
                  placeholder="e.g., 98"
                  min="0"
                  max="100"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Satisfaction percentage (0-100)
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Service Post Icon Alt Text</Label>
                <Input
                  value={iconAltText}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 255) {
                      setIconAltText(value);
                    }
                  }}
                  placeholder="Enter alt text for the icon"
                  maxLength={255}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {255 - (iconAltText?.length || 0)} characters remaining
                </p>

                <Label>Service Post Icon</Label>

                {/* Image Upload Options */}
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer">
                    <Input
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
                            toast.success("Icon uploaded! ID: " + result.id);
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

                {iconId && (
                  <div className="mt-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Current Icon ID: {iconId} {iconFromGallery && '(from gallery)'}
                    </div>
                    {iconUrl && (
                      <div>
                        <Label className="text-sm font-medium">Current Icon Preview</Label>
                        <img
                          src={iconUrl}
                          alt={iconAltText || "Service Icon"}
                          className="h-24 w-24 rounded border object-cover mt-2 bg-muted/50 p-2"
                        />
                      </div>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Upload new service icon to replace existing (will store ID)
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Service Main Image Alt Text</Label>
                <Input
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
                  {255 - (serviceMainImageAltText?.length || 0)} characters remaining
                </p>

                <Label>Service Main Image</Label>

                {/* Image Upload Options */}
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer">
                    <Input
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
                            toast.success("Main image uploaded! ID: " + result.id);
                          } catch (error) {
                            console.error("Error uploading main image:", error);
                            toast.error("Failed to upload main image");
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

                {serviceMainImageId && (
                  <div className="mt-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Current Image ID: {serviceMainImageId} {mainImageFromGallery && '(from gallery)'}
                    </div>
                    {serviceMainImageUrl && (
                      <div>
                        <Label className="text-sm font-medium">Current Main Image Preview</Label>
                        <img
                          src={serviceMainImageUrl}
                          alt={serviceMainImageAltText || "Service Main Image"}
                          className="h-40 w-auto rounded border object-cover mt-2 bg-muted/50 p-2"
                        />
                      </div>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Upload new main image to replace existing (will store ID)
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Switch
                id="service-status"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="service-status">Service is active</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <div className="space-y-4">
            {Object.entries(sectionsData).map(([sectionKey, section]) =>
              renderSection(sectionKey as keyof ServiceSectionsData, section)
            )}
          </div>
        </TabsContent>

      </Tabs>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={editService.isPending}>
            Cancel
          </Button>
        )}
        <Button type="button" onClick={handleSave} disabled={editService.isPending}>
          {editService.isPending ? (
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
