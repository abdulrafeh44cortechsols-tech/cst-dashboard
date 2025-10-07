import api from "@/lib/api"

import { type BlogPost, CreateBlogData } from "@/types/types"

export const blogService = {
  // Fetch paginated blogs from backend and return the backend shape
  getBlogs: async (
    page: number = 1,
    limit: number = 10
  ): Promise<{ count: number; next: string | null; previous: string | null; results: BlogPost[] }> => {
    const response = await api.get("/api/v1/blogs/", {
      params: { page },
    })
    return response.data
  },

  // Fetch a single blog by ID
  getBlog: async (id: string | number): Promise<BlogPost> => {
    const response = await api.get(`/api/v1/blogs/${id}/`)
    const payload = response.data
    const raw = payload?.data ?? payload

    // Normalize to BlogPost shape expected by UI/forms
    const normalized: BlogPost = {
      id: raw.id,
      title: raw.title || "",
      slug: raw.slug || "",
      content: raw.content || "",
      images: Array.isArray(raw.images) ? raw.images : [],
      image_files: null,
      published: !!raw.published,
      created_at: raw.created_at || new Date().toISOString(),
      updated_at: raw.updated_at || new Date().toISOString(),
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      summary: raw.summary ?? "",
      author_email: raw.author_email || "",
      tag_ids: Array.isArray(raw.tags) ? raw.tags.map((t: any) => t.id) : [],
      meta_title: raw.meta_title || "",
      meta_description: raw.meta_description || "",
      og_image_file: null,
      og_image: raw.og_image || null, // Add og_image URL from backend
      sections_data: raw.sections || raw.sections_data || {},
      info_section: raw.info_section,
      hero_section: raw.hero_section,
    }

    return normalized
  },

  createBlog: async (data: FormData | CreateBlogData): Promise<BlogPost> => {
    const response = await api.post("/api/v1/blogs/", data)
    console.log("create blog:",response.data)
    return response.data
  },

  updateBlog: async (id: string, data: FormData | CreateBlogData): Promise<BlogPost> => {
    const response = await api.patch(`/api/v1/blogs/${id}/`, data)
    return response.data
  },

  deleteBlog: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/blogs/${id}/`)
  },
}
