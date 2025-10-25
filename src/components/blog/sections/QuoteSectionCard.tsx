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
  errors?: { [key: string]: string | { [key: string]: string } | undefined };
  setError?: (field: string, message: string) => void;
  clearError?: (field: string) => void;
}

export function QuoteSectionCard({
  quoteSection,
  updateSection,
  updateQuote,
  addQuote,
  removeQuote,
  errors = {},
  setError,
  clearError,
}: QuoteSectionCardProps) {

  // Helper function to get error message for a specific field
  const getErrorMessage = (fieldPath: string): string | undefined => {
    const fieldParts = fieldPath.split('.');
    let current: any = errors;

    for (const part of fieldParts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return current as string;
      }
    }

    return current as string;
  };

  // Validation functions
  const validateQuoteField = (field: string, value: string, maxLength: number): string | null => {
    if (!value.trim()) {
      switch (field) {
        case 'title': return "Quote title is required";
        case 'description': return "Quote description is required";
        case 'quote': return "Quote text is required";
        case 'quoteusername': return "Quote author name is required";
        default: return "This field is required";
      }
    }
    if (value.length > maxLength) {
      switch (field) {
        case 'title':
        case 'quoteusername':
          return `Quote ${field} must be ${maxLength} characters or less`;
        case 'description':
        case 'quote':
          return `Quote ${field} must be ${maxLength} characters or less`;
        default:
          return `Must be ${maxLength} characters or less`;
      }
    }
    return null;
  };

  const handleQuoteFieldChange = (index: number, field: string, value: string, maxLength: number) => {
    // Update the field value
    updateQuote(index, field, value);

    // Real-time validation
    if (setError && clearError) {
      const error = validateQuoteField(field, value, maxLength);
      const errorKey = `quoteSection.quotes.${index}.${field}`;

      if (error) {
        setError(errorKey, error);
      } else {
        clearError(errorKey);
      }
    }
  };

  const handleQuoteFieldBlur = (index: number, field: string, value: string, maxLength: number) => {
    // Additional validation on blur
    if (setError && clearError) {
      const error = validateQuoteField(field, value, maxLength);
      const errorKey = `quoteSection.quotes.${index}.${field}`;

      if (error) {
        setError(errorKey, error);
      } else {
        clearError(errorKey);
      }
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Quote Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-2 block">Quote Section Summary</Label>
          <Input
            id="quote-summary"
            name="quote_summary"
            data-field="quoteSection.summary"
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
                      id={`quote-${index}-title`}
                      name={`quote_${index}_title`}
                      data-field={`quoteSection.quotes.${index}.title`}
                      value={quote.title}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 40) {
                          handleQuoteFieldChange(index, "title", value, 40);
                        }
                      }}
                      onBlur={(e) => handleQuoteFieldBlur(index, "title", e.target.value, 40)}
                      placeholder="Quote title"
                      maxLength={40}
                      className={`${getErrorMessage(`quoteSection.quotes.${index}.title`) ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <div className="flex justify-between items-start mt-2">
                      <p className={`text-sm ${getErrorMessage(`quoteSection.quotes.${index}.title`) ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {getErrorMessage(`quoteSection.quotes.${index}.title`) || `${40 - (quote.title?.length || 0)} characters remaining`}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Quote Description</Label>
                    <Input
                      id={`quote-${index}-description`}
                      name={`quote_${index}_description`}
                      data-field={`quoteSection.quotes.${index}.description`}
                      value={quote.description}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 1000) {
                          handleQuoteFieldChange(index, "description", value, 1000);
                        }
                      }}
                      onBlur={(e) => handleQuoteFieldBlur(index, "description", e.target.value, 1000)}
                      placeholder="Quote description"
                      maxLength={1000}
                      className={`${getErrorMessage(`quoteSection.quotes.${index}.description`) ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <div className="flex justify-between items-start mt-2">
                      <p className={`text-sm ${getErrorMessage(`quoteSection.quotes.${index}.description`) ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {getErrorMessage(`quoteSection.quotes.${index}.description`) || `${1000 - (quote.description?.length || 0)} characters remaining`}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Quote Text</Label>
                  <Textarea
                    id={`quote-${index}-quote`}
                    name={`quote_${index}_quote`}
                    data-field={`quoteSection.quotes.${index}.quote`}
                    value={quote.quote}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 1000) {
                        handleQuoteFieldChange(index, "quote", value, 1000);
                      }
                    }}
                    onBlur={(e) => handleQuoteFieldBlur(index, "quote", e.target.value, 1000)}
                    placeholder="Enter the quote"
                    rows={3}
                    maxLength={1000}
                    className={`${getErrorMessage(`quoteSection.quotes.${index}.quote`) ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  <div className="flex justify-between items-start mt-2">
                    <p className={`text-sm ${getErrorMessage(`quoteSection.quotes.${index}.quote`) ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {getErrorMessage(`quoteSection.quotes.${index}.quote`) || `${1000 - (quote.quote?.length || 0)} characters remaining`}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Quote Author</Label>
                  <Input
                    id={`quote-${index}-username`}
                    name={`quote_${index}_username`}
                    data-field={`quoteSection.quotes.${index}.username`}
                    value={quote.quoteusername}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 40) {
                        handleQuoteFieldChange(index, "quoteusername", value, 40);
                      }
                    }}
                    onBlur={(e) => handleQuoteFieldBlur(index, "quoteusername", e.target.value, 40)}
                    placeholder="Quote author name"
                    maxLength={40}
                    className={`${getErrorMessage(`quoteSection.quotes.${index}.username`) ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  <div className="flex justify-between items-start mt-2">
                    <p className={`text-sm ${getErrorMessage(`quoteSection.quotes.${index}.username`) ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {getErrorMessage(`quoteSection.quotes.${index}.username`) || `${40 - (quote.quoteusername?.length || 0)} characters remaining`}
                    </p>
                  </div>
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
