import api from "@/lib/api";

import type { Service } from "@/types/types";

export const servicesDataService = {
  getServices: async (): Promise<Service[]> => {
    const response = await api.get("/api/v1/services/");
    console.log("GETTT THOSE SERVICESSSSS")
    return response.data.data;
  },

  createService: async (data: FormData): Promise<Service> => {
    const response = await api.post("/api/v1/services/", data);
    return response.data;
  },

  updateService: async (id: string, data: FormData): Promise<Service> => {
    const response = await api.patch(`/api/v1/services/${id}/`, data);
    return response.data;
  },

  deleteService: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/services/${id}/`);
  },
};
