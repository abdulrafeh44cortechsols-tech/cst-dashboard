import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService } from "@/services/blogs";
import { BlogPost } from "@/types/blog";
import { getPaginatedBlogPosts } from "@/actions/blog";

export const useBlogs = (page: number = 1, limit: number = 6) => {
  const queryClient = useQueryClient();

  const getBlogsList = useQuery({
    queryKey: ["blogs", page, limit],
    queryFn: async () => {
      try {
        const response:any = await blogService.getBlogs();
        console.log("response for get blogs list:", response.data);
        return {
          posts: response.data.slice((page - 1) * limit, page * limit), // manual pagination if backend doesn't do it
          totalPages: Math.ceil(response.data.length / limit),
        };
      } catch (error) {
        console.error("API failed, using dummy blog posts...", error);
        // Fallback to dummy data
        return await getPaginatedBlogPosts({ page, limit });
      }
    },
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    retry: 0, // don't retry multiple times (we have fallback)
  });

  const addBlog = useMutation({
    mutationFn: blogService.createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });

  const editBlog = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
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
