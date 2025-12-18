"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { useTags } from "@/hooks/useTags";
import { projectsDataService } from "@/services/projects";
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
import {
	X,
	Plus,
	Trash2,
	Save,
	RefreshCw,
	AlertCircle,
	Upload,
	ImageIcon,
	CheckCircle2,
	XCircle,
	Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { MediaGalleryModal } from "@/components/media/MediaGalleryModal";
import type { MediaItem } from "@/services/media";
import type { CreateProjectData } from "@/types/types";

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
	const tags = tagsResponse?.results;

	// Basic project fields
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [descriptionError, setDescriptionError] = useState<string | null>(null);
	const [slug, setSlug] = useState("");
	const [selectedTags, setSelectedTags] = useState<number[]>([]);

	// Slug validation state
	const [slugCheckMessage, setSlugCheckMessage] = useState<string>("");
	const [isCheckingSlug, setIsCheckingSlug] = useState(false);
	const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

	// Meta fields
	const [metaTitle, setMetaTitle] = useState("");
	const [metaDescription, setMetaDescription] = useState("");
	const [isPublished, setIsPublished] = useState(false);

	// Challenge section
	const [challengeTitle, setChallengeTitle] = useState("");
	const [challengeDescription, setChallengeDescription] = useState("");
	const [challengeDescriptionError, setChallengeDescriptionError] = useState<
		string | null
	>(null);

	// Project Goal section (matching EditProjectForm)
	const [projectGoalTitle, setProjectGoalTitle] = useState("");
	const [projectGoalContent, setProjectGoalContent] = useState<
		Array<{
			goal: string;
			icons: { url: string; alt_text: string }[];
			iconFiles?: File[];
			iconAltTexts?: string[];
			uploading?: boolean;
			uploaded?: boolean;
		}>
	>([]);
	const [projectGoalSectionIntro, setProjectGoalSectionIntro] = useState("");
	const [projectGoalSectionItems, setProjectGoalSectionItems] = useState<
		Array<{
			title: string;
			desc: string;
			points?: string[];
			bottomDescription?: string;
		}>
	>([]);

	// Technology section (matching EditProjectForm)
	const [technologyTitle, setTechnologyTitle] = useState("");
	const [technologyDescription, setTechnologyDescription] = useState("");
	const [technologyContent, setTechnologyContent] = useState<
		Array<{
			name: string;
			icons: { url: string; alt_text: string }[];
			iconFiles?: File[];
			iconAltTexts?: string[];
			uploading?: boolean;
			uploaded?: boolean;
		}>
	>([]);

	// Upload individual goal content icon (matching EditProjectForm)
	const uploadGoalIcon = async (index: number) => {
		const item = projectGoalContent[index];

		if (!item.iconFiles?.[0]) {
			toast.error("No image file selected");
			return;
		}

		if (!item.iconAltTexts?.[0]?.trim()) {
			toast.error("Please add alt text before uploading the image");
			return;
		}

		// Set uploading state
		const updated = [...projectGoalContent];
		updated[index] = { ...updated[index], uploading: true };
		setProjectGoalContent(updated);

		try {
			const { mediaService } = await import("@/services/media");
			const uploadedIcon = await mediaService.uploadMedia({
				image: item.iconFiles[0],
				alt_text: item.iconAltTexts[0],
			});

			// Update with uploaded URL and mark as uploaded
			setProjectGoalContent((prev) => {
				const updatedState = [...prev];
				updatedState[index] = {
					...prev[index],
					icons: [{ url: uploadedIcon.image, alt_text: item.iconAltTexts![0] }],
					iconFiles: undefined,
					uploading: false,
					uploaded: true,
				};
				return updatedState;
			});

			toast.success(`Goal icon uploaded successfully!`);
		} catch (error: any) {
			console.error("Error uploading goal icon:", error);
			toast.error(
				"Failed to upload icon: " + (error.message || "Unknown error")
			);

			// Reset uploading state on error
			setProjectGoalContent((prev) => {
				const updatedState = [...prev];
				updatedState[index] = { ...prev[index], uploading: false };
				return updatedState;
			});
		}
	};

	// Upload technology content icons (1-4 images)
	const uploadTechIcon = async (index: number) => {
		const item = technologyContent[index];

		if (!item.iconFiles || item.iconFiles.length === 0) {
			toast.error("No image files selected");
			return;
		}

		if (!item.iconAltTexts || !item.iconAltTexts.every((alt) => alt?.trim())) {
			toast.error("Please add alt text for all images before uploading");
			return;
		}

		// Set uploading state
		setTechnologyContent((prev) => {
			const updated = [...prev];
			updated[index] = { ...updated[index], uploading: true };
			return updated;
		});

		try {
			const { mediaService } = await import("@/services/media");

			// Upload all images for this technology using bulkUploadMedia
			const uploadPromises = item.iconFiles.map((file, i) => {
				return mediaService.uploadMedia({
					image: file,
					alt_text: item.iconAltTexts![i],
				});
			});

			const uploadedImages = await Promise.all(uploadPromises);

			// Update with uploaded URLs as array of objects
			setTechnologyContent((prev) => {
				const updated = [...prev];
				updated[index] = {
					...prev[index],
					icons: uploadedImages.map((img) => ({
						url: img.image,
						alt_text: img.alt_text,
					})),
					iconFiles: undefined,
					iconAltTexts: undefined,
					uploading: false,
					uploaded: true,
				};
				return updated;
			});

			toast.success(
				`${uploadedImages.length} technology icon(s) uploaded successfully!`
			);
		} catch (error: any) {
			console.error("Error uploading technology icons:", error);
			toast.error(
				"Failed to upload icons: " + (error.message || "Unknown error")
			);

			// Reset uploading state on error
			setTechnologyContent((prev) => {
				const updated = [...prev];
				updated[index] = { ...prev[index], uploading: false };
				return updated;
			});
		}
	};

	// Main project image
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imageAltText, setImageAltText] = useState<string>("");

	// Project Icons (1-4 images max) - matching EditProjectForm
	const [icons, setIcons] = useState<
		Array<{ id?: number; image: string; alt_text: string }>
	>([]);
	const [iconFiles, setIconFiles] = useState<File[]>([]);
	const [iconAltTexts, setIconAltTexts] = useState<string[]>([]);
	const [iconPreviews, setIconPreviews] = useState<string[]>([]);
	const [uploadingIcons, setUploadingIcons] = useState(false);

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

	// Media gallery modal states
	const [showMainImageGallery, setShowMainImageGallery] = useState(false);
	const [showIconsGallery, setShowIconsGallery] = useState(false);
	const [showHeroGallery, setShowHeroGallery] = useState(false);
	const [showGoalGallery, setShowGoalGallery] = useState<number | null>(null);
	const [showTechGallery, setShowTechGallery] = useState<number | null>(null);
	const [mainImageFromGallery, setMainImageFromGallery] = useState(false);
	const [mainImageId, setMainImageId] = useState<number | null>(null);
	const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);

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
	const [heroDescriptionError, setHeroDescriptionError] = useState<
		string | null
	>(null);
	const [aboutDescriptionError, setAboutDescriptionError] = useState<
		string | null
	>(null);
	const [techDescriptionError, setTechDescriptionError] = useState<
		string | null
	>(null);
	const [servicesDescriptionError, setServicesDescriptionError] = useState<
		string | null
	>(null);
	const [serviceSubDescriptionErrors, setServiceSubDescriptionErrors] =
		useState<Record<number, string | null>>({});

	// Draft management state
	const [draftExists, setDraftExists] = useState(false);
	const [lastDraftSave, setLastDraftSave] = useState<Date | null>(null);
	const [showDraftRecovery, setShowDraftRecovery] = useState(false);
	const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

	const DRAFT_KEY = "project_draft_data";
	const DRAFT_SAVE_INTERVAL = 30000; // 30 seconds

	// Utility function to generate slug
	const generateSlug = (text: string) => {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9 -]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.trim()
			.substring(0, 100);
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
				const response = await projectsDataService.checkSlugAvailability(
					slug,
					"project"
				);
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

	const handleNameChange = (value: string) => {
		setName(value);
		const generatedSlug = generateSlug(value);
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

	// Icon files handler (1-4 images) - matching EditProjectForm
	const handleIconFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);

		if (files.length === 0) {
			setIconFiles([]);
			setIconPreviews([]);
			setIconAltTexts([]);
			return;
		}

		if (files.length > 4) {
			toast.error("You can upload maximum 4 icon images");
			return;
		}

		// Validate each file
		for (const file of files) {
			if (!file.type.startsWith("image/")) {
				toast.error("Please select only image files");
				return;
			}
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Each image size should be less than 5MB");
				return;
			}
		}

		setIconFiles(files);
		setIconAltTexts(new Array(files.length).fill(""));

		// Create preview URLs
		const previews = files.map((file) => URL.createObjectURL(file));
		setIconPreviews(previews);
	};

	// Upload icons function - matching EditProjectForm
	const uploadIcons = async () => {
		if (iconFiles.length === 0) {
			toast.error("No icon files selected");
			return;
		}

		if (
			iconAltTexts.some((alt, idx) => idx < iconFiles.length && !alt.trim())
		) {
			toast.error("Please add alt text for all icons before uploading");
			return;
		}

		setUploadingIcons(true);

		try {
			const { mediaService } = await import("@/services/media");

			// Upload all icons
			const uploadPromises = iconFiles.map((file, i) => {
				return mediaService.uploadMedia({
					image: file,
					alt_text: iconAltTexts[i],
				});
			});

			const uploadedIcons = await Promise.all(uploadPromises);

			// Update icons state with uploaded data
			setIcons(
				uploadedIcons.map((icon) => ({
					id: icon.id,
					image: icon.image,
					alt_text: icon.alt_text,
				}))
			);

			toast.success(`${uploadedIcons.length} icon(s) uploaded successfully!`);
		} catch (error: any) {
			console.error("Error uploading icons:", error);
			toast.error(
				"Failed to upload icons: " + (error.message || "Unknown error")
			);
		} finally {
			setUploadingIcons(false);
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
		if (name.length > 200) {
			toast.error("Project name must be 200 characters or less.");
			return;
		}

		if (slug.length > 100) {
			toast.error("Project slug must be 100 characters or less.");
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

		// Validate challenge description
		if (challengeDescription && challengeDescription.length < 100) {
			toast.error(
				"Challenge description must be at least 100 characters long."
			);
			return;
		}

		// Validate main image
		if (!imageFile && !mainImageId) {
			toast.error("Please upload a main project image.");
			return;
		}

		try {
			// First upload the main image (hero image) or use gallery selection
			let heroImageId = mainImageId; // Use gallery-selected image if available
			if (imageFile && !mainImageFromGallery) {
				const { mediaService } = await import("@/services/media");
				const uploadedHeroImage = await mediaService.uploadMedia({
					image: imageFile,
					alt_text: imageAltText || "",
				});
				heroImageId = uploadedHeroImage.id;
			}

			// Prepare complete JSON payload with ALL data
			const createData: CreateProjectData = {
				// Basic fields
				title: name,
				excerpt: description,
				slug,
				meta_title: metaTitle || undefined,
				meta_description: metaDescription || undefined,
				is_published: isPublished,

				// Hero image (send ID only)
				hero_image: heroImageId || undefined,

				// Icons (send array of icon IDs)
				icons:
					icons.length > 0
						? icons.map((icon) => icon.id).filter((id) => id !== undefined)
						: undefined,

				// Tags (send array of tag IDs)
				tags: selectedTags,

				// Challenge section
				challenge_title: challengeTitle || undefined,
				challenge_description: challengeDescription || undefined,

				// Project Goal section
				project_goal_title: projectGoalTitle || undefined,
				project_goal_content:
					projectGoalContent.length > 0
						? projectGoalContent.map((item) => ({
								goal: item.goal,
								icon: item.icons?.[0]?.url || "",
								alt_text: item.icons?.[0]?.alt_text || "",
						  }))
						: undefined,
				project_goal_section:
					projectGoalSectionIntro || projectGoalSectionItems.length > 0
						? {
								intro: projectGoalSectionIntro,
								items: projectGoalSectionItems,
						  }
						: undefined,

				// Technology section
				technology_title: technologyTitle || undefined,
				technology_description: technologyDescription || undefined,
				technology_content:
					technologyContent.length > 0
						? technologyContent.map((item) => ({
								name: item.name,
								icons: item.icons || [],
						  }))
						: undefined,
			};

			console.log("Creating project with JSON data:", createData);

			await addProject.mutateAsync(createData);

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

			<form
				onSubmit={handleSubmit}
				onKeyDown={(e) => {
					// Prevent Enter key from submitting form when in input fields
					// Allow Enter in textareas for new lines
					if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
						e.preventDefault();
					}
				}}
				className="space-y-6"
			>
				<Tabs defaultValue="basic" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="basic" className="cursor-pointer">
							Basic Info
						</TabsTrigger>
						<TabsTrigger value="challenge" className="cursor-pointer">
							Challenge
						</TabsTrigger>
						<TabsTrigger value="goals" className="cursor-pointer">
							Project Goals
						</TabsTrigger>
						<TabsTrigger value="tech" className="cursor-pointer">
							Technologies
						</TabsTrigger>
					</TabsList>

					<TabsContent value="basic" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Project Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="title">Project Title *</Label>
										<Input
											id="title"
											value={name}
											onChange={(e) => {
												const value = e.target.value;
												if (value.length <= 200) {
													handleNameChange(value);
												}
											}}
											placeholder="Enter project title"
											maxLength={200}
											required
										/>
										<p className="text-xs text-muted-foreground">
											{200 - name.length} characters remaining
										</p>
									</div>
									<div className="space-y-2">
										<Label htmlFor="slug">Project Slug *</Label>
										<div className="relative">
											<Input
												id="slug"
												value={slug}
												onChange={(e) => {
													const value = e.target.value;
													if (value.length <= 100) {
														setSlug(generateSlug(value));
														setSlugCheckMessage("");
														setSlugAvailable(null);
													}
												}}
												placeholder="project-slug"
												maxLength={100}
												required
											/>
											{isCheckingSlug && (
												<div className="absolute right-3 top-1/2 -translate-y-1/2">
													<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
												</div>
											)}
										</div>
										<p className="text-xs text-muted-foreground">
											{100 - slug.length} characters remaining
										</p>
										{slugCheckMessage && (
											<div
												className={`flex items-center gap-1 mt-2 text-sm ${
													slugAvailable ? "text-green-600" : "text-red-600"
												}`}
											>
												{slugAvailable ? (
													<CheckCircle2 className="h-4 w-4" />
												) : (
													<XCircle className="h-4 w-4" />
												)}
												<span>{slugCheckMessage}</span>
											</div>
										)}
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="excerpt">Project Excerpt *</Label>
									<Textarea
										id="excerpt"
										value={description}
										onChange={(e) => {
											const value = e.target.value;
											if (value.length <= 500) {
												setDescription(value);
												if (
													value.trim().length > 0 &&
													value.trim().length < 100
												) {
													setDescriptionError(
														"Project excerpt must be at least 100 characters long."
													);
												} else {
													setDescriptionError(null);
												}
											}
										}}
										placeholder="Enter project excerpt"
										rows={3}
										maxLength={500}
										required
										className={
											descriptionError
												? "border-red-500 focus-visible:ring-red-500"
												: undefined
										}
									/>
									{descriptionError && (
										<p className="text-sm text-red-600 mt-1">
											{descriptionError}
										</p>
									)}
									<p className="text-xs text-muted-foreground">
										{500 - description.length} characters remaining (minimum 100
										required)
									</p>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="metaTitle">Meta Title *</Label>
										<Input
											id="metaTitle"
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
										<p className="text-xs text-muted-foreground">
											{60 - metaTitle.length} characters remaining
										</p>
									</div>
									<div className="space-y-2">
										<Label htmlFor="metaDescription">Meta Description *</Label>
										<Textarea
											id="metaDescription"
											value={metaDescription}
											onChange={(e) => {
												const value = e.target.value;
												if (value.length <= 160) {
													setMetaDescription(value);
												}
											}}
											placeholder="Enter meta description for SEO"
											rows={2}
											maxLength={160}
											required
										/>
										<p className="text-xs text-muted-foreground">
											{160 - metaDescription.length} characters remaining
										</p>
									</div>
								</div>

								<div className="space-y-2">
									<Label>Hero Image *</Label>

									{/* Image Upload Options */}
									<div className="flex flex-wrap gap-2">
										<label className="cursor-pointer">
											<Input
												type="file"
												accept="image/*"
												onChange={(e) => {
													handleMainImageChange(e);
													setMainImageFromGallery(false);
													setMainImageId(null);
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

									{/* Gallery selection preview */}
									{mainImageFromGallery && mainImageId && mainImageUrl && (
										<div className="mt-2 p-2 border rounded bg-green-50 border-green-200">
											<div className="flex items-center gap-2">
												<img
													src={mainImageUrl}
													alt={imageAltText || "Gallery selected image"}
													className="w-16 h-16 object-cover border rounded"
												/>
												<div className="flex-1">
													<div className="flex items-center gap-2 text-sm text-green-600">
														<svg
															className="h-4 w-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M5 13l4 4L19 7"
															/>
														</svg>
														Selected from gallery
													</div>
													<p className="text-xs text-gray-600 mt-1">
														Alt: {imageAltText || "No alt text"}
													</p>
												</div>
											</div>
										</div>
									)}

									{imageFile && !mainImageFromGallery && (
										<div className="mt-2 p-2 border rounded bg-gray-50">
											<div className="flex items-center gap-2">
												<img
													src={getFilePreview(imageFile)}
													alt="Hero image preview"
													className="w-16 h-16 object-cover border rounded"
												/>
												<div className="flex-1">
													<p className="text-sm font-medium">
														{imageFile.name}
													</p>
													<p className="text-xs text-gray-600">
														{(imageFile.size / 1024 / 1024).toFixed(2)} MB
													</p>
												</div>
											</div>
										</div>
									)}

									{/* Media Gallery Modal */}
									<MediaGalleryModal
										open={showMainImageGallery}
										onOpenChange={setShowMainImageGallery}
										onSelect={(media: MediaItem[]) => {
											if (media.length > 0) {
												const selected = media[0];
												setMainImageId(selected.id);
												setImageAltText(selected.alt_text || "");
												setMainImageUrl(selected.image);
												setImageFile(null);
												setMainImageFromGallery(true);
												toast.success("Hero image selected from gallery!");
											}
										}}
										maxSelection={1}
										minSelection={1}
										title="Select Hero Image"
									/>
								</div>

								<div className="flex items-center space-x-2">
									<input
										type="checkbox"
										id="isPublished"
										checked={isPublished}
										onChange={(e) => setIsPublished(e.target.checked)}
										className="rounded"
									/>
									<Label htmlFor="isPublished">Publish immediately</Label>
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
														className="flex items-center gap-1 pr-1"
													>
														<span>{tag.name}</span>
														<button
															type="button"
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																removeTag(tagId);
															}}
															className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
															aria-label={`Remove ${tag.name} tag`}
														>
															<X className="h-3 w-3" />
														</button>
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

						{/* Project Icons */}
						<Card>
							<CardHeader>
								<CardTitle>Project Icons</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Project Icons (1-4 images) */}
								<div className="space-y-2">
									<Label>Project Icons (Optional - 1 to 4 images)</Label>
									<p className="text-xs text-muted-foreground mb-2">
										Upload 1-4 icon images for this project. Each must have alt
										text.
									</p>

									{/* Image Upload Options */}
									<div className="flex flex-wrap gap-2">
										<label className="cursor-pointer">
											<Input
												type="file"
												accept="image/*"
												multiple
												onChange={handleIconFilesChange}
												disabled={uploadingIcons}
												className="hidden"
											/>
											<Button
												type="button"
												variant="outline"
												size="sm"
												disabled={uploadingIcons}
												asChild
											>
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
											onClick={() => setShowIconsGallery(true)}
											disabled={uploadingIcons}
											className="flex items-center gap-2"
										>
											<ImageIcon className="h-4 w-4" />
											Select from Gallery
										</Button>
									</div>

									{/* Media Gallery Modal for Icons */}
									<MediaGalleryModal
										open={showIconsGallery}
										onOpenChange={setShowIconsGallery}
										onSelect={(media: MediaItem[]) => {
											if (media.length > 0) {
												const selectedIcons = media.map((m) => ({
													id: m.id,
													image: m.image,
													alt_text: m.alt_text || "",
												}));
												setIcons(selectedIcons);
												setIconFiles([]);
												setIconPreviews([]);
												setIconAltTexts([]);
												toast.success(
													`${media.length} icon(s) selected from gallery!`
												);
											}
										}}
										maxSelection={4}
										minSelection={1}
										title="Select Project Icons (1-4)"
									/>

									{/* Show existing icons if any */}
									{icons.length > 0 && iconFiles.length === 0 && (
										<div className="mb-3 p-3 border rounded-lg bg-green-50">
											<p className="text-sm text-green-700 font-medium mb-2">
												✓ {icons.length} icon(s) selected
											</p>
											<div className="grid grid-cols-4 gap-2">
												{icons.map((icon, index) => (
													<div key={icon.id} className="relative">
														<img
															src={icon.image}
															alt={icon.alt_text}
															className="w-full h-20 object-cover rounded border"
														/>
														<p className="text-xs text-gray-600 mt-1 truncate">
															{icon.alt_text}
														</p>
													</div>
												))}
											</div>
											<p className="text-xs text-gray-500 mt-2">
												Select new images above to replace
											</p>
										</div>
									)}

									{/* Icon previews with alt text inputs */}
									{iconPreviews.length > 0 && (
										<div className="mt-3 space-y-3">
											<p className="text-sm font-medium text-gray-700">
												{iconPreviews.length} icon(s) selected - Add alt text
												for each:
											</p>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{iconPreviews.map((preview, index) => (
													<div
														key={index}
														className="p-3 border rounded-lg space-y-2 bg-gray-50"
													>
														<div className="flex items-center gap-3">
															<img
																src={preview}
																alt={`Icon ${index + 1} preview`}
																className="w-16 h-16 object-cover rounded border"
															/>
															<div className="flex-1 space-y-1">
																<Label className="text-xs">
																	Icon {index + 1} - Alt Text *
																</Label>
																<Input
																	value={iconAltTexts[index] || ""}
																	onChange={(e) => {
																		if (e.target.value.length <= 100) {
																			const updated = [...iconAltTexts];
																			updated[index] = e.target.value;
																			setIconAltTexts(updated);
																		}
																	}}
																	placeholder={`e.g., ${
																		iconFiles[index]?.name.split(".")[0] ||
																		"icon"
																	}`}
																	maxLength={100}
																	className="text-sm"
																/>
																<p className="text-xs text-muted-foreground">
																	{100 - (iconAltTexts[index]?.length || 0)}{" "}
																	chars left
																</p>
															</div>
														</div>
													</div>
												))}
											</div>

											{/* Upload Icons Button */}
											{iconFiles.length > 0 && icons.length === 0 && (
												<Button
													type="button"
													onClick={uploadIcons}
													disabled={
														uploadingIcons ||
														iconAltTexts.some(
															(alt, idx) =>
																idx < iconFiles.length && !alt.trim()
														)
													}
													className="w-full"
													size="sm"
												>
													{uploadingIcons ? (
														<>
															<div className="h-4 w-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
															Uploading {iconFiles.length} icon(s)...
														</>
													) : (
														<>Upload {iconFiles.length} Icon(s)</>
													)}
												</Button>
											)}

											{/* Success message */}
											{icons.length > 0 && iconFiles.length > 0 && (
												<div className="flex items-center gap-2 text-sm text-green-600 p-2 bg-green-50 rounded">
													<svg
														className="h-5 w-5"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M5 13l4 4L19 7"
														/>
													</svg>
													{icons.length} icon(s) uploaded successfully!
												</div>
											)}
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="challenge" className="space-y-4">
						{/* Challenge Section */}
						<Card>
							<CardHeader>
								<CardTitle>Challenge Section</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="challengeTitle">Challenge Title *</Label>
									<Input
										id="challengeTitle"
										value={challengeTitle}
										onChange={(e) => {
											const value = e.target.value;
											if (value.length <= 200) {
												setChallengeTitle(value);
											}
										}}
										placeholder="e.g., The Challenge We Faced"
										maxLength={200}
										required
									/>
									<p className="text-xs text-muted-foreground">
										{200 - challengeTitle.length} characters remaining
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="challengeDescription">
										Challenge Description *
									</Label>
									<Textarea
										id="challengeDescription"
										value={challengeDescription}
										onChange={(e) => {
											const value = e.target.value;
											if (value.length <= 1000) {
												setChallengeDescription(value);
												// real-time validation
												if (
													value.trim().length > 0 &&
													value.trim().length < 100
												) {
													setChallengeDescriptionError(
														"Challenge description must be at least 100 characters long."
													);
												} else {
													setChallengeDescriptionError(null);
												}
											}
										}}
										placeholder="Describe the main challenge or problem this project addresses"
										rows={4}
										maxLength={1000}
										required
										className={
											challengeDescriptionError
												? "border-red-500 focus-visible:ring-red-500"
												: undefined
										}
									/>
									{challengeDescriptionError && (
										<p className="text-sm text-red-600 mt-1">
											{challengeDescriptionError}
										</p>
									)}
									<p className="text-xs text-muted-foreground">
										{1000 - challengeDescription.length} characters remaining
										(minimum 100 required)
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
						{/* Project Goal Title */}
						<Card>
							<CardHeader>
								<CardTitle>Project Goal Overview</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="projectGoalTitle">Project Goal Title *</Label>
									<Input
										id="projectGoalTitle"
										value={projectGoalTitle}
										onChange={(e) => {
											const value = e.target.value;
											if (value.length <= 200) {
												setProjectGoalTitle(value);
											}
										}}
										placeholder="e.g., Our Project Goals"
										maxLength={200}
										required
									/>
									<p className="text-xs text-muted-foreground">
										{200 - projectGoalTitle.length} characters remaining
									</p>
								</div>

								{/* Project Goal Content (Name & Icon pairs) */}
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<Label>Project Goal Content (Goal & Icon)</Label>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => {
												setProjectGoalContent([
													...projectGoalContent,
													{ goal: "", icons: [] },
												]);
											}}
										>
											<Plus className="h-4 w-4 mr-2" />
											Add Goal
										</Button>
									</div>

									{projectGoalContent.map((item, index) => (
										<div
											key={index}
											className="p-4 border rounded-lg space-y-3"
										>
											<div className="flex justify-between items-center">
												<h4 className="font-medium text-sm">
													Goal #{index + 1}
												</h4>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => {
														setProjectGoalContent(
															projectGoalContent.filter((_, i) => i !== index)
														);
													}}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>

											<div className="space-y-3">
												<div className="space-y-2">
													<Label>Goal Text *</Label>
													<Input
														value={item.goal}
														onChange={(e) => {
															const updated = [...projectGoalContent];
															updated[index] = {
																...updated[index],
																goal: e.target.value,
															};
															setProjectGoalContent(updated);
														}}
														placeholder="e.g., Improve user experience"
														required
													/>
												</div>

												{/* Icon Upload */}
												<div className="space-y-2">
													<Label>Goal Icon *</Label>

													{/* Image Upload Options */}
													<div className="flex flex-wrap gap-2">
														<label className="cursor-pointer">
															<Input
																type="file"
																accept="image/*"
																onChange={(e) => {
																	const file = e.target.files?.[0];
																	if (file) {
																		if (!file.type.startsWith("image/")) return;
																		if (file.size > 5 * 1024 * 1024) return;

																		const updated = [...projectGoalContent];
																		updated[index] = {
																			...updated[index],
																			iconFiles: [file],
																			iconAltTexts: updated[index]
																				.iconAltTexts || [""],
																			uploaded: false,
																			uploading: false,
																		};
																		setProjectGoalContent(updated);
																	}
																}}
																className="hidden"
															/>
															<Button
																type="button"
																variant="outline"
																size="sm"
																asChild
															>
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
															onClick={() => setShowGoalGallery(index)}
															className="flex items-center gap-2"
														>
															<ImageIcon className="h-4 w-4" />
															Select from Gallery
														</Button>
													</div>

													{/* Media Gallery Modal */}
													<MediaGalleryModal
														open={showGoalGallery === index}
														onOpenChange={(open) =>
															setShowGoalGallery(open ? index : null)
														}
														onSelect={(media: MediaItem[]) => {
															if (media.length > 0) {
																const selected = media[0];
																const updated = [...projectGoalContent];
																updated[index] = {
																	...updated[index],
																	icons: [
																		{
																			url: selected.image,
																			alt_text: selected.alt_text || "",
																		},
																	],
																	iconFiles: undefined,
																	iconAltTexts: [selected.alt_text || ""],
																	uploaded: true,
																	uploading: false,
																};
																setProjectGoalContent(updated);
																toast.success(
																	"Goal icon selected from gallery!"
																);
															}
														}}
														maxSelection={1}
														minSelection={1}
														title="Select Goal Icon"
													/>
												</div>

												{/* Alt Text */}
												<div className="space-y-2">
													<Label>Alt Text *</Label>
													<Input
														value={item.iconAltTexts?.[0] || ""}
														onChange={(e) => {
															if (e.target.value.length <= 100) {
																const updated = [...projectGoalContent];
																updated[index] = {
																	...updated[index],
																	iconAltTexts: [e.target.value],
																};
																setProjectGoalContent(updated);
															}
														}}
														placeholder="e.g., User experience improvement icon"
														maxLength={100}
														required
													/>
													<p className="text-xs text-muted-foreground">
														{100 - (item.iconAltTexts?.[0]?.length || 0)} chars
														left
													</p>
												</div>

												{/* File / Uploaded Preview & Upload Button */}
												{(item.iconFiles && item.iconFiles.length > 0) ||
												(item.icons && item.icons.length > 0) ? (
													<div className="mt-2 p-3 border rounded bg-gray-50">
														<div className="flex items-center gap-3">
															<img
																src={
																	item.uploaded &&
																	item.icons &&
																	item.icons.length > 0
																		? item.icons[0].url
																		: item.iconFiles &&
																		  item.iconFiles.length > 0
																		? URL.createObjectURL(item.iconFiles[0])
																		: item.icons && item.icons.length > 0
																		? item.icons[0].url
																		: ""
																}
																alt={
																	item.iconAltTexts?.[0] || "Goal icon preview"
																}
																className="w-16 h-16 object-contain border rounded"
															/>
															<div className="flex-1">
																<p className="text-sm font-medium">
																	{item.iconFiles && item.iconFiles.length > 0
																		? item.iconFiles[0].name
																		: item.uploaded &&
																		  item.icons &&
																		  item.icons.length > 0
																		? "Uploaded icon"
																		: ""}
																</p>
																{item.iconFiles &&
																	item.iconFiles.length > 0 && (
																		<p className="text-xs text-gray-600">
																			{(
																				item.iconFiles[0].size /
																				1024 /
																				1024
																			).toFixed(2)}{" "}
																			MB
																		</p>
																	)}
																{item.uploaded && (
																	<p className="text-xs text-green-600">
																		✓ Uploaded successfully!
																	</p>
																)}
															</div>
															<div className="flex flex-col gap-2">
																<Button
																	type="button"
																	size="sm"
																	onClick={() => uploadGoalIcon(index)}
																	disabled={
																		item.uploading ||
																		item.uploaded ||
																		!item.iconAltTexts?.[0]?.trim() ||
																		!(
																			item.iconFiles &&
																			item.iconFiles.length > 0
																		)
																	}
																	className="w-20"
																>
																	{item.uploading ? (
																		<div className="flex items-center gap-1">
																			<div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
																		</div>
																	) : item.uploaded ? (
																		"✓ Done"
																	) : (
																		"Upload"
																	)}
																</Button>
																{item.uploaded && (
																	<p className="text-xs text-green-600 text-center">
																		Uploaded!
																	</p>
																)}
															</div>
														</div>
													</div>
												) : null}
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Project Goal Details Section */}
						<Card>
							<CardHeader>
								<CardTitle>Project Goal Details Section</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="projectGoalSectionIntro">
										Section Introduction *
									</Label>
									<Textarea
										id="projectGoalSectionIntro"
										value={projectGoalSectionIntro}
										onChange={(e) => {
											const value = e.target.value;
											if (value.length <= 500) {
												setProjectGoalSectionIntro(value);
											}
										}}
										placeholder="Brief introduction to the project goal details"
										rows={3}
										maxLength={500}
										required
									/>
									<p className="text-xs text-muted-foreground">
										{500 - projectGoalSectionIntro.length} characters remaining
									</p>
								</div>

								{/* Project Goal Section Items */}
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<Label>Goal Detail Items</Label>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => {
												setProjectGoalSectionItems([
													...projectGoalSectionItems,
													{
														title: "",
														desc: "",
														points: [],
														bottomDescription: "",
													},
												]);
											}}
										>
											<Plus className="h-4 w-4 mr-2" />
											Add Item
										</Button>
									</div>

									{projectGoalSectionItems.map((item, index) => (
										<div
											key={index}
											className="p-4 border rounded-lg space-y-3"
										>
											<div className="flex justify-between items-center">
												<h4 className="font-medium text-sm">
													Item #{index + 1}
												</h4>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => {
														setProjectGoalSectionItems(
															projectGoalSectionItems.filter(
																(_, i) => i !== index
															)
														);
													}}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>

											<div className="space-y-3">
												<div className="space-y-2">
													<Label>Title *</Label>
													<Input
														value={item.title}
														onChange={(e) => {
															const updated = [...projectGoalSectionItems];
															updated[index] = {
																...updated[index],
																title: e.target.value,
															};
															setProjectGoalSectionItems(updated);
														}}
														placeholder="e.g., Primary Objective"
														required
													/>
												</div>

												<div className="space-y-2">
													<Label>Description *</Label>
													<Textarea
														value={item.desc}
														onChange={(e) => {
															const updated = [...projectGoalSectionItems];
															updated[index] = {
																...updated[index],
																desc: e.target.value,
															};
															setProjectGoalSectionItems(updated);
														}}
														placeholder="Describe this goal detail"
														rows={2}
														required
													/>
												</div>

												{/* Points */}
												<div className="space-y-2">
													<div className="flex justify-between items-center">
														<Label>Points</Label>
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() => {
																const updated = [...projectGoalSectionItems];
																if (!updated[index].points) {
																	updated[index].points = [];
																}
																updated[index].points!.push("");
																setProjectGoalSectionItems(updated);
															}}
														>
															<Plus className="h-4 w-4 mr-2" />
															Add Point
														</Button>
													</div>

													{item.points?.map((point, pointIndex) => (
														<div key={pointIndex} className="flex gap-2">
															<Input
																value={point}
																onChange={(e) => {
																	const updated = [...projectGoalSectionItems];
																	updated[index].points![pointIndex] =
																		e.target.value;
																	setProjectGoalSectionItems(updated);
																}}
																placeholder={`Point ${pointIndex + 1}`}
															/>
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={() => {
																	const updated = [...projectGoalSectionItems];
																	updated[index].points = updated[
																		index
																	].points!.filter((_, i) => i !== pointIndex);
																	setProjectGoalSectionItems(updated);
																}}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													))}
												</div>

												{/* Bottom Description */}
												<div className="space-y-2">
													<Label>Bottom Description</Label>
													<Textarea
														value={item.bottomDescription || ""}
														onChange={(e) => {
															const updated = [...projectGoalSectionItems];
															updated[index] = {
																...updated[index],
																bottomDescription: e.target.value,
															};
															setProjectGoalSectionItems(updated);
														}}
														placeholder="Additional description to display below the points"
														rows={3}
													/>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="tech" className="space-y-4">
						{/* Technology Title */}
						<Card>
							<CardHeader>
								<CardTitle>Technologies Overview</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="technologyTitle">Technology Title *</Label>
									<Input
										id="technologyTitle"
										value={technologyTitle}
										onChange={(e) => setTechnologyTitle(e.target.value)}
										placeholder="e.g., Tech stack"
										maxLength={200}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="technologyDescription">
										Technology Description *
									</Label>
									<Textarea
										id="technologyDescription"
										value={technologyDescription}
										onChange={(e) => setTechnologyDescription(e.target.value)}
										placeholder="e.g., Technologies used in this project"
										rows={3}
										maxLength={500}
										required
									/>
									<p className="text-xs text-muted-foreground">
										{500 - technologyDescription.length} characters remaining
									</p>
								</div>

								{/* Technology Content (Name & Icon pairs) */}
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<Label>Technology Items (Name & Icon)</Label>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => {
												setTechnologyContent([
													...technologyContent,
													{ name: "", icons: [] },
												]);
											}}
										>
											<Plus className="h-4 w-4 mr-2" />
											Add Technology
										</Button>
									</div>

									{technologyContent.map((item, index) => (
										<div
											key={index}
											className="p-4 border rounded-lg space-y-3"
										>
											<div className="flex justify-between items-center">
												<h4 className="font-medium text-sm">
													Technology #{index + 1}
												</h4>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => {
														setTechnologyContent(
															technologyContent.filter((_, i) => i !== index)
														);
													}}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>

											<div className="space-y-3">
												<div className="space-y-2">
													<Label>Technology Name *</Label>
													<Input
														value={item.name}
														onChange={(e) => {
															const updated = [...technologyContent];
															updated[index] = {
																...updated[index],
																name: e.target.value,
															};
															setTechnologyContent(updated);
														}}
														placeholder="e.g., Django"
														required
													/>
												</div>

												{/* Icon Upload (1-4 images) */}
												<div className="space-y-2">
													<Label>Technology Icon(s) * (1-4 images)</Label>

													{/* Image Upload Options */}
													<div className="flex flex-wrap gap-2">
														<label className="cursor-pointer">
															<Input
																type="file"
																accept="image/*"
																multiple
																onChange={(e) => {
																	const files = Array.from(
																		e.target.files || []
																	);
																	if (files.length === 0) return;

																	if (files.length > 4) {
																		toast.error(
																			"You can upload maximum 4 images per technology"
																		);
																		return;
																	}

																	for (const file of files) {
																		if (!file.type.startsWith("image/")) {
																			toast.error(
																				"Please select only image files"
																			);
																			return;
																		}
																		if (file.size > 5 * 1024 * 1024) {
																			toast.error(
																				"Each image size should be less than 5MB"
																			);
																			return;
																		}
																	}

																	const updated = [...technologyContent];
																	updated[index] = {
																		...updated[index],
																		iconFiles: files,
																		iconAltTexts: new Array(files.length).fill(
																			""
																		),
																		icons: files.map((file) => ({
																			url: URL.createObjectURL(file),
																			alt_text: "",
																		})),
																		uploaded: false,
																		uploading: false,
																	};
																	setTechnologyContent(updated);
																}}
																className="hidden"
															/>
															<Button
																type="button"
																variant="outline"
																size="sm"
																asChild
															>
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
															onClick={() => setShowTechGallery(index)}
															className="flex items-center gap-2"
														>
															<ImageIcon className="h-4 w-4" />
															Select from Gallery
														</Button>
													</div>

													{/* Media Gallery Modal */}
													<MediaGalleryModal
														open={showTechGallery === index}
														onOpenChange={(open) =>
															setShowTechGallery(open ? index : null)
														}
														onSelect={(media: MediaItem[]) => {
															if (media.length > 0) {
																const updated = [...technologyContent];
																updated[index] = {
																	...updated[index],
																	icons: media.map((m) => ({
																		url: m.image,
																		alt_text: m.alt_text || "",
																	})),
																	iconFiles: undefined,
																	iconAltTexts: media.map(
																		(m) => m.alt_text || ""
																	),
																	uploaded: true,
																	uploading: false,
																};
																setTechnologyContent(updated);
																toast.success(
																	`${media.length} technology icon(s) selected from gallery!`
																);
															}
														}}
														maxSelection={4}
														minSelection={1}
														title="Select Technology Icons (1-4)"
													/>

													<p className="text-xs text-muted-foreground">
														Select 1-4 images for this technology
													</p>
												</div>

												{/* Alt Text for each image */}
												{item.iconFiles && item.iconFiles.length > 0 && (
													<div className="space-y-3">
														<Label>Alt Text for each image *</Label>
														{item.iconFiles.map((file, imgIndex) => (
															<div key={imgIndex} className="space-y-2">
																<Label className="text-xs">
																	Alt Text for Image {imgIndex + 1} *
																</Label>
																<Input
																	value={item.iconAltTexts?.[imgIndex] || ""}
																	onChange={(e) => {
																		if (e.target.value.length <= 100) {
																			const updated = [...technologyContent];
																			if (!updated[index].iconAltTexts) {
																				updated[index].iconAltTexts = [];
																			}
																			updated[index].iconAltTexts![imgIndex] =
																				e.target.value;

																			// Also update preview icons alt text
																			if (updated[index].icons[imgIndex]) {
																				updated[index].icons[
																					imgIndex
																				].alt_text = e.target.value;
																			}

																			setTechnologyContent(updated);
																		}
																	}}
																	placeholder={`e.g., ${item.name} logo ${
																		imgIndex + 1
																	}`}
																	maxLength={100}
																	required
																/>
																<p className="text-xs text-muted-foreground">
																	{100 -
																		(item.iconAltTexts?.[imgIndex]?.length ||
																			0)}{" "}
																	chars left
																</p>
															</div>
														))}
													</div>
												)}

												{/* Icon Preview and Upload */}
												{item.icons && item.icons.length > 0 && (
													<div className="mt-2 space-y-2">
														<Label className="text-xs text-muted-foreground">
															Preview:
														</Label>
														<div className="p-2 border rounded bg-gray-50">
															<div className="grid grid-cols-2 gap-2 mb-2">
																{item.icons.map((iconObj, imgIndex) => (
																	<div key={imgIndex} className="text-center">
																		<img
																			src={iconObj.url}
																			alt={
																				iconObj.alt_text ||
																				`Technology icon ${imgIndex + 1}`
																			}
																			className="w-12 h-12 object-contain border rounded mx-auto"
																		/>
																		<p className="text-xs text-gray-500 mt-1 truncate">
																			{iconObj.alt_text ||
																				`Image ${imgIndex + 1}`}
																		</p>
																	</div>
																))}
															</div>
															<div className="text-xs text-gray-600">
																{item.iconFiles && !item.uploaded && (
																	<p className="text-blue-600">
																		Ready to upload: {item.iconFiles.length}{" "}
																		image(s)
																	</p>
																)}
																{item.uploaded && (
																	<p className="text-green-600">
																		✓ Uploaded successfully!
																	</p>
																)}
															</div>

															{/* Upload Button */}
															{item.iconFiles && !item.uploaded && (
																<Button
																	type="button"
																	onClick={() => uploadTechIcon(index)}
																	disabled={
																		!item.iconAltTexts?.every((alt) =>
																			alt?.trim()
																		) || item.uploading
																	}
																	size="sm"
																	className="w-full mt-2"
																>
																	{item.uploading ? (
																		<>
																			<div className="h-4 w-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
																			Uploading...
																		</>
																	) : (
																		"Upload Icons"
																	)}
																</Button>
															)}
														</div>
													</div>
												)}
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
											if (
												value.trim().length > 0 &&
												value.trim().length < 100
											) {
												setServicesDescriptionError(
													"Services section description must be at least 100 characters long."
												);
											} else {
												setServicesDescriptionError(null);
											}
										}}
										placeholder="Enter services section description"
										rows={3}
										className={
											servicesDescriptionError
												? "border-red-500 focus-visible:ring-red-500"
												: undefined
										}
									/>
									{servicesDescriptionError && (
										<p className="text-sm text-red-600 mt-1">
											{servicesDescriptionError}
										</p>
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
																[serviceIndex]:
																	value.trim().length > 0 &&
																	value.trim().length < 100
																		? `Services section sub-section ${
																				serviceIndex + 1
																		  } description must be at least 100 characters long.`
																		: null,
															}));
														}}
														placeholder="Enter service description"
														rows={3}
														className={
															serviceSubDescriptionErrors[serviceIndex]
																? "border-red-500 focus-visible:ring-red-500"
																: undefined
														}
													/>
													{serviceSubDescriptionErrors[serviceIndex] && (
														<p className="text-sm text-red-600 mt-1">
															{serviceSubDescriptionErrors[serviceIndex]}
														</p>
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
