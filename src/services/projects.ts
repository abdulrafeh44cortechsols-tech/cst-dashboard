import api from "@/lib/api";

import type { Project, CreateProjectData } from "@/types/types";

export const projectsDataService = {
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get("/api/v1/projects/");
    console.log("GET PROJECTS RESPONSE:", response.data);
    return response.data.data;
  },

  // Fetch a single project by ID
  getProject: async (id: string | number): Promise<Project> => {
    const response = await api.get(`/api/v1/projects/${id}/`);
    const payload = response.data;
    const raw = payload?.data ?? payload;
    return raw as Project;
  },

  // Fetch a single project by slug (finds ID from slug, then fetches by ID)
  getProjectBySlug: async (slug: string): Promise<Project> => {
    // First, get all projects to find the one with matching slug
    const projectsResponse = await api.get("/api/v1/projects/");
    
    const projects = projectsResponse.data.data || [];
    const projectWithSlug = projects.find((project: any) => project.slug === slug);
    
    if (!projectWithSlug) {
      throw new Error(`Project with slug "${slug}" not found`);
    }
    
    // Now fetch the full project data using the ID with existing endpoint
    return await projectsDataService.getProject(projectWithSlug.id);
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