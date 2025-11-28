import api from "@/lib/api"
import { type Tag } from "@/types/types"

interface TagsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tag[];
}

interface CreateTagResponse {
  status: string;
  message: string;
  data: Tag;
}

interface DeleteTagResponse {
  status: string;
  message: string;
}

interface CreateTagRequest {
  name: string;
}

export const tagService = {
  getTags: async (): Promise<TagsResponse> => {
    const response = await api.get("/api/v1/sols-tags/")
    return response.data
  },

  createTag: async (tagData: CreateTagRequest): Promise<CreateTagResponse> => {
    const response = await api.post("/api/v1/sols-tags/", tagData)
    return response.data
  },

  deleteTag: async (id: number): Promise<DeleteTagResponse> => {
    const response = await api.delete(`/api/v1/sols-tags/${id}/`)
    return response.data
  },
} 