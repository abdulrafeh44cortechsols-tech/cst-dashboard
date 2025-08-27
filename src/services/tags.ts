import api from "@/lib/api"
import { type Tag } from "@/types/types"

interface TagsResponse {
  status: string;
  message: string;
  data: Tag[];
  count: number;
}

export const tagService = {
  getTags: async (): Promise<TagsResponse> => {
    const response = await api.get("/api/v1/tags/")
    return response.data
  },
} 