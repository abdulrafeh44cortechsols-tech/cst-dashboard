import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImagesTabProps {
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previews: string[];
  handleOgImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ogImagePreview: string | null;
  ogImageFile: File | null;
}

export function ImagesTab({
  handleImageChange,
  previews,
  handleOgImageChange,
  ogImagePreview,
  ogImageFile,
}: ImagesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Images</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <Label htmlFor="image" className="mb-2 block">
                Upload Blog Images
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
              {/* Previews */}
              {previews.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {previews.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`preview-${idx}`}
                      className="h-24 w-full object-cover rounded border"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="col-span-1">
              <Label htmlFor="ogImage" className="mb-2 block">
                Upload OG Image
              </Label>
              <Input
                id="ogImage"
                type="file"
                accept="image/*"
                onChange={handleOgImageChange}
              />
              {ogImagePreview && (
                <div className="mt-2">
                  <Label className="text-sm font-medium">
                    {ogImageFile ? "New OG Image Preview" : "Current OG Image"}
                  </Label>
                  <img
                    src={ogImagePreview}
                    alt="OG preview"
                    className="h-24 w-auto rounded border object-cover mt-1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
