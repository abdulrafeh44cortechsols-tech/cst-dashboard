import api from "@/lib/api"

import type { Editor, CreateEditorData } from "@/types/types"

export const editorService = {
  getEditors: async (): Promise<Editor[]> => {
    const response = await api.get("/api/v1/editors/")
    return response.data.data
  },

  createEditor: async (data: CreateEditorData): Promise<Editor> => {
    const response = await api.post("/api/v1/editors/", data)
    return response.data
  },

  updateEditor: async (id: string, data: CreateEditorData): Promise<Editor> => {
    const response = await api.put(`/api/v1/editors/${id}/`, data)
    return response.data
  },

  deleteEditor: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/editors/${id}/`)
  },
}
