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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useBlogs } from "@/hooks/useBlogs";
import { useTags } from "@/hooks/useTags";
import { BlogPost, Tag, BlogSectionsData } from "@/types/types";
import { toast } from "sonner";
import { getDefaultBlogSectionsData } from "@/data/exampleBlogData";

interface EditBlogModalProps {
  blog: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditBlogModal({ blog, isOpen, onClose }: EditBlogModalProps) {
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
      .replace(/[^a-z0-9 -]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim();
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      // Only auto-generate if slug is empty or was auto-generated before
      setSlug(generateSlug(value));
    }
  };

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setSlug(blog.slug || "");
      setContent(blog.content || "");
      setPublished(blog.published);
      setMetaTitle(blog.meta_title);
      setMetaDescription(blog.meta_description);
      setSelectedTagIds(blog.tag_ids || []);
      
      // Set existing images as previews if available
      if (blog.images && blog.images.length > 0) {
        setPreviews(blog.images);
      }

      // Set sections data if available
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

  const handleTagChange = (tagId: number, checked: boolean) => {
    if (checked) {
      setSelectedTagIds((prev) => [...prev, tagId]);
    } else {
      setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
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

  const renderHeroSection = () => {
    const hero = sectionsData.hero_section || { title: '', description: '', summary: '', image: null, image_alt_text: '' };
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label>Hero Title</Label>
              <Input
                value={hero.title || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 40) {
                    updateSection("hero_section", "title", value);
                  }
                }}
                placeholder="Enter hero section title"
                maxLength={40}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {40 - (hero.title?.length || 0)} characters remaining
              </p>
            </div>
            <div>
              <Label>Hero Description</Label>
              <Textarea
                value={hero.description || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 1000) {
                    updateSection("hero_section", "description", value);
                  }
                }}
                placeholder="Enter hero section description"
                rows={3}
                maxLength={1000}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {1000 - (hero.description?.length || 0)} characters remaining
              </p>
            </div>
            <div>
              <Label>Hero Summary</Label>
              <Input
                value={hero.summary || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 400) {
                    updateSection("hero_section", "summary", value);
                  }
                }}
                placeholder="Enter hero section summary"
                maxLength={400}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {400 - (hero.summary?.length || 0)} characters remaining
              </p>
            </div>
            <div>
              <Label>Hero Image Alt Text</Label>
              <Input
                value={(hero as any).image_alt_text || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 255) {
                    updateSection("hero_section", "image_alt_text", value);
                  }
                }}
                placeholder="Enter alt text for hero image"
                maxLength={255}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {255 - ((hero as any).image_alt_text?.length || 0)} characters remaining
              </p>
            </div>
            <div>
              <Label>Hero Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    updateSection("hero_section", "image", e.target.files[0]);
                  }
                }}
              />
              {hero.image &&
                (hero.image as any)?.constructor?.name === "File" && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(hero.image)}
                      alt="Hero Image Preview"
                      className="h-40 w-auto rounded border object-cover"
                    />
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderQuoteSection = () => {
    const quoteSection = sectionsData.quote_section || { summary: '', quotes: [] };
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">Quote Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Quote Section Summary</Label>
            <Input
              value={quoteSection.summary || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 400) {
                  updateSection("quote_section", "summary", value);
                }
              }}
              placeholder="Enter quote section summary"
              maxLength={400}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {400 - (quoteSection.summary?.length || 0)} characters remaining
            </p>
          </div>

          <Separator />

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Quotes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuote}
              >
                Add Quote Details
              </Button>
            </div>
            <div className="space-y-4">
              {quoteSection.quotes?.map((quote, index) => (
                <div key={index} className="grid gap-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Quote Title</Label>
                      <Input
                        value={quote.title}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 40) {
                            updateQuote(index, "title", value);
                          }
                        }}
                        placeholder="Quote title"
                        maxLength={40}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {40 - (quote.title?.length || 0)} characters remaining
                      </p>
                    </div>
                    <div>
                      <Label>Quote Description</Label>
                      <Input
                        value={quote.description}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 1000) {
                            updateQuote(index, "description", value);
                          }
                        }}
                        placeholder="Quote description"
                        maxLength={1000}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {1000 - (quote.description?.length || 0)} characters remaining
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Quote Text</Label>
                                          <Textarea
                        value={quote.quote}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 1000) {
                            updateQuote(index, "quote", value);
                          }
                        }}
                        placeholder="Enter the quote"
                        rows={3}
                        maxLength={1000}
                      />
                                          <p className="text-sm text-muted-foreground mt-1">
                        {1000 - (quote.quote?.length || 0)} characters remaining
                      </p>
                  </div>
                  <div>
                    <Label>Quote Author</Label>
                    <Input
                      value={quote.quoteusername}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 40) {
                          updateQuote(index, "quoteusername", value);
                        }
                      }}
                      placeholder="Quote author name"
                      maxLength={40}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {40 - (quote.quoteusername?.length || 0)} characters remaining
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeQuote(index)}
                  >
                    Remove Quote
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderInfoSection = () => {
    const info = sectionsData.info_section || { title: '', description: '', summary: '', summary_2: '', image: null, image_alt_text: '' };
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">Info Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label>Info Title</Label>
              <Input
                value={info.title || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 40) {
                    updateSection("info_section", "title", value);
                  }
                }}
                placeholder="Enter info section title"
                maxLength={40}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {40 - (info.title?.length || 0)} characters remaining
              </p>
            </div>
            <div>
              <Label>Info Description</Label>
              <Textarea
                value={info.description || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 1000) {
                    updateSection("info_section", "description", value);
                  }
                }}
                placeholder="Enter info section description"
                rows={3}
                maxLength={1000}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {1000 - (info.description?.length || 0)} characters remaining
              </p>
            </div>
            <div>
              <Label>Info Summary</Label>
              <Input
                value={info.summary || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 400) {
                    updateSection("info_section", "summary", value);
                  }
                }}
                placeholder="Enter info section summary"
                maxLength={400}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {400 - (info.summary?.length || 0)} characters remaining
              </p>
            </div>
            <div>
              <Label>Info Summary 2</Label>
              <Input
                value={info.summary_2 || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 400) {
                    updateSection("info_section", "summary_2", value);
                  }
                }}
                placeholder="Enter additional info summary"
                maxLength={400}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {400 - (info.summary_2?.length || 0)} characters remaining
              </p>
            </div>
            <div>
              <Label>Info Image Alt Text</Label>
              <Input
                value={(info as any).image_alt_text || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 255) {
                    updateSection("info_section", "image_alt_text", value);
                  }
                }}
                placeholder="Enter alt text for info image"
                maxLength={255}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {255 - ((info as any).image_alt_text?.length || 0)} characters remaining
              </p>
            </div>
            <div>
              <Label>Info Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    updateSection("info_section", "image", e.target.files[0]);
                  }
                }}
              />
              {info.image &&
                (info.image as any)?.constructor?.name === "File" && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(info.image)}
                      alt="Info Image Preview"
                      className="h-40 w-auto rounded border object-cover"
                    />
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleSave = () => {
    if (!blog) return;

    if (!title || !slug || !content || !metaTitle || !metaDescription) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Character limit validations
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

    // Validate slug format
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

    // Validate section data character limits
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
      if (!quote.summary || quote.summary.trim() === "") {
        toast.error("Quote section summary is required.");
        return;
      }
      if (quote.summary.length < 100) {
        toast.error("Quote section summary must be at least 100 characters long.");
        return;
      }
      if (quote.summary.length > 400) {
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
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("content", content);
    formData.append("published", published.toString());
    formData.append("meta_title", metaTitle);
    formData.append("meta_description", metaDescription);

    // Add tag_ids as JSON string
    if (selectedTagIds.length > 0) {
      formData.append("tag_ids", JSON.stringify(selectedTagIds));
    }

    // Add image files
    imageFiles.forEach((file) => {
      formData.append("image_files", file);
    });

    // Add OG image if exists
    if (ogImageFile) {
      formData.append("og_image_file", ogImageFile);
    }

    // Add sections data if exists
    if (Object.keys(sectionsData).length > 0) {
      formData.append("sections_data", JSON.stringify(sectionsData));
    }

    // Add individual sections if they exist
    if (sectionsData.hero_section) {
      formData.append(
        "hero_section",
        JSON.stringify(sectionsData.hero_section)
      );
      // Add hero image file if exists
      if (sectionsData.hero_section.image) {
        formData.append("hero_image", sectionsData.hero_section.image);
        formData.append(
          "hero_section_image",
          sectionsData.hero_section.image
        );
      }
      // Add hero image alt text
      if ((sectionsData.hero_section as any).image_alt_text) {
        formData.append("hero_image_alt_text", (sectionsData.hero_section as any).image_alt_text);
      }
    }

    if (sectionsData.quote_section) {
      formData.append(
        "quote_section",
        JSON.stringify(sectionsData.quote_section)
      );
    }

    if (sectionsData.info_section) {
      formData.append(
        "info_section",
        JSON.stringify(sectionsData.info_section)
      );
      // Add info image file if exists
      if (sectionsData.info_section.image) {
        formData.append(
          "info_section_image",
          sectionsData.info_section.image
        );
      }
      // Add info image alt text
      if ((sectionsData.info_section as any).image_alt_text) {
        formData.append("info_image_alt_text", (sectionsData.info_section as any).image_alt_text);
      }
    }

    editBlog.mutate(
      { id: blog.id.toString(), data: formData },
      {
        onSuccess: () => {
          toast.success("Blog post updated successfully!");
          onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Blog Post</DialogTitle>
          <DialogDescription>
            Update the blog post details and click save.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title">Blog Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 40) {
                          handleTitleChange(value);
                        }
                      }}
                      placeholder="Enter blog post title"
                      required
                      maxLength={40}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {40 - title.length} characters remaining
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={slug}
                      maxLength={40}
                       onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 40) {
                          setSlug(generateSlug(value));
                        }
                      }}
                      placeholder="url-friendly-slug"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      This will be used in the URL. Only letters, numbers, and
                      hyphens allowed.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {40 - slug.length} characters remaining
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your blog post content..."
                      rows={8}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {content.length} characters
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="metaTitle">Meta Title *</Label>
                      <Input
                        id="metaTitle"
                        value={metaTitle}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 40) {
                            setMetaTitle(value);
                          }
                        }}
                        placeholder="Enter meta title for SEO"
                        required
                        maxLength={40}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {40 - metaTitle.length} characters remaining
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="metaDescription">
                        Meta Description *
                      </Label>
                      <Textarea
                        id="metaDescription"
                        value={metaDescription}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 300) {
                            setMetaDescription(value);
                          }
                        }}
                        placeholder="Enter meta description for SEO"
                        rows={3}
                        required
                        maxLength={300}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {300 - metaDescription.length} characters remaining
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <Label htmlFor="image">Upload Blog Images</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                      {previews.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {previews.map((src, idx) => (
                            <img
                              key={idx}
                              src={src}
                              alt={`Preview ${idx + 1}`}
                              className="h-40 w-auto rounded border object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="col-span-1">
                      <Label htmlFor="ogImage">OG Image (Optional)</Label>
                      <Input
                        id="ogImage"
                        type="file"
                        accept="image/*"
                        onChange={handleOgImageChange}
                      />
                      {ogImagePreview && (
                        <div className="mt-2">
                          <img
                            src={ogImagePreview}
                            alt="OG Image Preview"
                            className="h-40 w-auto rounded border object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={published}
                      onCheckedChange={setPublished}
                      className="data-[state=checked]:bg-teal-500"
                    />
                    <Label htmlFor="published">Publish</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                {getTags.isLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading tags...
                  </div>
                ) : getTags.isError ? (
                  <div className="text-sm text-red-500">
                    Failed to load tags
                  </div>
                ) : Array.isArray(tagsData) && tagsData.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tagsData.map((tag: Tag) => (
                      <div
                        key={tag.id}
                        className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                          selectedTagIds.includes(tag.id)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() =>
                          handleTagChange(
                            tag.id,
                            !selectedTagIds.includes(tag.id)
                          )
                        }
                      >
                        {tag.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No tags available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Blog Sections</h2>
              {renderHeroSection()}
              {renderQuoteSection()}
              {renderInfoSection()}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="blue" onClick={handleSave} disabled={editBlog.isPending}>
            {editBlog.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
