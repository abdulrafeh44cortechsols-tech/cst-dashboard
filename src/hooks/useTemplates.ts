import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templateService } from "@/services/templates";
import { Template, TemplateType } from "@/types/types";

// Transform template types to template format for display
const transformTemplateTypesToTemplates = (templateTypes: TemplateType[]): Template[] => {
  return templateTypes.map((templateType, index) => ({
    id: index + 1,
    name: templateType.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: `${templateType.name.replace(/_/g, ' ')} template with ${templateType.versions.length} version${templateType.versions.length > 1 ? 's' : ''} available.`,
    category: getCategoryFromTemplateName(templateType.name),
    preview: "/api/placeholder/400/300",
    rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
    downloads: Math.floor(Math.random() * 2000) + 500, // Random downloads between 500-2500
    isNew: templateType.versions.includes('v1') && templateType.versions.length === 1,
    isPopular: templateType.versions.length > 1,
    tags: [templateType.name, ...templateType.versions],
    author: "CortechSols",
    lastUpdated: new Date().toISOString().split('T')[0],
    version: templateType.versions[0] || "v1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    template_type: templateType.name,
    versions: templateType.versions,
  }));
};

// Helper function to determine category from template name
const getCategoryFromTemplateName = (name: string): string => {
  if (name.includes('homepage')) return 'Homepage';
  if (name.includes('service')) return 'Services';
  if (name.includes('blog')) return 'Blog';
  if (name.includes('about')) return 'About';
  if (name.includes('contact')) return 'Contact';
  if (name.includes('case_study') || name.includes('case_studies')) return 'Projects';
  if (name.includes('industry')) return 'Industry';
  return 'Other';
};

export const useTemplates = (page: number = 1, limit: number = 6) => {
  const queryClient = useQueryClient();

  const getTemplatesList = useQuery({
    queryKey: ["templates", page, limit],
    queryFn: async () => {
      try {
        const response = await templateService.getTemplateTypes();
        const templateTypes = response.data.templates;
        const transformedTemplates = transformTemplateTypesToTemplates(templateTypes);
        
        return {
          templates: transformedTemplates.slice((page - 1) * limit, page * limit),
          totalPages: Math.ceil(transformedTemplates.length / limit),
          totalTemplates: transformedTemplates.length,
        };
      } catch (error) {
        console.error("API failed, using dummy templates...", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    retry: 1,
  });

  const addTemplate = useMutation({
    mutationFn: templateService.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  return {
    getTemplatesList,
    addTemplate,
  };
}; 