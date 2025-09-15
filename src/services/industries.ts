import api from "@/lib/api";

import type { Industry, CreateIndustryData } from "@/types/types";

export const industriesDataService = {
  getIndustries: async (): Promise<Industry[]> => {
    const response = await api.get("/api/v1/industries/");
    console.log("GET INDUSTRIES RESPONSE:", response.data);
    return response.data.data;
  },

  createIndustry: async (data: FormData | CreateIndustryData): Promise<Industry> => {
    const response = await api.post("/api/v1/industries/", data);
    return response.data;
  },

  updateIndustry: async (id: string, data: FormData | CreateIndustryData): Promise<Industry> => {
    const response = await api.patch(`/api/v1/industries/${id}/`, data);
    return response.data;
  },

  deleteIndustry: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/industries/${id}/`);
  },
}; 