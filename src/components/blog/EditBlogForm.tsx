"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlogs } from "@/hooks/useBlogs";
import { useTags } from "@/hooks/useTags";
import { BlogPost, BlogSectionsData } from "@/types/types";
import { toast } from "sonner";
import { getDefaultBlogSectionsData } from "@/data/exampleBlogData";
import { Loader2 } from "lucide-react";
import { BasicInfoTab } from "./sections/BasicInfoTab";
import { ImagesTab } from "./sections/ImagesTab";
import { HeroSectionCard } from "./sections/HeroSectionCard";
import { QuoteSectionCard } from "./sections/QuoteSectionCard";
import { InfoSectionCard } from "./sections/InfoSectionCard";

interface EditBlogFormProps {
  blog: BlogPost | null;
  onCancel?: () => void;
  onSaved?: () => void;
}

// Extracted from EditBlogModal to reuse on a full page without changing logic
export function EditBlogForm({ blog, onCancel, onSaved }: EditBlogFormProps) {
  const { editBlog } = useBlogs();
  const { getTags } = useTags();

  // Basic blog fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // File uploads
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);

  // Section data
  const [sectionsData, setSectionsData] = useState<BlogSectionsData>(
    getDefaultBlogSectionsData()
  );

  // Get tags data safely
  const tagsData = getTags.data?.data || [];

  // Utility function to generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  useEffect(() => {
    if (blog) {
      console.log(blog,"blog")
      setTitle(blog.title);
      setSlug(blog.slug || "");
      setContent(blog.content || "");
      setPublished(blog.published);
      setMetaTitle(blog.meta_title);
      setMetaDescription(blog.meta_description);
      setSelectedTagIds(blog.tag_ids || []);

      if (blog.images && blog.images.length > 0) {
        setPreviews(blog.images);
      }

      // Set existing OG image preview
      if (blog.og_image) {
        setOgImagePreview(blog.og_image);
      }

      if (blog.sections_data) {
        setSectionsData(blog.sections_data);
      }
    }
  }, [blog]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
      setPreviews(files.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleOgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOgImageFile(file);
      setOgImagePreview(URL.createObjectURL(file));
    }
  };

  const updateSection = (sectionKey: string, field: string, value: any) => {
    setSectionsData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey as keyof BlogSectionsData],
        [field]: value,
      },
    }));
  };

  const updateQuote = (index: number, field: string, value: string) => {
    setSectionsData((prev) => ({
      ...prev,
      quote_section: {
        ...prev.quote_section,
        quotes:
          prev.quote_section?.quotes.map((quote, i) =>
            i === index ? { ...quote, [field]: value } : quote
          ) || [],
      },
    }));
  };

  const addQuote = () => {
    setSectionsData((prev) => ({
      ...prev,
      quote_section: {
        ...prev.quote_section,
        quotes: [
          ...(prev.quote_section?.quotes || []),
          { title: "", description: "", quote: "", quoteusername: "" },
        ],
      },
    }));
  };

  const removeQuote = (index: number) => {
    setSectionsData((prev) => ({
      ...prev,
      quote_section: {
        ...prev.quote_section,
        quotes: prev.quote_section?.quotes.filter((_, i) => i !== index) || [],
      },
    }));
  };

  const handleSave = () => {
    if (!blog) return;

    if (!title || !slug || !content || !metaTitle || !metaDescription) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (title.length > 40) {
      toast.error("Blog title must be 40 characters or less.");
      return;
    }

    if (metaTitle.length > 40) {
      toast.error("Meta title must be 40 characters or less.");
      return;
    }

    if (metaDescription.length > 300) {
      toast.error("Meta description must be 300 characters or less.");
      return;
    }

    const slugPattern = /^[a-z0-9-]+$/;
    if (!slugPattern.test(slug)) {
      toast.error(
        "Slug can only contain lowercase letters, numbers, and hyphens."
      );
      return;
    }

    if (content.length < 100) {
      toast.error("Blog content must be more than 100 characters long.");
      return;
    }

    if (sectionsData.hero_section) {
      const hero = sectionsData.hero_section;
      if (hero.title && hero.title.length > 40) {
        toast.error("Hero title must be 40 characters or less.");
        return;
      }
      if (hero.description && hero.description.length < 100) {
        toast.error("Hero description must be at least 100 characters long.");
        return;
      }
      if (hero.description && hero.description.length > 1000) {
        toast.error("Hero description must be 1000 characters or less.");
        return;
      }
      if (hero.summary && hero.summary.length < 100) {
        toast.error("Hero summary must be at least 100 characters long.");
        return;
      }
      if (hero.summary && hero.summary.length > 400) {
        toast.error("Hero summary must be 400 characters or less.");
        return;
      }
    }

    if (sectionsData.quote_section) {
      const quote = sectionsData.quote_section;
      if (quote.summary && quote.summary.length < 100) {
        toast.error("Quote section summary must be at least 100 characters long.");
        return;
      }
      if (quote.summary && quote.summary.length > 400) {
        toast.error("Quote section summary must be 400 characters or less.");
        return;
      }
      if (quote.quotes) {
        for (let i = 0; i < quote.quotes.length; i++) {
          const q = quote.quotes[i];
          if (q.title && q.title.length > 40) {
            toast.error(`Quote ${i + 1} title must be 40 characters or less.`);
            return;
          }
          if (q.description && q.description.length > 1000) {
            toast.error(`Quote ${i + 1} description must be 1000 characters or less.`);
            return;
          }
          if (q.quote && q.quote.length > 1000) {
            toast.error(`Quote ${i + 1} text must be 1000 characters or less.`);
            return;
          }
          if (q.quoteusername && q.quoteusername.length > 40) {
            toast.error(`Quote ${i + 1} username must be 40 characters or less.`);
            return;
          }
        }
      }
    }

    if (sectionsData.info_section) {
      const info = sectionsData.info_section;
      if (info.title && info.title.length > 40) {
        toast.error("Info title must be 40 characters or less.");
        return;
      }
      if (info.description && info.description.length < 100) {
        toast.error("Info description must be at least 100 characters long.");
        return;
      }
      if (info.description && info.description.length > 1000) {
        toast.error("Info description must be 1000 characters or less.");
        return;
      }
      if (info.summary && info.summary.length < 100) {
        toast.error("Info summary must be at least 100 characters long.");
        return;
      }
      if (info.summary && info.summary.length > 400) {
        toast.error("Info summary must be 400 characters or less.");
        return;
      }
      if (info.summary_2 && info.summary_2.length < 100) {
        toast.error("Info summary 2 must be at least 100 characters long.");
        return;
      }
      if (info.summary_2 && info.summary_2.length > 400) {
        toast.error("Info summary 2 must be 400 characters or less.");
        return;
      }
    }

    const formData = new FormData();

    // Append only changed top-level fields
    if (title !== blog.title) formData.append("title", title);
    if (slug !== blog.slug) formData.append("slug", slug);
    if (content !== (blog.content || "")) formData.append("content", content);
    if (published !== blog.published) formData.append("published", String(published));
    if (metaTitle !== (blog.meta_title || "")) formData.append("meta_title", metaTitle);
    if (metaDescription !== (blog.meta_description || "")) formData.append("meta_description", metaDescription);

    const originalTagIds = blog.tag_ids || [];
    if (JSON.stringify(selectedTagIds) !== JSON.stringify(originalTagIds)) {
      formData.append("tag_ids", JSON.stringify(selectedTagIds));
    }

    // Files: only if newly selected
    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append("image_files", file);
      });
    }
    if (ogImageFile) {
      formData.append("og_image_file", ogImageFile);
    }

    // Sections: append only changed parts
    const originalSections = (blog.sections_data || {}) as any;

    // Helper to compare primitive field differences safely
    const changed = (a: any, b: any) => JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);

    // Hero section
    if (sectionsData.hero_section) {
      const origHero = originalSections.hero_section || {};
      const currHero = sectionsData.hero_section as any;

      const heroPayload: any = {};
      if (changed(currHero.title, origHero.title)) heroPayload.title = currHero.title || "";
      if (changed(currHero.description, origHero.description)) heroPayload.description = currHero.description || "";
      if (changed(currHero.summary, origHero.summary)) heroPayload.summary = currHero.summary || "";
      if (changed(currHero.image_alt_text, origHero.image_alt_text)) heroPayload.image_alt_text = currHero.image_alt_text || "";

      if (Object.keys(heroPayload).length > 0) {
        formData.append("hero_section", JSON.stringify(heroPayload));
      }
      // If a new image file is selected, send it
      if (currHero.image instanceof File) {
        formData.append("hero_image", currHero.image);
        formData.append("hero_section_image", currHero.image);
      }
    }

    // Quote section
    if (sectionsData.quote_section) {
      const origQuote = originalSections.quote_section || {};
      const currQuote = sectionsData.quote_section as any;

      const quotePayload: any = {};
      if (changed(currQuote.summary, origQuote.summary)) quotePayload.summary = currQuote.summary || "";
      if (Array.isArray(currQuote.quotes)) {
        const quotesChanged = JSON.stringify(currQuote.quotes || []) !== JSON.stringify(origQuote.quotes || []);
        if (quotesChanged) quotePayload.quotes = currQuote.quotes || [];
      }
      if (Object.keys(quotePayload).length > 0) {
        formData.append("quote_section", JSON.stringify(quotePayload));
      }
    }

    // Info section
    if (sectionsData.info_section) {
      const origInfo = originalSections.info_section || {};
      const currInfo = sectionsData.info_section as any;

      const infoPayload: any = {};
      if (changed(currInfo.title, origInfo.title)) infoPayload.title = currInfo.title || "";
      if (changed(currInfo.description, origInfo.description)) infoPayload.description = currInfo.description || "";
      if (changed(currInfo.summary, origInfo.summary)) infoPayload.summary = currInfo.summary || "";
      if (changed(currInfo.summary_2, origInfo.summary_2)) infoPayload.summary_2 = currInfo.summary_2 || "";
      if (changed(currInfo.image_alt_text, origInfo.image_alt_text)) infoPayload.image_alt_text = currInfo.image_alt_text || "";

      if (Object.keys(infoPayload).length > 0) {
        formData.append("info_section", JSON.stringify(infoPayload));
      }
      if (currInfo.image instanceof File) {
        formData.append("info_section_image", currInfo.image);
      }
    }

    // If nothing changed, avoid sending an empty PATCH
    if (Array.from(formData.keys()).length === 0) {
      toast.info("No changes to save.");
      return;
    }

    editBlog.mutate(
      { id: blog!.id.toString(), data: formData },
      {
        onSuccess: () => {
          toast.success("Blog post updated successfully!");
          onSaved?.();
        },
        onError: (error: any) => {
          console.error("Error updating blog post:", error.response?.data);
          toast.error(
            "Failed to update blog post: " +
              (error.response?.data?.details?.content?.[0] || "Unknown error")
          );
        },
      }
    );
  };

  const hero = sectionsData.hero_section || { title: '', description: '', summary: '', image: null, image_alt_text: '' };
  const quoteSection = sectionsData.quote_section || { summary: '', quotes: [] } as any;
  const info = sectionsData.info_section || { title: '', description: '', summary: '', summary_2: '', image: null, image_alt_text: '' } as any;

  // Helper to resolve relative media paths to absolute URLs
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const resolveUrl = (u?: string | File | null) => {
    if (!u || typeof u !== "string") return null;
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    if (!u.trim()) return null;
    return `${apiBase}${u.startsWith("/") ? u : `/${u}`}`;
  };
  const heroImageUrl = resolveUrl((hero as any).image as any);
  const infoImageUrl = resolveUrl((info as any).image as any);


  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="cursor-pointer">Basic Info</TabsTrigger>
          <TabsTrigger value="images" className="cursor-pointer">Images</TabsTrigger>
          <TabsTrigger value="sections" className="cursor-pointer">Sections</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4">
          <BasicInfoTab
            title={title}
            setTitle={setTitle}
            handleTitleChange={handleTitleChange}
            slug={slug}
            setSlug={setSlug}
            content={content}
            setContent={setContent}
            metaTitle={metaTitle}
            setMetaTitle={setMetaTitle}
            metaDescription={metaDescription}
            setMetaDescription={setMetaDescription}
            selectedTagIds={selectedTagIds}
            setSelectedTagIds={setSelectedTagIds}
            tagsData={tagsData}
          />
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4">
          <ImagesTab
            handleImageChange={handleImageChange}
            previews={previews}
            handleOgImageChange={handleOgImageChange}
            ogImagePreview={ogImagePreview}
            ogImageFile={ogImageFile}
          />
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <HeroSectionCard hero={hero} updateSection={updateSection} currentImageUrl={heroImageUrl} />
          <QuoteSectionCard
            quoteSection={quoteSection}
            updateSection={updateSection}
            updateQuote={updateQuote}
            addQuote={addQuote}
            removeQuote={removeQuote}
          />
          <InfoSectionCard info={info} updateSection={updateSection} currentImageUrl={infoImageUrl} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={editBlog.isPending}>
            Cancel
          </Button>
        )}
        <Button type="button" onClick={handleSave} disabled={editBlog.isPending}>
          {editBlog.isPending ? (
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
