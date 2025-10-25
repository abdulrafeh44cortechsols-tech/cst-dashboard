import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InfoSectionCardProps {
  info: any;
  updateSection: (section: string, field: string, value: any) => void;
  currentImageUrl?: string | null;
}

export function InfoSectionCard({ info, updateSection, currentImageUrl }: InfoSectionCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Info Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div>
            <Label className="mb-2 block">Info Title</Label>
            <Input
              id="info-title"
              name="info_title"
              data-field="infoSection.title"
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
          </div>
          <div>
            <Label className="mb-2 block">Info Description</Label>
            <Textarea
              id="info-description"
              name="info_description"
              data-field="infoSection.description"
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
          </div>
          <div>
            <Label className="mb-2 block">Info Summary</Label>
            <Input
              id="info-summary"
              name="info_summary"
              data-field="infoSection.summary"
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
          </div>
          <div>
            <Label className="mb-2 block">Info Summary 2</Label>
            <Input
              id="info-summary-2"
              name="info_summary_2"
              data-field="infoSection.summary2"
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
          </div>
          <div>
            <Label className="mb-2 block">Info Image Alt Text</Label>
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
          </div>
          <div className="cursor-pointer">
            <Label className="mb-2 block">Info Image</Label>
            <Input
              type="file"
              accept="image/*"
              className="cursor-pointer"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  updateSection("info_section", "image", e.target.files[0]);
                }
              }}
            />
            {currentImageUrl ? (
              <div className="mt-2">
                <Label className="text-sm font-medium">Current Info Image</Label>
                <img
                  src={currentImageUrl}
                  alt="Info current"
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
