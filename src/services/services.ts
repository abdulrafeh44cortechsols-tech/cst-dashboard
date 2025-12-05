import api from "@/lib/api";

import type { Service, CreateServiceData } from "@/types/types";

export interface ServiceListItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  meta_title?: string;
  meta_description?: string;
  hero_image: {
    id: number;
    image: string;
    alt_text: string;
  } | null;
  projects_delivered: number;
  clients_satisfaction: number;
  bullet_points: string[];
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServicesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ServiceListItem[];
}

export const servicesDataService = {
  getServices: async (): Promise<Service[]> => {
    const response = await api.get("/api/v1/services/");
    console.log("GETTT THOSE SERVICESSSSS")
    return response.data.data;
  },

  // New API endpoint for getting services with pagination
  getServicesV2: async (page: number = 1, page_size: number = 10): Promise<ServicesResponse> => {
    const response = await api.get("/api/v1/sols-services/", {
      params: { page, page_size }
    });
    return response.data;
  },

  // Fetch a single service by ID and normalize payload
  getService: async (id: string | number): Promise<Service> => {
    const response = await api.get(`/api/v1/sols-services/${id}/`);
    const raw = response.data;

    const normalized: Service = {
      id: raw.id?.toString() || "",
      title: raw.title || raw.name || "",
      name: raw.name || raw.title || "",
      slug: raw.slug || "",
      description: raw.description || "",
      meta_title: raw.meta_title || "",
      meta_description: raw.meta_description || "",
      images: raw.hero_image ? [raw.hero_image.image] : [],
      image_alt_texts: raw.hero_image ? [raw.hero_image.alt_text] : [],
      is_published: !!raw.is_published,
      hero_image: raw.hero_image || null,
      projects_delivered: raw.projects_delivered,
      clients_satisfaction: raw.clients_satisfaction,
      bullet_points: raw.bullet_points || [],
      created_at: raw.created_at || new Date().toISOString(),
      updated_at: raw.updated_at || new Date().toISOString(),
      author_name: raw.author_name || "",
      author_email: raw.author_email || "",
      sections_data: raw.sections_data || raw.sections || undefined,
    } as Service;

    return normalized;
  },

  // Fetch a single service by slug (finds ID from slug, then fetches by ID)
  getServiceBySlug: async (slug: string): Promise<Service> => {
    // First, get all services to find the one with matching slug
    const servicesResponse = await api.get("/api/v1/services/");

    const services = servicesResponse.data.data || [];
    const serviceWithSlug = services.find((service: any) => service.slug === slug);

    if (!serviceWithSlug) {
      throw new Error(`Service with slug "${slug}" not found`);
    }

    // Now fetch the full service data using the ID with existing endpoint
    return await servicesDataService.getService(serviceWithSlug.id);
  },

  createService: async (data: FormData | CreateServiceData): Promise<Service> => {
    try {
      const response = await api.post("/api/v1/services/", data);
      return response.data;
    } catch (error: any) {
      // Just re-throw the error as-is to preserve response structure
      throw error;
    }
  },

  // New API endpoint for creating services with JSON payload
  createServiceV2: async (data: any): Promise<Service> => {
    try {
      const response = await api.post("/api/v1/sols-services/", data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Get service by ID using new API
  getServiceByIdV2: async (id: string | number): Promise<any> => {
    const response = await api.get(`/api/v1/sols-services/${id}/`);
    return response.data;
  },

  // Get service by slug using new API
  getServiceBySlugV2: async (slug: string): Promise<any> => {
    // First get all services to find the ID
    const response = await api.get("/api/v1/sols-services/", {
      params: { page: 1, page_size: 10 }
    });
    const service = response.data.results.find((s: any) => s.slug === slug);

    if (!service) {
      throw new Error(`Service with slug "${slug}" not found`);
    }

    // Then fetch the full service data
    return await servicesDataService.getServiceByIdV2(service.id);
  },

  // Update service using new API
  updateServiceV2: async (id: string | number, data: any): Promise<Service> => {
    try {
      const response = await api.patch(`/api/v1/sols-services/${id}/`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  updateService: async (id: string, data: FormData | CreateServiceData): Promise<Service> => {
    try {
      const response = await api.patch(`/api/v1/services/${id}/`, data);
      return response.data;
    } catch (error: any) {
      // Just re-throw the error as-is to preserve response structure
      throw error;
    }
  },

  deleteService: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/sols-services/${id}/`);
  },

  // Check if slug is available
  checkSlugAvailability: async (slug: string, type: string = 'service'): Promise<{ message: string }> => {
    const response = await api.get('/api/v1/sols-slug-check/', {
      params: { slug, type }
    })
    return response.data
  },
};
