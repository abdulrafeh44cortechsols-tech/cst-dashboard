import api from "@/lib/api"

export interface MediaResponse {
  data: {
    blogs: {
      [key: string]: string[]
    }
    services: {
      [key: string]: string[]
    }
  }
}

export const mediaService = {
  getMedia: async (): Promise<MediaResponse> => {
    const response = await api.get("/api/v1/media/")
    return response.data
  },
} 