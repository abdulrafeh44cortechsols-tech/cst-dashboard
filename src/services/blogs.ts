import api from "@/lib/api"

import { type BlogPost, CreateBlogData } from "@/types/types"

export const blogService = {
  // Fetch paginated blogs from backend and return the backend shape
  getBlogs: async (
    page: number = 1,
    limit: number = 10
  ): Promise<{ count: number; next: string | null; previous: string | null; results: BlogPost[] }> => {
    const response = await api.get("/api/v1/sols-blogs/", {
      params: { page },
    })
    return response.data
  },

  // Fetch a single blog by ID
  getBlog: async (id: string | number): Promise<BlogPost> => {
    const response = await api.get(`/api/v1/sols-blogs/${id}/`)
    return response.data
  },

  // Fetch a single blog by slug (finds ID from slug, then fetches by ID)
  getBlogBySlug: async (slug: string): Promise<BlogPost> => {
    // First, get all blogs to find the one with matching slug
    const blogsResponse = await api.get("/api/v1/sols-blogs/", {
      params: { page: 1, limit: 1000 } // Get a large number to find the blog
    });

    const blogs = blogsResponse.data.results || [];
    const blogWithSlug = blogs.find((blog: any) => blog.slug === slug);

    if (!blogWithSlug) {
      throw new Error(`Blog with slug "${slug}" not found`);
    }

    // Now fetch the full blog data using the ID with existing endpoint
    return await blogService.getBlog(blogWithSlug.id);
  },

  createBlog: async (data: CreateBlogData): Promise<BlogPost> => {
    const response = await api.post("/api/v1/sols-blogs/", data, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log("create blog:", response.data)
    return response.data
  },

  updateBlog: async (id: string | number, data: CreateBlogData): Promise<BlogPost> => {
    const response = await api.patch(`/api/v1/sols-blogs/${id}/`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log("update blog:", response.data)
    return response.data
  },

  deleteBlog: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/sols-blogs/${id}/`)
  },

  // Check if slug is available
  checkSlugAvailability: async (slug: string, type: string = 'blog'): Promise<{ message: string }> => {
    const response = await api.get('/api/v1/sols-slug-check/', {
      params: { slug, type }
    })
    return response.data
  },
}
