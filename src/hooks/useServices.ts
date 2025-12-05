import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { servicesDataService } from "@/services/services";
import type { Service, CreateServiceData } from "@/types/types";
import { useServiceStore } from "@/stores";

export const useServices = (page: number = 1, pageSize: number = 10, enableFetch: boolean = true) => {
  const queryClient = useQueryClient();
  const { setServices } = useServiceStore();

  const getServicesList = useQuery<Service[]>({
    queryKey: ["services", page, pageSize],
    queryFn: async () => {
      // Use new API endpoint
      const response = await servicesDataService.getServicesV2(page, pageSize);

      // Return the API response directly - it matches the Service interface now
      return response.results.map((item: any) => ({
        id: item.id.toString(), // Convert number to string
        title: item.title || item.name, // Prioritize title
        name: item.name || item.title, // Keep name for backward compatibility
        slug: item.slug,
        description: item.description,
        meta_title: item.meta_title,
        meta_description: item.meta_description,
        images: item.hero_image ? [item.hero_image.image] : [],
        image_alt_texts: item.hero_image ? [item.hero_image.alt_text] : [],
        is_published: item.is_published, // Use is_published from API
        hero_image: item.hero_image, // Include hero_image object
        projects_delivered: item.projects_delivered,
        clients_satisfaction: item.clients_satisfaction,
        bullet_points: item.bullet_points,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        created_by: item.created_by || null, // Map created_by from API
        author_name: item.created_by || "",
        author_email: "",
        sections_data: undefined,
      } as Service));
    },
    enabled: enableFetch, // Only fetch if explicitly enabled
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
    retry: 1,
    refetchOnWindowFocus: true, // Refetch when switching tabs
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Store services in Zustand store when data is fetched
  useEffect(() => {
    if (getServicesList.data) {
      setServices(getServicesList.data);
    }
  }, [getServicesList.data, setServices]);

  const addService = useMutation({
    mutationFn: (data: FormData | CreateServiceData) => servicesDataService.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const editService = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData | CreateServiceData }) =>
      servicesDataService.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const removeService = useMutation({
    mutationFn: servicesDataService.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  return {
    getServicesList,
    addService,
    editService,
    removeService,
  };
};
