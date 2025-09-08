"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBlogs } from "@/hooks/useBlogs";
import { useTags } from "@/hooks/useTags";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Tag, CreateBlogData, HeroSection, QuoteSection, InfoSection } from "@/types/types";
import { getDefaultBlogSectionsData } from "@/data/exampleBlogData";

export default function AddBlogPage() {
  const router = useRouter();
  const { addBlog } = useBlogs(1, 10);
  const { getTags } = useTags();

  // Basic blog fields
  const [title, setTitle] = useState("");
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
  const [sectionsData, setSectionsData] = useState(getDefaultBlogSectionsData());

  // Get tags data safely
  const tagsData = getTags.data?.data || [];

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
      setSelectedTagIds(prev => [...prev, tagId]);
    } else {
      setSelectedTagIds(prev => prev.filter(id => id !== tagId));
    }
  };

  const updateSection = (sectionKey: string, field: string, value: any) => {
    setSectionsData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const updateQuote = (index: number, field: string, value: string) => {
    setSectionsData(prev => ({
      ...prev,
      quote_section: {
        ...prev.quote_section,
        quotes: prev.quote_section?.quotes.map((quote, i) => 
          i === index ? { ...quote, [field]: value } : quote
        ) || []
      }
    }));
  };

  const addQuote = () => {
    setSectionsData(prev => ({
      ...prev,
      quote_section: {
        ...prev.quote_section,
        quotes: [
          ...(prev.quote_section?.quotes || []),
          { title: "", description: "", quote: "", quoteusername: "" }
        ]
      }
    }));
  };

  const removeQuote = (index: number) => {
    setSectionsData(prev => ({
      ...prev,
      quote_section: {
        ...prev.quote_section,
        quotes: prev.quote_section?.quotes.filter((_, i) => i !== index) || []
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !metaTitle || !metaDescription) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (content.length < 50) {
      toast.error("Blog content must be more than 50 characters long.");
      return;
    }

    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
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
        formData.append("hero_section", JSON.stringify(sectionsData.hero_section));
        // Add hero image file if exists
        if (sectionsData.hero_section.image) {
          formData.append("hero_image", sectionsData.hero_section.image);
          formData.append("hero_section_image", sectionsData.hero_section.image);
        }
      }

      if (sectionsData.quote_section) {
        formData.append("quote_section", JSON.stringify(sectionsData.quote_section));
      }

      if (sectionsData.info_section) {
        formData.append("info_section", JSON.stringify(sectionsData.info_section));
        // Add info image file if exists
        if (sectionsData.info_section.image) {
          formData.append("info_section_image", sectionsData.info_section.image);
        }
      }


      console.log([...formData.entries()]);

      await addBlog.mutateAsync(formData);
      toast.success("Blog post created successfully!");
      router.push("/dashboard/blogs");
    } catch (error: any) {
      console.error("error creating blog post:", error.response?.data);
      toast.error("Failed to create blog post, " + (error.response?.data?.details?.content?.[0] || "Unknown error"));
    }
  };

  const renderHeroSection = () => {
    const hero = sectionsData.hero_section || {};
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
                onChange={(e) => updateSection('hero_section', 'title', e.target.value)}
                placeholder="Enter hero section title"
              />
            </div>
            <div>
              <Label>Hero Description</Label>
              <Textarea
                value={hero.description || ""}
                onChange={(e) => updateSection('hero_section', 'description', e.target.value)}
                placeholder="Enter hero section description"
                rows={3}
              />
            </div>
            <div>
              <Label>Hero Summary</Label>
              <Input
                value={hero.summary || ""}
                onChange={(e) => updateSection('hero_section', 'summary', e.target.value)}
                placeholder="Enter hero section summary"
              />
            </div>
            <div>
              <Label>Hero Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    updateSection('hero_section', 'image', e.target.files[0]);
                  }
                }}
              />
              {hero.image && (
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
    const quoteSection = sectionsData.quote_section || { quotes: [] };
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
              onChange={(e) => updateSection('quote_section', 'summary', e.target.value)}
              placeholder="Enter quote section summary"
            />
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
                        onChange={(e) => updateQuote(index, 'title', e.target.value)}
                        placeholder="Quote title"
                      />
                    </div>
                    <div>
                      <Label>Quote Description</Label>
                      <Input
                        value={quote.description}
                        onChange={(e) => updateQuote(index, 'description', e.target.value)}
                        placeholder="Quote description"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Quote Text</Label>
                    <Textarea
                      value={quote.quote}
                      onChange={(e) => updateQuote(index, 'quote', e.target.value)}
                      placeholder="Enter the quote"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Quote Author</Label>
                    <Input
                      value={quote.quoteusername}
                      onChange={(e) => updateQuote(index, 'quoteusername', e.target.value)}
                      placeholder="Quote author name"
                    />
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
    const info = sectionsData.info_section || {};
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
                onChange={(e) => updateSection('info_section', 'title', e.target.value)}
                placeholder="Enter info section title"
              />
            </div>
            <div>
              <Label>Info Description</Label>
              <Textarea
                value={info.description || ""}
                onChange={(e) => updateSection('info_section', 'description', e.target.value)}
                placeholder="Enter info section description"
                rows={3}
              />
            </div>
            <div>
              <Label>Info Summary</Label>
              <Input
                value={info.summary || ""}
                onChange={(e) => updateSection('info_section', 'summary', e.target.value)}
                placeholder="Enter info section summary"
              />
            </div>
            <div>
              <Label>Info Summary 2</Label>
              <Input
                value={info.summary_2 || ""}
                onChange={(e) => updateSection('info_section', 'summary_2', e.target.value)}
                placeholder="Enter additional info summary"
              />
            </div>
            <div>
              <Label>Info Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    updateSection('info_section', 'image', e.target.files[0]);
                  }
                }}
              />
              {info.image && (
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

  return (
    <div className="w-full mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-semibold mb-6">Create New Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
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
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter blog post title"
                      required
                    />
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="metaTitle">Meta Title *</Label>
                      <Input
                        id="metaTitle"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder="Enter meta title for SEO"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="metaDescription">Meta Description *</Label>
                      <Textarea
                        id="metaDescription"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="Enter meta description for SEO"
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={published}
                      onCheckedChange={setPublished}
                    />
                    <Label htmlFor="published">Publish immediately</Label>
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
                  <div className="text-sm text-muted-foreground">Loading tags...</div>
                ) : getTags.isError ? (
                  <div className="text-sm text-red-500">Failed to load tags</div>
                ) : Array.isArray(tagsData) && tagsData.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tagsData.map((tag: Tag) => (
                      <div
                        key={tag.id}
                        className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                          selectedTagIds.includes(tag.id)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => handleTagChange(tag.id, !selectedTagIds.includes(tag.id))}
                      >
                        {tag.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No tags available</div>
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

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Blog Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image">Upload Blog Images *</Label>
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

                <Separator />

                <div>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
           variant={"blue"}
            type="submit"
            disabled={addBlog.isPending}
            size="lg"
            className="w-fit"
          >
            {addBlog.isPending ? "Creating Blog..." : "Create Blog Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
