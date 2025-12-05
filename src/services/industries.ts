import api from "@/lib/api";

import type { Industry, CreateIndustryData } from "@/types/types";

export const industriesDataService = {
  // Fetch paginated industries from backend
  getIndustries: async (
    page: number = 1,
    limit: number = 10
  ): Promise<{ count: number; next: string | null; previous: string | null; results: Industry[] }> => {
    const response = await api.get("/api/v1/sols-industries/", {
      params: { page },
    });
    console.log("GET INDUSTRIES RESPONSE:", response.data);
    return response.data;
  },

  // Fetch a single industry by ID
  getIndustry: async (id: string | number): Promise<Industry> => {
    const response = await api.get(`/api/v1/sols-industries/${id}/`);
    console.log("GET INDUSTRY RESPONSE:", response.data);
    return response.data;
  },

  // Fetch a single industry by slug
  getIndustryBySlug: async (slug: string): Promise<Industry> => {
    console.log("GETTING INDUSTRY BY SLUG:", slug);
    // First, get all industries to find the one with matching slug
    const industriesResponse = await api.get("/api/v1/sols-industries/", {
      params: { page: 1, limit: 1000 }
    });

    const industries = industriesResponse.data.results || [];
    console.log("ALL INDUSTRIES:", industries);
    const industryWithSlug = industries.find((industry: any) => industry.slug === slug);

    if (!industryWithSlug) {
      throw new Error(`Industry with slug "${slug}" not found`);
    }

    console.log("FOUND INDUSTRY:", industryWithSlug);
    // Now fetch the full industry data using the ID
    return await industriesDataService.getIndustry(industryWithSlug.id);
  },

  createIndustry: async (data: FormData | CreateIndustryData): Promise<Industry> => {
    const response = await api.post("/api/v1/sols-industries/", data);
    console.log("CREATE INDUSTRY RESPONSE:", response.data);
    return response.data;
  },

  updateIndustry: async (id: string | number, data: FormData | CreateIndustryData): Promise<Industry> => {
    const response = await api.patch(`/api/v1/sols-industries/${id}/`, data);
    console.log("UPDATE INDUSTRY RESPONSE:", response.data);
    return response.data;
  },

  deleteIndustry: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/sols-industries/${id}/`);
  },

  // Check if slug is available
  checkSlugAvailability: async (slug: string, type: string = 'industry'): Promise<{ message: string }> => {
    const response = await api.get('/api/v1/sols-slug-check/', {
      params: { slug, type }
    })
    return response.data
  },
};