import api from "@/lib/api"
import type { Page, TemplateTypesResponse } from "@/types/types";

export interface PagesResponse {
  message: string;
  data: Page[];
}

export interface CreatePageData {
  title: string;
  content: string;
  template_type: string;
  meta_title: string;
  meta_description: string;
  og_image_file?: File;
  is_published?: boolean;
  is_homepage?: boolean;
  seo_keywords?: string[];
  page_order?: number;
}

export const pageService = {
  getPages: async (): Promise<PagesResponse> => {
    const response = await api.get("/api/v1/pages/")
    return response.data
  },

  getTemplateTypes: async (): Promise<TemplateTypesResponse> => {
    const response = await api.get("/api/v1/pages/template_types/")
    return response.data
  },
  
  createPage: async (data: CreatePageData): Promise<Page> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`${key}[]`, String(item)));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    const response = await api.post("/api/v1/pages/", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updatePage: async (id: string, data: Partial<CreatePageData>): Promise<Page> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`${key}[]`, String(item)));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await api.patch(`/api/v1/pages/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePage: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/pages/${id}/`);
  },
} 