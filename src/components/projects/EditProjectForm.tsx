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
import {
	X,
	Plus,
	Trash2,
	Loader2,
	ImageIcon,
	Upload,
	CheckCircle2,
	XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { MediaGalleryModal } from "@/components/media/MediaGalleryModal";
import type { MediaItem } from "@/services/media";
import type { Project, Tag } from "@/types/types";
import { useProjects } from "@/hooks/useProjects";
import { useTags } from "@/hooks/useTags";
import { getImageUrl } from "@/lib/utils";
import { projectsDataService } from "@/services/projects";

interface ProjectGoalContentItem {
	goal: string;
	icon: string; // Image URL (preview or uploaded URL)
	alt_text: string;
	iconFile?: File; // File for upload
	uploading?: boolean; // Upload in progress
	uploaded?: boolean; // Already uploaded to media API
}

interface ProjectGoalSectionItem {
	title: string;
	desc: string;
	points?: string[]; // Array of points
	bottomDescription?: string; // Description displayed
}

interface TechnologyContentItem {
	name: string;
	icons: { url: string; alt_text: string }[]; // Array of icon objects with separate alt texts
	iconFiles?: File[]; // Multiple files for upload
	iconAltTexts?: string[]; // Alt texts for each file during upload
	uploading?: boolean; // Upload in progress
	uploaded?: boolean; // Already uploaded to media API
}

interface TechnologySectionData {
	backend: string[];
	frontend: string[];
	image?: string;
	image_alt_text?: string;
}

interface IconItem {
	id?: number;
	image: string;
	alt_text: string;
}

interface EditProjectFormProps {
	project: Project | null;
	onCancel?: () => void;
	onSaved?: () => void;
}

export function EditProjectForm({
	project,
	onCancel,
	onSaved,
}: EditProjectFormProps) {
	const { editProject } = useProjects(1, 8, false); // Disable list fetch, only need mutation
	const { getTags } = useTags();

	// Basic project fields
	const [title, setTitle] = useState("");
	const [excerpt, setExcerpt] = useState(""); // This is description field in UI
	const [slug, setSlug] = useState("");
	const [metaTitle, setMetaTitle] = useState("");
	const [metaDescription, setMetaDescription] = useState("");
	const [selectedTags, setSelectedTags] = useState<number[]>([]);
	const [isPublished, setIsPublished] = useState(false);

	// Slug validation state
	const [originalSlug, setOriginalSlug] = useState<string>("");
	const [slugCheckMessage, setSlugCheckMessage] = useState<string>("");
	const [isCheckingSlug, setIsCheckingSlug] = useState(false);
	const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

	// Hero image (main project image)
	const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
	const [heroImageId, setHeroImageId] = useState<number | null>(null);
	const [heroImageAltText, setHeroImageAltText] = useState<string>("");
	const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
	const [uploadingHeroImage, setUploadingHeroImage] = useState(false);

	// Icons array (1-4 images max)
	const [icons, setIcons] = useState<IconItem[]>([]);
	const [iconFiles, setIconFiles] = useState<File[]>([]);
	const [iconAltTexts, setIconAltTexts] = useState<string[]>([]);
	const [iconPreviews, setIconPreviews] = useState<string[]>([]);
	const [uploadingIcons, setUploadingIcons] = useState(false);

	// Challenge section (replaces hero section)
	const [challengeTitle, setChallengeTitle] = useState("");
	const [challengeDescription, setChallengeDescription] = useState("");

	// Project Goal section
	const [projectGoalTitle, setProjectGoalTitle] = useState("");
	const [projectGoalContent, setProjectGoalContent] = useState<
		ProjectGoalContentItem[]
	>([]);
	const [projectGoalSectionIntro, setProjectGoalSectionIntro] = useState("");
	const [projectGoalSectionItems, setProjectGoalSectionItems] = useState<
		ProjectGoalSectionItem[]
	>([]);

	// Technology section
	const [technologyTitle, setTechnologyTitle] = useState("");
	const [technologyDescription, setTechnologyDescription] = useState("");
	const [technologyContent, setTechnologyContent] = useState<
		TechnologyContentItem[]
	>([]);

	// Technology bulk upload states
	const [techFiles, setTechFiles] = useState<File[]>([]);
	const [techAltTexts, setTechAltTexts] = useState<string[]>([]);
	const [techPreviews, setTechPreviews] = useState<string[]>([]);
	const [uploadingTech, setUploadingTech] = useState(false);

	// Real-time validation state for sections
	const [descriptionError, setDescriptionError] = useState<string | null>(null);
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

	// Media gallery modal states
	const [showHeroGallery, setShowHeroGallery] = useState(false);
	const [showIconsGallery, setShowIconsGallery] = useState(false);
	const [showGoalGallery, setShowGoalGallery] = useState<number | null>(null);
	const [showTechGallery, setShowTechGallery] = useState<number | null>(null);
	const [heroFromGallery, setHeroFromGallery] = useState(false);

	const { data: tagsResponse } = getTags;
	const tags = tagsResponse?.results;

	// Load project data when component mounts
	useEffect(() => {
		if (project) {
			const projectData = project as any;

			// Basic fields
			setTitle(projectData.title || "");
			setExcerpt(projectData.excerpt || "");
			setSlug(projectData.slug || "");
			setMetaTitle(projectData.meta_title || "");
			setMetaDescription(projectData.meta_description || "");
			setIsPublished(projectData.is_published || false);

			// Load hero image
			if (projectData.hero_image) {
				setHeroImagePreview(projectData.hero_image.image);
				setHeroImageAltText(projectData.hero_image.alt_text || "");
				setHeroImageId(projectData.hero_image.id);
			}

			// Load tags - convert tag names to IDs
			if (
				projectData.tags &&
				Array.isArray(projectData.tags) &&
				tagsResponse?.results
			) {
				const tagIds = projectData.tags
					.map((tagName: string) => {
						const tag = tagsResponse.results.find(
							(t: Tag) => t.name === tagName
						);
						return tag?.id;
					})
					.filter((id: any): id is number => id !== undefined);
				setSelectedTags(tagIds);
			}

			// Load icons
			if (projectData.icons && Array.isArray(projectData.icons)) {
				setIcons(projectData.icons);
			}

			// Load challenge section
			setChallengeTitle(projectData.challenge_title || "");
			setChallengeDescription(projectData.challenge_description || "");

			// Load project goal section
			setProjectGoalTitle(projectData.project_goal_title || "");
			setProjectGoalContent(projectData.project_goal_content || []);
			if (projectData.project_goal_section) {
				setProjectGoalSectionIntro(
					projectData.project_goal_section.intro || ""
				);
				setProjectGoalSectionItems(
					projectData.project_goal_section.items || []
				);
			}

			// Load technology section
			setTechnologyTitle(projectData.technology_title || "");
			setTechnologyContent(projectData.technology_content || []);
			setTechnologyDescription(projectData.technology_description || "");

			// Store original slug for validation
			setOriginalSlug(projectData.slug || "");
		}
	}, [project, tagsResponse]);

	// Image upload handlers
	const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith("image/")) {
				toast.error("Please select a valid image file");
				return;
			}

			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Image size should be less than 5MB");
				return;
			}

			setHeroImageFile(file);
			setHeroImagePreview(URL.createObjectURL(file));
			setHeroImageAltText("");
			setHeroImageId(null); // Reset until uploaded

			toast.info("Please add alt text before uploading the image", {
				duration: 4000,
			});
		}
	};

	const uploadHeroImage = async () => {
		if (!heroImageFile) return;

		if (!heroImageAltText.trim()) {
			toast.error("Please add alt text before uploading the image");
			return;
		}

		setUploadingHeroImage(true);

		try {
			const { mediaService } = await import("@/services/media");
			const uploadedMedia = await mediaService.uploadMedia({
				image: heroImageFile,
				alt_text: heroImageAltText,
			});

			setHeroImageId(uploadedMedia.id);
			toast.success("Hero image uploaded successfully!");
		} catch (error: any) {
			console.error("Error uploading hero image:", error);
			toast.error(
				"Failed to upload image: " + (error.message || "Unknown error")
			);
			setHeroImageId(null);
		} finally {
			setUploadingHeroImage(false);
		}
	};

	// Auto-generate slug from title
	const generateSlug = (text: string): string => {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "") // Remove special characters
			.replace(/\s+/g, "-") // Replace spaces with hyphens
			.replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
			.replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
	};

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTitle = e.target.value;
		setTitle(newTitle);
		// Auto-generate slug
		setSlug(generateSlug(newTitle));
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
	}, [slug, originalSlug]);

	// Icon upload handlers (bulk upload 1-4 images)
	const handleIconFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);

		if (files.length === 0) return;

		if (files.length > 4) {
			toast.error("You can upload maximum 4 icons");
			return;
		}

		// Validate all files
		for (const file of files) {
			if (!file.type.startsWith("image/")) {
				toast.error("All files must be valid images");
				return;
			}
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Each image must be less than 5MB");
				return;
			}
		}

		setIconFiles(files);
		setIconAltTexts(new Array(files.length).fill(""));
		setIconPreviews(files.map((file) => URL.createObjectURL(file)));
		setIcons([]); // Clear existing uploaded icons

		toast.info(
			`${files.length} icon(s) selected. Please add alt text for each image.`,
			{ duration: 4000 }
		);
	};

	const uploadIcons = async () => {
		if (iconFiles.length === 0) {
			toast.error("Please select at least one icon image");
			return;
		}

		// Validate all alt texts are filled
		const emptyAltTexts = iconAltTexts.some(
			(alt, index) => index < iconFiles.length && !alt.trim()
		);
		if (emptyAltTexts) {
			toast.error("Please add alt text for all icons");
			return;
		}

		setUploadingIcons(true);

		try {
			const { mediaService } = await import("@/services/media");
			const uploadedIcons = await mediaService.bulkUploadMedia(
				iconFiles,
				iconAltTexts.slice(0, iconFiles.length)
			);

			setIcons(uploadedIcons);
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

	// Upload individual goal content icon
	const uploadGoalIcon = async (index: number) => {
		const item = projectGoalContent[index];

		if (!item.iconFile) {
			toast.error("No image file selected");
			return;
		}

		if (!item.alt_text.trim()) {
			toast.error("Please add alt text before uploading the image");
			return;
		}

		// Set uploading state
		const updatedUploading = [...projectGoalContent];
		updatedUploading[index] = { ...updatedUploading[index], uploading: true };
		setProjectGoalContent(updatedUploading);

		try {
			const { mediaService } = await import("@/services/media");
			const uploadedIcon = await mediaService.uploadMedia({
				image: item.iconFile,
				alt_text: item.alt_text,
			});

			// Update with uploaded URL and mark as uploaded (fresh copy from state)
			setProjectGoalContent((prev) => {
				const updated = [...prev];
				updated[index] = {
					...prev[index],
					icon: uploadedIcon.image,
					iconFile: undefined,
					uploading: false,
					uploaded: true,
				};
				return updated;
			});

			toast.success(`Goal icon uploaded successfully!`);
		} catch (error: any) {
			console.error("Error uploading goal icon:", error);
			toast.error(
				"Failed to upload icon: " + (error.message || "Unknown error")
			);

			// Reset uploading state on error
			setProjectGoalContent((prev) => {
				const updated = [...prev];
				updated[index] = { ...prev[index], uploading: false };
				return updated;
			});
		}
	};

	// Technology bulk upload handlers
	const handleTechFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);

		if (files.length === 0) return;

		if (files.length > 4) {
			toast.error("You can upload maximum 4 technology images");
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

		setTechFiles(files);
		setTechAltTexts(new Array(files.length).fill(""));
		setTechPreviews(files.map((file) => URL.createObjectURL(file)));
		setTechnologyContent([]); // Clear existing uploaded tech items

		toast.info(
			`${files.length} technology image(s) selected. Please add names and alt text for each.`,
			{ duration: 4000 }
		);
	};

	const uploadTechImages = async () => {
		if (techFiles.length === 0) {
			toast.error("No files selected");
			return;
		}

		// Validate all alt texts are filled
		for (let i = 0; i < techFiles.length; i++) {
			if (!techAltTexts[i]?.trim()) {
				toast.error(`Please add alt text for image ${i + 1}`);
				return;
			}
		}

		setUploadingTech(true);

		try {
			const { mediaService } = await import("@/services/media");
			const uploadedImages = await mediaService.bulkUploadMedia(
				techFiles,
				techAltTexts.slice(0, techFiles.length)
			);

			// Convert uploaded images to technology content items with default names
			const newTechContent = uploadedImages.map((uploadedImage, index) => ({
				name: `Technology ${index + 1}`, // Default name, user can edit
				icons: [{ url: uploadedImage.image, alt_text: uploadedImage.alt_text }], // Array format
				uploaded: true,
			}));

			setTechnologyContent(newTechContent);
			toast.success(
				`${uploadedImages.length} technology image(s) uploaded successfully!`
			);

			// Clear upload states
			setTechFiles([]);
			setTechAltTexts([]);
			setTechPreviews([]);
		} catch (error: any) {
			console.error("Error uploading technology images:", error);
			toast.error(
				"Failed to upload technology images: " +
					(error.message || "Unknown error")
			);
		} finally {
			setUploadingTech(false);
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

			// Upload all images for this technology using bulk upload
			const uploadedImages = await mediaService.bulkUploadMedia(
				item.iconFiles,
				item.iconAltTexts
			);

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

	// Helper functions for managing points in project goal section items
	const addPoint = (itemIndex: number) => {
		const updated = [...projectGoalSectionItems];
		if (!updated[itemIndex].points) {
			updated[itemIndex].points = [];
		}
		updated[itemIndex].points!.push("");
		setProjectGoalSectionItems(updated);
	};

	const updatePoint = (
		itemIndex: number,
		pointIndex: number,
		value: string
	) => {
		const updated = [...projectGoalSectionItems];
		if (!updated[itemIndex].points) {
			updated[itemIndex].points = [];
		}
		updated[itemIndex].points![pointIndex] = value;
		setProjectGoalSectionItems(updated);
	};

	const removePoint = (itemIndex: number, pointIndex: number) => {
		const updated = [...projectGoalSectionItems];
		if (updated[itemIndex].points) {
			updated[itemIndex].points!.splice(pointIndex, 1);
			setProjectGoalSectionItems(updated);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!project) {
			toast.error("No project data available.");
			return;
		}

		// Validation
		if (!title || !excerpt) {
			toast.error("Please fill all required fields.");
			return;
		}

		if (excerpt.length < 100) {
			toast.error("Project description must be at least 100 characters long.");
			return;
		}

		if (!heroImageId) {
			toast.error("Please upload a hero image.");
			return;
		}

		try {
			// Prepare complete JSON payload with ALL data
			const updateData = {
				// Basic fields
				title,
				excerpt,
				slug,
				meta_title: metaTitle,
				meta_description: metaDescription,
				is_published: isPublished,

				// Hero image (send ID only)
				hero_image: heroImageId,

				// Icons (send only IDs array)
				icons: icons
					.map((icon) => icon.id)
					.filter((id): id is number => id !== undefined),

				// Tags (send array of tag IDs)
				tags: selectedTags,

				// Challenge section
				challenge_title: challengeTitle,
				challenge_description: challengeDescription,

				// Project Goal section
				project_goal_title: projectGoalTitle,
				project_goal_content: projectGoalContent.map((item) => ({
					goal: item.goal,
					icon: item.icon,
					alt_text: item.alt_text,
				})),
				project_goal_section: {
					intro: projectGoalSectionIntro,
					items: projectGoalSectionItems,
				},

				// Technology section
				technology_title: technologyTitle,
				technology_description: technologyDescription,
				technology_content: technologyContent.map((item) => ({
					name: item.name,
					icons: item.icons, // Array of {url, alt_text} objects
				})),
			};

			console.log(
				"DEBUG - Icons being sent:",
				icons
					.map((icon) => icon.id)
					.filter((id): id is number => id !== undefined)
			);
			console.log("Updating project with JSON data:", updateData);

			await editProject.mutateAsync({
				id: project.id.toString(),
				data: updateData,
			});

			toast.success("Project updated successfully!");
			onSaved?.();
		} catch (error: any) {
			console.error("Error updating project:", error);
			toast.error(error?.response?.data?.message || "Failed to update project");
		}
	};

	return (
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
							{/* Title and Slug */}
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="title">Project Title *</Label>
									<Input
										id="title"
										value={title}
										onChange={handleTitleChange}
										placeholder="Enter project title"
										required
									/>
									<p className="text-xs text-muted-foreground">
										Slug will be auto-generated from title
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="slug">Slug *</Label>
									<div className="relative">
										<Input
											id="slug"
											value={slug}
											onChange={(e) => {
												setSlug(generateSlug(e.target.value));
												setSlugCheckMessage("");
												setSlugAvailable(null);
											}}
											placeholder="project-slug"
											required
										/>
										{isCheckingSlug && (
											<div className="absolute right-3 top-1/2 -translate-y-1/2">
												<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
											</div>
										)}
									</div>
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

							{/* Excerpt (Description) */}
							<div className="space-y-2">
								<Label htmlFor="excerpt">Project Excerpt *</Label>
								<Textarea
									id="excerpt"
									value={excerpt}
									onChange={(e) => {
										const value = e.target.value;
										if (value.length <= 2000) {
											setExcerpt(value);
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
									placeholder="Enter project excerpt/description"
									rows={4}
									maxLength={2000}
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
								<p className="text-sm text-muted-foreground mt-1">
									{excerpt.length}/2000 characters (minimum 100 required)
								</p>
							</div>

							{/* Meta Title and Description */}
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="metaTitle">Meta Title</Label>
									<Input
										id="metaTitle"
										value={metaTitle}
										onChange={(e) => setMetaTitle(e.target.value)}
										placeholder="SEO meta title"
										maxLength={60}
									/>
									<p className="text-xs text-muted-foreground">
										{60 - metaTitle.length} characters remaining
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="metaDescription">Meta Description</Label>
									<Input
										id="metaDescription"
										value={metaDescription}
										onChange={(e) => setMetaDescription(e.target.value)}
										placeholder="SEO meta description"
										maxLength={160}
									/>
									<p className="text-xs text-muted-foreground">
										{160 - metaDescription.length} characters remaining
									</p>
								</div>
							</div>

							{/* Hero Image */}
							<div className="space-y-2">
								<Label>Hero Image *</Label>

								{/* Image Upload Options */}
								<div className="flex flex-wrap gap-2">
									<label className="cursor-pointer">
										<Input
											type="file"
											accept="image/*"
											onChange={(e) => {
												handleHeroImageChange(e);
												setHeroFromGallery(false);
											}}
											disabled={uploadingHeroImage}
											className="hidden"
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											disabled={uploadingHeroImage}
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
										onClick={() => setShowHeroGallery(true)}
										disabled={uploadingHeroImage}
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
											setHeroImageAltText(selected.alt_text || "");
											setHeroImagePreview(selected.image);
											setHeroImageFile(null);
											setHeroFromGallery(true);
											toast.success("Hero image selected from gallery!");
										}
									}}
									maxSelection={1}
									minSelection={1}
									title="Select Hero Image"
								/>

								{/* Image Preview */}
								{heroImagePreview && (
									<div className="relative w-full h-48 border rounded-md overflow-hidden">
										<img
											src={heroImagePreview}
											alt="Hero preview"
											className="w-full h-full object-cover"
										/>
										{heroFromGallery && (
											<div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-sm text-center py-1">
												Selected from Gallery
											</div>
										)}
									</div>
								)}

								{/* Alt Text and Upload - only for file uploads */}
								{heroImagePreview && !heroFromGallery && (
									<div className="space-y-3">
										<div>
											<Label htmlFor="heroImageAlt">Image Alt Text *</Label>
											<Input
												id="heroImageAlt"
												value={heroImageAltText}
												onChange={(e) => {
													if (e.target.value.length <= 255) {
														setHeroImageAltText(e.target.value);
													}
												}}
												placeholder="Alt text for hero image"
												maxLength={255}
												disabled={
													uploadingHeroImage ||
													(!!heroImageId && !heroImageFile)
												}
											/>
											<p className="text-xs text-muted-foreground mt-1">
												{255 - heroImageAltText.length} characters remaining
											</p>
										</div>

										{/* Upload Button */}
										{heroImageFile && !heroImageId ? (
											<Button
												type="button"
												onClick={uploadHeroImage}
												disabled={
													!heroImageAltText.trim() || uploadingHeroImage
												}
												size="sm"
												className="w-full"
											>
												{uploadingHeroImage ? (
													<>
														<Loader2 className="h-4 w-4 mr-2 animate-spin" />
														Uploading...
													</>
												) : (
													"Upload Image"
												)}
											</Button>
										) : heroImageId ? (
											<div className="flex items-center gap-2 text-sm text-green-600">
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
												{heroImageFile
													? "New image uploaded successfully!"
													: "Image already uploaded"}
											</div>
										) : null}
									</div>
								)}

								{/* Success message for gallery selections */}
								{heroFromGallery && heroImageId && (
									<div className="flex items-center gap-2 text-sm text-green-600">
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
										Image selected from gallery (Alt:{" "}
										{heroImageAltText || "No alt text"})
									</div>
								)}
							</div>

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
											{iconPreviews.length} icon(s) selected - Add alt text for
											each:
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
																	iconFiles[index]?.name.split(".")[0] || "icon"
																}`}
																maxLength={100}
																className="text-sm"
															/>
															<p className="text-xs text-muted-foreground">
																{100 - (iconAltTexts[index]?.length || 0)} chars
																left
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
														(alt, idx) => idx < iconFiles.length && !alt.trim()
													)
												}
												className="w-full"
												size="sm"
											>
												{uploadingIcons ? (
													<>
														<Loader2 className="h-4 w-4 mr-2 animate-spin" />
														Uploading {iconFiles.length} icon(s)...
													</>
												) : (
													<>
														<Upload className="h-4 w-4 mr-2" />
														Upload {iconFiles.length} Icon(s)
													</>
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

							{/* Tags */}
							<div className="space-y-2">
								<Label>Tags *</Label>
								<div className="flex flex-wrap gap-2">
									{(tags || []).map((tag: Tag) => (
										<Badge
											key={tag.id}
											variant={
												selectedTags.includes(tag.id) ? "default" : "outline"
											}
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
								{tags && tags.length === 0 && (
									<p className="text-sm text-muted-foreground">
										No tags available. Please create tags first.
									</p>
								)}
							</div>

							{/* Published Toggle */}
							<div className="flex items-center gap-2">
								<Switch
									id="published"
									checked={isPublished}
									onCheckedChange={setIsPublished}
								/>
								<Label htmlFor="published" className="cursor-pointer">
									{isPublished ? "Published" : "Draft"}
								</Label>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Challenge Section */}
				<TabsContent value="challenge" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Challenge Section</CardTitle>
							<p className="text-sm text-muted-foreground">
								Describe the main challenge or problem that this project
								addressed
							</p>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="challengeTitle">Challenge Title *</Label>
								<Input
									id="challengeTitle"
									value={challengeTitle}
									onChange={(e) => {
										if (e.target.value.length <= 200) {
											setChallengeTitle(e.target.value);
										}
									}}
									placeholder="e.g., Legacy checkout flow"
									maxLength={200}
								/>
								<p className="text-sm text-muted-foreground">
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
										if (e.target.value.length <= 1000) {
											setChallengeDescription(e.target.value);
											if (
												e.target.value.trim().length > 0 &&
												e.target.value.trim().length < 100
											) {
												setHeroDescriptionError(
													"Challenge description must be at least 100 characters long."
												);
											} else {
												setHeroDescriptionError(null);
											}
										}
									}}
									placeholder="Describe the challenge in detail..."
									rows={5}
									maxLength={1000}
									className={
										heroDescriptionError
											? "border-red-500 focus-visible:ring-red-500"
											: undefined
									}
								/>
								{heroDescriptionError && (
									<p className="text-sm text-red-600 mt-1">
										{heroDescriptionError}
									</p>
								)}
								<p className="text-sm text-muted-foreground">
									{challengeDescription.length}/1000 characters (minimum 100
									required)
								</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="goals" className="space-y-4">
					{/* Project Goal Title */}
					<Card>
						<CardHeader>
							<CardTitle>Project Goal Overview</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="projectGoalTitle">Goal Title *</Label>
								<Input
									id="projectGoalTitle"
									value={projectGoalTitle}
									onChange={(e) => setProjectGoalTitle(e.target.value)}
									placeholder="e.g., Improve conversions"
									maxLength={200}
								/>
							</div>

							{/* Project Goal Content (Goal with Icon) */}
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<Label>Goal Content (Goal with Icon)</Label>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											setProjectGoalContent([
												...projectGoalContent,
												{ goal: "", icon: "", alt_text: "" },
											]);
										}}
									>
										<Plus className="h-4 w-4 mr-2" />
										Add Goal
									</Button>
								</div>

								{projectGoalContent.map((item, index) => (
									<div key={index} className="p-4 border rounded-lg space-y-3">
										<div className="flex justify-between items-center">
											<h4 className="font-medium text-sm">Goal #{index + 1}</h4>
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
												<Label>Goal *</Label>
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
													placeholder="e.g., Reduce cart abandonment"
													required
												/>
											</div>

											{/* Icon Upload */}
											<div className="space-y-2">
												<Label>Icon Image *</Label>
												<div className="flex flex-wrap gap-2">
													<label className="cursor-pointer">
														<Input
															type="file"
															accept="image/*"
															onChange={(e) => {
																const file = e.target.files?.[0];
																if (file) {
																	// Validate file
																	if (!file.type.startsWith("image/")) {
																		toast.error(
																			"Please select a valid image file"
																		);
																		return;
																	}
																	if (file.size > 5 * 1024 * 1024) {
																		toast.error(
																			"Image size should be less than 5MB"
																		);
																		return;
																	}

																	// Update state with file and preview
																	const updated = [...projectGoalContent];
																	updated[index] = {
																		...updated[index],
																		icon: URL.createObjectURL(file),
																		iconFile: file, // Store file for upload
																		uploaded: false, // Reset uploaded state
																		uploading: false, // Reset uploading state
																	};
																	setProjectGoalContent(updated);
																}
															}}
															disabled={item.uploading}
															className="hidden"
														/>
														<Button
															type="button"
															variant="outline"
															size="sm"
															disabled={item.uploading}
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
														disabled={item.uploading}
														className="flex items-center gap-2"
													>
														<ImageIcon className="h-4 w-4" />
														Select from Gallery
													</Button>
												</div>
											</div>

											{/* Alt Text */}
											<div className="space-y-2">
												<Label>Alt Text *</Label>
												<Input
													value={item.alt_text}
													onChange={(e) => {
														if (e.target.value.length <= 100) {
															const updated = [...projectGoalContent];
															updated[index] = {
																...updated[index],
																alt_text: e.target.value,
															};
															setProjectGoalContent(updated);
														}
													}}
													placeholder="e.g., Shopping cart icon"
													maxLength={100}
													required
												/>
												<p className="text-xs text-muted-foreground">
													{100 - (item.alt_text?.length || 0)} chars left
												</p>
											</div>

											{/* Icon Preview and Upload */}
											{item.icon && (
												<div className="mt-2 space-y-2">
													<Label className="text-xs text-muted-foreground">
														Preview:
													</Label>
													<div className="p-2 border rounded bg-gray-50">
														<div className="flex items-center gap-2">
															<img
																src={item.icon}
																alt={item.alt_text || "Icon preview"}
																className="w-12 h-12 object-contain border rounded"
															/>
															<div className="flex-1">
																<p className="text-xs text-gray-600">
																	{item.alt_text}
																</p>
																{item.iconFile && !item.uploaded && (
																	<p className="text-xs text-blue-600">
																		Ready to upload: {item.iconFile.name}
																	</p>
																)}
																{item.uploaded && !item.iconFile && (
																	<p className="text-xs text-green-600">
																		✓ Selected from Gallery
																	</p>
																)}
																{item.uploaded && item.iconFile && (
																	<p className="text-xs text-green-600">
																		✓ Uploaded successfully!
																	</p>
																)}
															</div>
														</div>

														{/* Upload Button */}
														{item.iconFile && !item.uploaded && (
															<Button
																type="button"
																onClick={() => uploadGoalIcon(index)}
																disabled={
																	!item.alt_text.trim() || item.uploading
																}
																size="sm"
																className="w-full mt-2"
															>
																{item.uploading ? (
																	<>
																		<Loader2 className="h-4 w-4 mr-2 animate-spin" />
																		Uploading...
																	</>
																) : (
																	"Upload Icon"
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

							{/* Media Gallery Modal for Goal Icons */}
							{showGoalGallery !== null && (
								<MediaGalleryModal
									open={showGoalGallery !== null}
									onOpenChange={(open) => {
										if (!open) setShowGoalGallery(null);
									}}
									onSelect={(media: MediaItem[]) => {
										if (media.length > 0 && showGoalGallery !== null) {
											const selected = media[0];
											const updated = [...projectGoalContent];
											updated[showGoalGallery] = {
												...updated[showGoalGallery],
												icon: selected.image,
												alt_text: selected.alt_text || "",
												iconFile: undefined, // Clear file since we're using gallery
												uploaded: true, // Mark as uploaded
												uploading: false,
											};
											setProjectGoalContent(updated);
											setShowGoalGallery(null);
											toast.success("Goal icon selected from gallery!");
										}
									}}
									maxSelection={1}
									minSelection={1}
									title="Select Goal Icon"
								/>
							)}
						</CardContent>
					</Card>

					{/* Project Goal Section (Intro + Items) */}
					<Card>
						<CardHeader>
							<CardTitle>Project Goal Details Section</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="goalSectionIntro">Section Introduction</Label>
								<Textarea
									id="goalSectionIntro"
									value={projectGoalSectionIntro}
									onChange={(e) => setProjectGoalSectionIntro(e.target.value)}
									placeholder="e.g., Goals overview"
									rows={2}
								/>
							</div>

							{/* Goal Section Items */}
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
													points: [""],
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
									<div key={index} className="p-4 border rounded-lg space-y-3">
										<div className="flex justify-between items-center">
											<h4 className="font-medium text-sm">Item #{index + 1}</h4>
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
												<Label>Title</Label>
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
													placeholder="e.g., Faster checkout"
												/>
											</div>
											<div className="space-y-2">
												<Label>Description</Label>
												<Input
													value={item.desc}
													onChange={(e) => {
														const updated = [...projectGoalSectionItems];
														updated[index] = {
															...updated[index],
															desc: e.target.value,
														};
														setProjectGoalSectionItems(updated);
													}}
													placeholder="e.g., One-page checkout"
												/>
											</div>

											{/* Add Points */}
											<div className="space-y-2">
												<div className="flex justify-between items-center">
													<Label>Add Points</Label>
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => addPoint(index)}
													>
														Add Point
													</Button>
												</div>
												<div className="space-y-2">
													{(item.points || []).map(
														(point: string, pointIndex: number, arr: any) => {
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
																						updatePoint(
																							index,
																							pointIndex,
																							value
																						);
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
																				onClick={() =>
																					removePoint(index, pointIndex)
																				}
																				disabled={
																					(item.points || []).length <= 1
																				}
																			>
																				Remove
																			</Button>
																		</div>
																		<p className="text-sm text-muted-foreground mt-1">
																			{200 - (point?.length || 0)} characters
																			remaining
																		</p>
																	</div>
																);
															}
															return null;
														}
													)}
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
									<div key={index} className="p-4 border rounded-lg space-y-3">
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

												{/* Upload from computer */}
												<Input
													type="file"
													accept="image/*"
													multiple
													onChange={(e) => {
														const files = Array.from(e.target.files || []);
														if (files.length === 0) return;

														if (files.length > 4) {
															toast.error(
																"You can upload maximum 4 images per technology"
															);
															return;
														}

														// Validate each file
														for (const file of files) {
															if (!file.type.startsWith("image/")) {
																toast.error("Please select only image files");
																return;
															}
															if (file.size > 5 * 1024 * 1024) {
																toast.error(
																	"Each image size should be less than 5MB"
																);
																return;
															}
														}

														// Update state with files and preview URLs
														const updated = [...technologyContent];
														updated[index] = {
															...updated[index],
															iconFiles: files, // Store files for upload
															iconAltTexts: new Array(files.length).fill(""), // Initialize alt texts
															icons: files.map((file) => ({
																url: URL.createObjectURL(file),
																alt_text: "",
															})), // Preview URLs
															uploaded: false,
															uploading: false,
														};
														setTechnologyContent(updated);
													}}
												/>

												{/* Or select from media gallery */}
												<div className="mt-2">
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
																			updated[index].icons[imgIndex].alt_text =
																				e.target.value;
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
																		<Loader2 className="h-4 w-4 mr-2 animate-spin" />
																		Uploading...
																	</>
																) : (
																	`Upload ${item.iconFiles.length} Icon(s)`
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
