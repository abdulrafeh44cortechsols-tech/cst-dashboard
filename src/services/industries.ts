import api from "@/lib/api";

import type { Industry, CreateIndustryData } from "@/types/types";

export const industriesDataService = {
  getIndustries: async (): Promise<Industry[]> => {
    const response = await api.get("/api/v1/industries/");
    console.log("GET INDUSTRIES RESPONSE:", response.data);
    return response.data.data;
  },

  getIndustry: async (id: string | number): Promise<Industry> => {
    const response = await api.get(`/api/v1/industries/${id}/`);
    console.log("GET INDUSTRY RESPONSE:", response.data);
    return response.data.data;
  },

  getIndustryBySlug: async (slug: string): Promise<Industry> => {
    console.log("GETTING INDUSTRY BY SLUG:", slug);
    // First, get all industries to find the one with matching slug
    const industriesResponse = await api.get("/api/v1/industries/");

    const industries = industriesResponse.data.data || [];
    console.log("ALL INDUSTRIES:", industries);
    const industryWithSlug = industries.find((industry: any) => industry.slug === slug);

    if (!industryWithSlug) {
      throw new Error(`Industry with slug "${slug}" not found`);
    }

    console.log("FOUND INDUSTRY:", industryWithSlug);
    // Now fetch the full industry data using the ID with existing endpoint
    return await industriesDataService.getIndustry(industryWithSlug.id);
  },

  createIndustry: async (data: FormData | CreateIndustryData): Promise<Industry> => {
    const response = await api.post("/api/v1/industries/", data);
    console.log("CREATE INDUSTRY RESPONSE:", response.data);
    return response.data.data;
  },

  updateIndustry: async (id: string, data: FormData | CreateIndustryData): Promise<Industry> => {
    const response = await api.patch(`/api/v1/industries/${id}/`, data);
    console.log("UPDATE INDUSTRY RESPONSE:", response.data);
    return response.data.data;
  },

  deleteIndustry: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/industries/${id}/`);
  },
};