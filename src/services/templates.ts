import api from "@/lib/api"
import { type Template, type TemplateTypesResponse } from "@/types/types"

export const templateService = {
  getTemplates: async (): Promise<Template[]> => {
    const response = await api.get("/api/v1/templates/")
    return response.data
  },

  getTemplateTypes: async (): Promise<TemplateTypesResponse> => {
    const response = await api.get("/api/v1/pages/template_types/")
    return response.data
  },

  createTemplate: async (data: FormData): Promise<Template> => {
    const response = await api.post("/api/v1/templates/", data)
    console.log("create template:", response.data)
    return response.data
  },
} 