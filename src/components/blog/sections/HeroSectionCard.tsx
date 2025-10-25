import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HeroSectionCardProps {
  hero: any;
  updateSection: (section: string, field: string, value: any) => void;
  currentImageUrl?: string | null;
}

export function HeroSectionCard({ hero, updateSection, currentImageUrl }: HeroSectionCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Hero Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div>
            <Label className="mb-2 block">Hero Title</Label>
            <Input
              id="hero-title"
              name="hero_title"
              data-field="heroSection.title"
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
          </div>
          <div>
            <Label className="mb-2 block">Hero Description</Label>
            <Textarea
              id="hero-description"
              name="hero_description"
              data-field="heroSection.description"
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
          </div>
          <div>
            <Label className="mb-2 block">Hero Summary</Label>
            <Input
              id="hero-summary"
              name="hero_summary"
              data-field="heroSection.summary"
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
          </div>
          <div>
            <Label className="mb-2 block">Hero Image Alt Text</Label>
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
          </div>
          <div>
            <Label className="mb-2 block">Hero Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  updateSection("hero_section", "image", e.target.files[0]);
                }
              }}
            />
            {currentImageUrl ? (
              <div className="mt-2">
                <Label className="text-sm font-medium">Current Hero Image</Label>
                <img
                  src={currentImageUrl}
                  alt="Hero current"
                  className="h-24 w-auto rounded border object-cover mt-1"
                />
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
