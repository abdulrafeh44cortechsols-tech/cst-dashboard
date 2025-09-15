import api from "@/lib/api";

import type { Project, CreateProjectData } from "@/types/types";

export const projectsDataService = {
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get("/api/v1/projects/");
    console.log("GET PROJECTS RESPONSE:", response.data);
    return response.data.data;
  },

  createProject: async (data: FormData | CreateProjectData): Promise<Project> => {
    const response = await api.post("/api/v1/projects/", data);
    return response.data;
  },

  updateProject: async (id: string, data: FormData | CreateProjectData): Promise<Project> => {
    const response = await api.patch(`/api/v1/projects/${id}/`, data);
    return response.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/projects/${id}/`);
  },
}; 