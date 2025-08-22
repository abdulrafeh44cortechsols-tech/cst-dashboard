import api from "@/lib/api"

import { type BlogPost } from "@/types/blog"

export const blogService = {
  getBlogs: async (): Promise<BlogPost[]> => {
    const response = await api.get("/api/v1/blogs/")
    return response.data
  },

  createBlog: async (data:FormData): Promise<BlogPost> => {
    const response = await api.post("/api/v1/blogs/", data)
    console.log("create blog:",response.data)
    return response.data
  },

  updateBlog: async (id: string, data: FormData): Promise<BlogPost> => {
    const response = await api.patch(`/api/v1/blogs/${id}/`, data)
    return response.data
  },

  deleteBlog: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/blogs/${id}/`)
  },
}
