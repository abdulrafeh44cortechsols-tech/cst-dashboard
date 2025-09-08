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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Service, CreateServiceData, ServiceSectionsData } from "@/types/types";
import { useServices } from "@/hooks/useServices";
import { getDefaultSectionsData } from "@/data/exampleServiceData";

interface EditServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditServiceModal({ service, isOpen, onClose }: EditServiceModalProps) {
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

  // Sub-section icon files state
  const [subSectionIcons, setSubSectionIcons] = useState<Record<string, Record<number, File[]>>>({});

  // Team member images state
  const [teamMemberImages, setTeamMemberImages] = useState<Record<number, File[]>>({});

  // Client feedback images state
  const [clientFeedbackImages, setClientFeedbackImages] = useState<Record<number, File[]>>({});

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
      setSectionFiles(prev => ({
        ...prev,
        [sectionKey]: Array.from(files)
      }));
    }
  };

  const handleSubSectionIconChange = (sectionKey: string, subSectionIndex: number, files: FileList | null) => {
    if (files) {
      setSubSectionIcons(prev => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          [subSectionIndex]: Array.from(files)
        }
      }));
    }
  };

  const handleTeamMemberImageChange = (memberIndex: number, files: FileList | null) => {
    if (files) {
      setTeamMemberImages(prev => ({
        ...prev,
        [memberIndex]: Array.from(files)
      }));
    }
  };

  const handleClientFeedbackImageChange = (clientIndex: number, files: FileList | null) => {
    if (files) {
      setClientFeedbackImages(prev => ({
        ...prev,
        [clientIndex]: Array.from(files)
      }));
    }
  };

  const handleSave = async () => {
    if (!service) return;

    if (!title || !description || !metaTitle || !metaDescription) {
      toast.error("Please fill all required fields.");
      return;
    }

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
      Object.entries(sectionFiles).forEach(([key, files]) => {
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

      await editService.mutateAsync({ id: service.id.toString(), data: formData });
      toast.success("Service updated successfully!");
      onClose();
    } catch (error: any) {
      toast.error("Failed to update service. Please try again.");
      console.error("Service update error:", error);
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
                onChange={(e) => updateSubSection(sectionKey, index, 'name', e.target.value)}
                placeholder="Team member name"
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
              <Input
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
            <Input
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
                onChange={(e) => updateSection(sectionKey, 'title', e.target.value)}
                placeholder={`Enter ${sectionKey.replace(/_/g, ' ')} title`}
              />
            </div>
            <div className="space-y-2">
              <Label>Section Description</Label>
              <Textarea
                value={section.description}
                onChange={(e) => updateSection(sectionKey, 'description', e.target.value)}
                placeholder={`Enter ${sectionKey.replace(/_/g, ' ')} description`}
                rows={2}
              />
            </div>
            
            {/* File Upload - Only for hero section */}
            {sectionKey === 'hero_section' && (
              <div className="space-y-2">
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
          <DialogDescription>
            Update the service details and sections. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="service-title">Title</Label>
                <Input
                  id="service-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter service title"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service-description">Description</Label>
                <Textarea
                  id="service-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter service description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Enter meta title for SEO"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={metaDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMetaDescription(e.target.value)}
                  placeholder="Enter meta description for SEO"
                  rows={3}
                  required
                />
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
                <Label>General Service Images</Label>
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
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="default" onClick={handleSave} disabled={editService.isPending}>
            {editService.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
