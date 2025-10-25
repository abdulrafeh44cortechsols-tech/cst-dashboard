import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BasicInfoTabProps {
  title: string;
  setTitle: (value: string) => void;
  handleTitleChange: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  metaTitle: string;
  setMetaTitle: (value: string) => void;
  metaDescription: string;
  setMetaDescription: (value: string) => void;
  selectedTagIds: number[];
  setSelectedTagIds: (value: number[]) => void;
  tagsData: any[];
  published: boolean;
  setPublished: (value: boolean) => void;
}

export function BasicInfoTab({
  title,
  handleTitleChange,
  slug,
  setSlug,
  content,
  setContent,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  selectedTagIds,
  setSelectedTagIds,
  tagsData,
  published,
  setPublished,
}: BasicInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter blog title"
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-friendly-slug"
          />
        </div>
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog content..."
            rows={6}
          />
        </div>
        <div>
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Enter meta title for SEO"
          />
        </div>
        <div>
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Enter meta description for SEO"
            rows={3}
          />
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

        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {tagsData.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTagIds.includes(tag.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTagIds([...selectedTagIds, tag.id]);
                    } else {
                      setSelectedTagIds(selectedTagIds.filter((id) => id !== tag.id));
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">{tag.name}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
