"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Eye,
  Download,
  Star,
  Palette,
  Layout,
  Smartphone,
  Monitor,
  BookOpen,
  Users,
  Building2,
  GraduationCap,
  Heart,
  Briefcase,
  MessageSquare,
  Plus,
  ExternalLink,
} from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { Template } from "@/types/types";
import { mockTemplatesList } from "@/data/mockTemplatesList";

const categories = [
  "All",
  "Homepage",
  "Services",
  "Blog",
  "About",
  "Contact",
  "Projects",
  "Industry",
];

export default function TemplatesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Use the templates API hook
  const { getTemplatesList } = useTemplates(currentPage, 12);

  // Get templates data with fallback to mock data
  const templatesData = getTemplatesList.data?.templates || mockTemplatesList;
  const isLoading = getTemplatesList.isLoading;
  const isError = getTemplatesList.isError;

  const filteredTemplates = templatesData.filter((template: Template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Homepage":
        return <Layout className="h-4 w-4" />;
      case "Services":
        return <Briefcase className="h-4 w-4" />;
      case "Blog":
        return <BookOpen className="h-4 w-4" />;
      case "About":
        return <Users className="h-4 w-4" />;
      case "Contact":
        return <MessageSquare className="h-4 w-4" />;
      case "Projects":
        return <Palette className="h-4 w-4" />;
      case "Industry":
        return <Building2 className="h-4 w-4" />;
      default:
        return <Palette className="h-4 w-4" />;
    }
  };

const handleViewTemplate = (template: Template, version?: string) => {
  const baseUrl = "http://localhost:3000";

  // Map each template name to a category/path
  const templateMap: Record<string, string> = {
    homepage: "/",
    single_service_page: "services",
    industries: "industries",
    single_target_industry: "industries",
    case_studies: "case-studies",
    single_case_study: "case-studies",
    blog: "blogs",
    single_blog: "blogs/ai-in-education-revolutionizing-how-students-learn",
    about_us_and_team: "about",
    contact_us: "contact",
    the_special_page: "special",
  };

  // Normalize the name to lowercase to avoid case sensitivity issues
  const templateKey = template.template_type || "default";

  // Get the mapped URL or fallback to default
  const templateUrl = `${baseUrl}/${templateMap[templateKey] || "default"}`;

  console.log("template redirect:", template.template_type);
  console.log("redirecting to:", templateUrl);

  // Open in new tab
  window.open(templateUrl, "_blank");
};


  const handleCreatePageWithTemplate = (template: Template) => {
    // Redirect to create new page with pre-selected template
    const templateType =
      template.template_type ||
      template.name.toLowerCase().replace(/\s+/g, "_");
    router.push(`/dashboard/pages/new?template=${templateType}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
            <p className="text-muted-foreground">
              Browse and preview WordPress CMS page templates for your website
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="p-0">
                <div className="aspect-video bg-muted rounded-t-lg" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded mb-3" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
            <p className="text-muted-foreground">
              Browse and preview WordPress CMS page templates for your website
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Failed to load templates
          </h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading the templates. Please try again later.
          </p>
          <Button variant="blue" onClick={() => getTemplatesList.refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Browse and preview page templates for your website
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "blue" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {getCategoryIcon(category)}
              <span className="ml-2">{category}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template: Template) => (
          <Card
            key={template.id}
            className="group hover:shadow-lg transition-shadow pt-0"
          >
            <CardHeader className="p-0">
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {template.name}
                    </p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {template.isNew && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      New
                    </Badge>
                  )}
                  {template.isPopular && (
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-800"
                    >
                      Popular
                    </Badge>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex flex-col gap-2 p-2">
                    {/* View Buttons - Show separate buttons for each version */}
                    {template.versions && template.versions.length > 0 ? (
                      <div className="flex gap-1">
                        {template.versions.map((version) => (
                          <Button
                            key={version}
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 text-xs px-2"
                            onClick={() =>
                              handleViewTemplate(template, version)
                            }
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {version}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90"
                        onClick={() => handleViewTemplate(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="blue"
                      className="bg-white/90"
                      onClick={() => handleCreatePageWithTemplate(template)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 py-0 flex flex-col justify-between gap-4 h-full">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <CardDescription className="mb-3 line-clamp-2">
                  {template.description}
                </CardDescription>

                {/* Version Information */}
                {template.versions && template.versions.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Versions:
                      </span>
                      <div className="flex gap-1">
                        {template.versions.map((version, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {version}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {/* View Buttons - Show separate buttons for each version */}
                {template.versions && template.versions.length > 0 ? (
                  <div className="flex gap-1">
                    {template.versions.map((version, index) => (
                      <Button
                        key={version}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleViewTemplate(template, version)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View {version}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleViewTemplate(template)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                )}

                {/* Use Button */}
                <Button
                  variant="blue"
                  size="sm"
                  className="w-full"
                  onClick={() => handleCreatePageWithTemplate(template)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Use
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
