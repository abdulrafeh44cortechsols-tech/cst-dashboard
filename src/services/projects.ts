import api from "@/lib/api";

import type { Project, CreateProjectData } from "@/types/types";

export const projectsDataService = {
  // Fetch paginated projects from backend
  getProjects: async (
    page: number = 1,
    limit: number = 10
  ): Promise<{ count: number; next: string | null; previous: string | null; results: Project[] }> => {
    const response = await api.get("/api/v1/sols-projects/", {
      params: { page },
    });
    console.log("GET PROJECTS RESPONSE:", response.data);
    return response.data;
  },

  // Fetch a single project by ID
  getProject: async (id: string | number): Promise<Project> => {
    const response = await api.get(`/api/v1/sols-projects/${id}/`);
    return response.data;
  },

  // Fetch a single project by slug (finds ID from slug, then fetches by ID)
  getProjectBySlug: async (slug: string): Promise<Project> => {
    // First, get all projects to find the one with matching slug
    const projectsResponse = await api.get("/api/v1/sols-projects/", {
      params: { page: 1, limit: 1000 } // Get a large number to find the project
    });

    const projects = projectsResponse.data.results || [];
    const projectWithSlug = projects.find((project: any) => project.slug === slug);

    if (!projectWithSlug) {
      throw new Error(`Project with slug "${slug}" not found`);
    }

    // Now fetch the full project data using the ID with existing endpoint
    return await projectsDataService.getProject(projectWithSlug.id);
  },

  createProject: async (data: FormData | CreateProjectData): Promise<Project> => {
    const response = await api.post("/api/v1/sols-projects/", data);
    console.log("create project:", response.data);
    return response.data;
  },

  updateProject: async (id: string | number, data: FormData | CreateProjectData): Promise<Project> => {
    const response = await api.patch(`/api/v1/sols-projects/${id}/`, data);
    console.log("update project:", response.data);
    return response.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/sols-projects/${id}/`);
  },

  // Check if slug is available
  checkSlugAvailability: async (slug: string, type: string = 'project'): Promise<{ message: string }> => {
    const response = await api.get('/api/v1/sols-slug-check/', {
      params: { slug, type }
    })
    return response.data
  },
}; 