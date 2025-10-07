import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface QuoteSectionCardProps {
  quoteSection: any;
  updateSection: (section: string, field: string, value: any) => void;
  updateQuote: (index: number, field: string, value: any) => void;
  addQuote: () => void;
  removeQuote: (index: number) => void;
}

export function QuoteSectionCard({
  quoteSection,
  updateSection,
  updateQuote,
  addQuote,
  removeQuote,
}: QuoteSectionCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Quote Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-2 block">Quote Section Summary</Label>
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
        </div>

        <Separator />

        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="mb-0">Quotes</Label>
            <Button type="button" variant="outline" size="sm" onClick={addQuote}>
              Add Quote Details
            </Button>
          </div>
          <div className="space-y-4">
            {quoteSection.quotes?.map((quote: any, index: number) => (
              <div key={index} className="grid gap-4 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Quote Title</Label>
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
                  </div>
                  <div>
                    <Label className="mb-2 block">Quote Description</Label>
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
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Quote Text</Label>
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
                </div>
                <div>
                  <Label className="mb-2 block">Quote Author</Label>
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
}
