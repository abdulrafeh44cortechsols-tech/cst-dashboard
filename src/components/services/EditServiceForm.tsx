"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Service, ServiceSectionsData } from "@/types/types";
import { useServices } from "@/hooks/useServices";
import { getDefaultSectionsData } from "@/data/exampleServiceData";

interface EditServiceFormProps {
  service: Service | null;
  onCancel?: () => void;
  onSaved?: () => void;
}

export function EditServiceForm({ service, onCancel, onSaved }: EditServiceFormProps) {
  const { editService } = useServices();
  
  // Basic service fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Sections data
  const [sectionsData, setSectionsData] = useState<ServiceSectionsData>(getDefaultSectionsData());

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

  useEffect(() => {
    if (service) {
      setTitle(service.title);
      setDescription(service.description);
      setMetaTitle(service.meta_title);
      setMetaDescription(service.meta_description);
      setIsActive(service.is_active);
      
      // Load sections data if it exists
      if (service.sections_data) {
        setSectionsData(service.sections_data);
      }

      // Load existing alt texts if available
      if ((service as any).image_alt_text && (service as any).image_alt_text.length > 0) {
        setImageAltTexts((service as any).image_alt_text);
      }
    }
  }, [service]);

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
      const filesArray = Array.from(files);
      setSectionFiles(prev => ({
        ...prev,
        [sectionKey]: filesArray
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

  const handleSubSectionIconChange = (sectionKey: string, subSectionIndex: number, files: FileList | null) => {
    if (files) {
      const filesArray = Array.from(files);
      setSubSectionIcons(prev => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          [subSectionIndex]: filesArray
        }
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
    if (!service) return;

    // Basic field validations with scroll to error
    if (!title) {
      toast.error("Service title is required.");
      scrollToTab('basic');
      scrollToElement('service-title');
      return;
    }

    if (title.length > 100) {
      toast.error("Service title must be 100 characters or less.");
      scrollToTab('basic');
      scrollToElement('service-title');
      return;
    }

    if (!description) {
      toast.error("Service description is required.");
      scrollToTab('basic');
      scrollToElement('service-description');
      return;
    }

    if (description.length < 100) {
      toast.error("Service description must be at least 100 characters long.");
      scrollToTab('basic');
      scrollToElement('service-description');
      return;
    }

    if (description.length > 2000) {
      toast.error("Service description must be 2000 characters or less.");
      scrollToTab('basic');
      scrollToElement('service-description');
      return;
    }

    if (!metaTitle) {
      toast.error("Meta title is required.");
      scrollToTab('basic');
      scrollToElement('meta-title');
      return;
    }

    if (metaTitle.length > 60) {
      toast.error("Meta title must be 60 characters or less.");
      scrollToTab('basic');
      scrollToElement('meta-title');
      return;
    }

    if (!metaDescription) {
      toast.error("Meta description is required.");
      scrollToTab('basic');
      scrollToElement('meta-description');
      return;
    }

    if (metaDescription.length > 160) {
      toast.error("Meta description must be 160 characters or less.");
      scrollToTab('basic');
      scrollToElement('meta-description');
      return;
    }

    // No section validation - sections are optional
    // Backend will handle any required validations

    try {
      // Create FormData object
      const formData = new FormData();
      
      // Add basic fields (only if they have values)
      if (title.trim()) formData.append("title", title);
      if (description.trim()) formData.append("description", description);
      formData.append("is_active", isActive.toString());
      if (metaTitle.trim()) formData.append("meta_title", metaTitle);
      if (metaDescription.trim()) formData.append("meta_description", metaDescription);
      
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
      
      // Clean sections data - remove empty sections and sub-sections
      const cleanedSectionsData: any = {};
      Object.entries(processedSectionsData).forEach(([sectionKey, section]) => {
        // Only include sections that have meaningful content
        const hasTitle = section.title && section.title.trim() !== '';
        const hasDescription = section.description && section.description.trim() !== '';
        const hasSubSections = section.sub_sections && section.sub_sections.length > 0;
        
        if (hasTitle || hasDescription || hasSubSections) {
          // Clean sub-sections - only include non-empty ones
          const cleanedSubSections = section.sub_sections.filter((subSection: any) => {
            if (sectionKey === 'team_section') {
              return subSection.name?.trim() || subSection.designation?.trim() || 
                     subSection.experience?.trim() || subSection.summary?.trim();
            } else if (sectionKey === 'client_feedback_section') {
              return subSection.name?.trim() || subSection.designation?.trim() || 
                     subSection.comment?.trim() || subSection.stars;
            } else if (sectionKey === 'what_we_offer_section') {
              return subSection.title?.trim() || subSection.description?.trim();
            } else {
              return subSection.title?.trim() || subSection.description?.trim();
            }
          });
          
          cleanedSectionsData[sectionKey] = {
            ...section,
            sub_sections: cleanedSubSections
          };
        }
      });
      
      // Only add sections data if there's meaningful content
      if (Object.keys(cleanedSectionsData).length > 0) {
        formData.append("sections_data", JSON.stringify(cleanedSectionsData));
      }
      
      // Add files for each section (only if files exist)
      // Exclude 'image_files' as it's handled separately below
      Object.entries(sectionFiles).forEach(([key, files]) => {
        if (key === 'image_files') return; // Skip image_files here, handled separately
        
        if (files && files.length > 0) {
          if (key === 'hero_section_image_file') {
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

      // Add sub-section icons to the corresponding section files (only if files exist)
      Object.entries(subSectionIcons).forEach(([sectionKey, subSectionFiles]) => {
        const sectionFileKey = sectionKey === 'hero_section' 
          ? 'hero_section_image_file' 
          : `${sectionKey}_image_files`;
        
        Object.values(subSectionFiles).forEach(files => {
          if (files && files.length > 0) {
            files.forEach(file => {
              formData.append(sectionFileKey, file);
            });
          }
        });
      });

      // Add team member images to team_section_image_files (only if files exist)
      Object.values(teamMemberImages).forEach(files => {
        if (files && files.length > 0) {
          files.forEach(file => {
            formData.append('team_section_image_files', file);
          });
        }
      });

      // Add client feedback images to client_feedback_section_image_files (only if files exist)
      Object.values(clientFeedbackImages).forEach(files => {
        if (files && files.length > 0) {
          files.forEach(file => {
            formData.append('client_feedback_section_image_files', file);
          });
        }
      });
      
      // Only add general images if they exist
      if (sectionFiles.image_files && sectionFiles.image_files.length > 0) {
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

      await editService.mutateAsync({ id: service.id.toString(), data: formData });
      toast.success("Service updated successfully!");
      onSaved?.();
    } catch (error: any) {
      console.error("Service update error:", error);
      
      // Check for field-specific validation errors from backend
      const errorDetails = error.response?.data?.error_details;
      if (errorDetails) {
        console.log("Field validation errors:", errorDetails);
        
        // Show field-specific errors
        if (errorDetails.title) {
          const errorMsg = Array.isArray(errorDetails.title) ? errorDetails.title[0] : errorDetails.title;
          toast.error(errorMsg);
          scrollToTab('basic');
          scrollToElement('service-title');
        } else if (errorDetails.slug) {
          const errorMsg = Array.isArray(errorDetails.slug) ? errorDetails.slug[0] : errorDetails.slug;
          toast.error(errorMsg);
          scrollToTab('basic');
        } else if (errorDetails.description) {
          const errorMsg = Array.isArray(errorDetails.description) ? errorDetails.description[0] : errorDetails.description;
          toast.error(errorMsg);
          scrollToTab('basic');
          scrollToElement('service-description');
        } else if (errorDetails.meta_title) {
          const errorMsg = Array.isArray(errorDetails.meta_title) ? errorDetails.meta_title[0] : errorDetails.meta_title;
          toast.error(errorMsg);
          scrollToTab('basic');
          scrollToElement('meta-title');
        } else if (errorDetails.meta_description) {
          const errorMsg = Array.isArray(errorDetails.meta_description) ? errorDetails.meta_description[0] : errorDetails.meta_description;
          toast.error(errorMsg);
          scrollToTab('basic');
          scrollToElement('meta-description');
        } else {
          // Show first error from error_details
          const firstErrorKey = Object.keys(errorDetails)[0];
          const firstErrorValue = errorDetails[firstErrorKey];
          const errorMsg = Array.isArray(firstErrorValue) ? firstErrorValue[0] : firstErrorValue;
          toast.error(errorMsg || "Validation failed. Please check the form.");
        }
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
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Experience</Label>
              <Input
                value={subSection.experience}
                onChange={(e) => updateSubSection(sectionKey, index, 'experience', e.target.value)}
                placeholder="e.g., 5+ years"
              />
            </div>
            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                rows={3}
                value={subSection.summary}
                onChange={(e) => updateSubSection(sectionKey, index, 'summary', e.target.value)}
                placeholder="Brief description"
              />
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
              />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input
                value={subSection.designation}
                onChange={(e) => updateSubSection(sectionKey, index, 'designation', e.target.value)}
                placeholder="Job title"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Comment</Label>
            <Textarea
              value={subSection.comment}
              onChange={(e) => updateSubSection(sectionKey, index, 'comment', e.target.value)}
              placeholder="Client feedback"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Stars (1-5)</Label>
            <Input
              type="number"
              min="1"
              max="5"
              value={subSection.stars}
              onChange={(e) => updateSubSection(sectionKey, index, 'stars', parseInt(e.target.value))}
            />
          </div>
          
          {/* Client Photo Upload */}
          <div className="space-y-2">
            <Label>Client Photo</Label>
            {subSection.image && (
              <div className="mt-2">
                <Label className="text-sm font-medium">Current Client Photo</Label>
                <img
                  src={subSection.image}
                  alt="Current Client Photo"
                  className="h-32 w-32 rounded-full border object-cover mt-2 bg-muted/50 p-2"
                />
              </div>
            )}
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
            <Label>Title</Label>
            <Input
              value={subSection.title}
              onChange={(e) => updateSubSection(sectionKey, index, 'title', e.target.value)}
              placeholder="Sub-section title"
            />
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
              {(subSection.points || [""]).map((point: string, pointIndex: number) => (
                <div key={pointIndex} className="flex gap-2">
                  <Input
                    value={point}
                    onChange={(e) => updatePoint(sectionKey, index, pointIndex, e.target.value)}
                    placeholder={`Point ${pointIndex + 1}`}
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
            {subSection.image && (
              <div className="mt-2">
                <Label className="text-sm font-medium">Current Icon</Label>
                <img
                  src={subSection.image}
                  alt="Current Sub-section Icon"
                  className="h-24 w-24 rounded border object-cover mt-2 bg-muted/50 p-2"
                />
              </div>
            )}
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
            <Label>Title</Label>
            <Input
              value={subSection.title}
              onChange={(e) => updateSubSection(sectionKey, index, 'title', e.target.value)}
              placeholder="Sub-section title"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
            rows={3}
              value={subSection.description}
              onChange={(e) => updateSubSection(sectionKey, index, 'description', e.target.value)}
              placeholder="Sub-section description"
            />
          </div>
        </div>
        
        {/* Sub-section Icon Upload - Only for non-hero sections */}
        {sectionKey !== 'hero_section' && (
          <div className="space-y-2">
            <Label>Sub-section Icon</Label>
            {subSection.image && (
              <div className="mt-2">
                <Label className="text-sm font-medium">Current Icon</Label>
                <img
                  src={subSection.image}
                  alt="Current Sub-section Icon"
                  className="h-24 w-24 rounded border object-cover mt-2 bg-muted/50 p-2"
                />
              </div>
            )}
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
    // Get the corresponding file upload key for this section
    const fileUploadKey = sectionKey === 'hero_section' 
      ? 'hero_section_image_file' 
      : `${sectionKey}_image_files`;

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
            
            {/* File Upload - Only for hero section */}
            {sectionKey === 'hero_section' && (
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
                
                {/* Existing Hero Section Image */}
                {section.image && (
                  <div className="mt-2">
                    <Label className="text-sm font-medium">Current Hero Image</Label>
                    <img
                      src={section.image}
                      alt="Current Hero Section Image"
                      className="h-40 w-auto rounded border object-cover mt-2 bg-muted/50 p-2"
                    />
                  </div>
                )}

                {/* New Hero Section Image Preview */}
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
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="cursor-pointer">Basic Info</TabsTrigger>
          <TabsTrigger value="sections" className="cursor-pointer">Sections</TabsTrigger>
          <TabsTrigger value="images" className="cursor-pointer">Images</TabsTrigger>
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
              <Label htmlFor="service-description">Description</Label>
              <Textarea
                id="service-description"
                value={description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 2000) {
                    setDescription(value);
                  }
                }}
                placeholder="Enter service description"
                rows={4}
                maxLength={2000}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                {(description?.length || 0)}/2000 characters (minimum 100 required)
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

            <div className="flex items-center space-x-2">
              <Switch
                id="service-status"
                checked={isActive}
                onCheckedChange={setIsActive}
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

        <TabsContent value="images" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Service Icon</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileChange('image_files', e.target.files)}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload general images for this service
              </p>
              
              {/* Existing Images from Service */}
              {service?.images && service.images.length > 0 && (
                <div className="mt-4 space-y-4">
                  <Label className="text-sm font-medium">Existing Service Images</Label>
                  {service.images.map((imageUrl, idx) => (
                    <div key={`existing-${idx}`} className="space-y-2 p-4 border rounded-lg bg-muted/50">
                      <img
                        src={imageUrl}
                        alt={`Existing Service Image ${idx + 1}`}
                        className="h-40 w-auto rounded border object-cover"
                      />
                      <p className="text-sm text-muted-foreground">
                        Existing image {idx + 1}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* New Image Previews and Alt Text */}
              {sectionFiles.image_files.length > 0 && (
                <div className="mt-4 space-y-4">
                  <Label className="text-sm font-medium">New Images to Upload</Label>
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
