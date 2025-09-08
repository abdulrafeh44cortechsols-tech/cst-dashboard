import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { blogService } from "@/services/blogs";
import { BlogPost, CreateBlogData } from "@/types/types";
import { getPaginatedBlogPosts } from "@/actions/blog";
import { useBlogStore } from "@/stores";

export const useBlogs = (page: number = 1, limit: number = 6) => {
  const queryClient = useQueryClient();
  const { setBlogs } = useBlogStore();

  const getBlogsList = useQuery({
    queryKey: ["blogs", page, limit],
    queryFn: async () => {
      try {
        const response:any = await blogService.getBlogs();
        console.log("response for get blogs list:", response.data);
        return {
          posts: response.data.slice((page - 1) * limit, page * limit), // manual pagination if backend doesn't do it
          totalPages: Math.ceil(response.data.length / limit),
          allBlogs: response.data, // Store all blogs for the store
        };
      } catch (error) {
        console.error("API failed, using dummy blog posts...", error);
        // Fallback to dummy data
        const fallbackData = await getPaginatedBlogPosts({ page, limit });
        return {
          ...fallbackData,
          allBlogs: fallbackData.posts, // Use fallback posts as all blogs
        };
      }
    },
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    retry: 0, // don't retry multiple times (we have fallback)
  });

  // Store blogs in Zustand store when data is fetched
  useEffect(() => {
    if (getBlogsList.data?.allBlogs) {
      setBlogs(getBlogsList.data.allBlogs);
    }
  }, [getBlogsList.data, setBlogs]);

  const addBlog = useMutation({
    mutationFn: (data: FormData | CreateBlogData) => blogService.createBlog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });

  const editBlog = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData | CreateBlogData }) =>
      blogService.updateBlog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });

  const removeBlog = useMutation({
    mutationFn: blogService.deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });

  return {
    getBlogsList,
    addBlog,
    editBlog,
    removeBlog,
  };
};
