import api from "@/lib/api";

import type { Service, CreateServiceData } from "@/types/types";

export const servicesDataService = {
  getServices: async (): Promise<Service[]> => {
    const response = await api.get("/api/v1/services/");
    console.log("GETTT THOSE SERVICESSSSS")
    return response.data.data;
  },

  // Fetch a single service by ID and normalize payload
  getService: async (id: string | number): Promise<Service> => {
    const response = await api.get(`/api/v1/services/${id}/`);
    const payload = response.data;
    const raw = payload?.data ?? payload;

    const normalized: Service = {
      id: raw.id,
      title: raw.title || "",
      slug: raw.slug || "",
      description: raw.description || "",
      meta_title: raw.meta_title || "",
      meta_description: raw.meta_description || "",
      images: Array.isArray(raw.images) ? raw.images : [],
      image_alt_text: raw.image_alt_text || [],
      is_active: !!raw.is_active,
      created_at: raw.created_at || new Date().toISOString(),
      updated_at: raw.updated_at || new Date().toISOString(),
      author_name: raw.author_name || "",
      author_email: raw.author_email || "",
      sections_data: raw.sections_data || raw.sections || undefined,
    } as Service;

    return normalized;
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
    await api.delete(`/api/v1/services/${id}/`);
  },
};
