import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImagesTabProps {
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previews: string[];
  handleOgImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ogImagePreview: string | null;
  ogImageFile: File | null;
  imageAltTexts: string[];
  setImageAltTexts: (altTexts: string[]) => void;
  ogImageAltText: string;
  setOgImageAltText: (altText: string) => void;
}

export function ImagesTab({
  handleImageChange,
  previews,
  handleOgImageChange,
  ogImagePreview,
  ogImageFile,
  imageAltTexts,
  setImageAltTexts,
  ogImageAltText,
  setOgImageAltText,
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
              {/* Previews with Alt Text */}
              {previews.length > 0 && (
                <div className="mt-2 space-y-4">
                  {previews.map((src, idx) => (
                    <div key={idx} className="space-y-2 p-4 border rounded-lg">
                      <img
                        src={src}
                        alt={`preview-${idx}`}
                        className="h-24 w-full object-cover rounded border"
                      />
                      <div>
                        <Label htmlFor={`blogImageAlt${idx}`}>Image Alt Text {idx + 1}</Label>
                        <Input
                          id={`blogImageAlt${idx}`}
                          value={imageAltTexts[idx] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 255) {
                              const newAltTexts = [...imageAltTexts];
                              newAltTexts[idx] = value;
                              setImageAltTexts(newAltTexts);
                            }
                          }}
                          placeholder={`Alt text for blog image ${idx + 1}`}
                          maxLength={255}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {255 - (imageAltTexts[idx]?.length || 0)} characters remaining
                        </p>
                      </div>
                    </div>
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
              {ogImageFile && (
                <div className="mt-2 space-y-2">
                  <img
                    src={ogImagePreview!}
                    alt="OG Image preview"
                    className="h-24 w-full object-cover rounded border"
                  />
                  <div>
                    <Label htmlFor="ogImageAlt">OG Image Alt Text</Label>
                    <Input
                      id="ogImageAlt"
                      value={ogImageAltText}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 255) {
                          setOgImageAltText(value);
                        }
                      }}
                      placeholder="Alt text for OG image"
                      maxLength={255}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {255 - ogImageAltText.length} characters remaining
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
