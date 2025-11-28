import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { blogService } from "@/services/blogs";
import { BlogPost, CreateBlogData } from "@/types/types";
import { useBlogStore } from "@/stores";

export const useBlogs = (page: number = 1, limit: number = 6, enableFetch: boolean = true) => {
  const queryClient = useQueryClient();
  const { setBlogs } = useBlogStore();

  const getBlogsList = useQuery({
    queryKey: ["blogs", page, limit],
    queryFn: async () => {
      try {
        // Fetch paginated data from backend
        const paginated = await blogService.getBlogs(page, limit);

        const blogs: BlogPost[] = Array.isArray(paginated?.results)
          ? paginated.results
          : [];

        const count = typeof paginated?.count === "number" ? paginated.count : blogs.length;

        // Infer total pages from backend data to avoid mismatches when the server uses a different page size
        let inferredTotalPages = 1;
        if (blogs.length > 0) {
          if (paginated.next) {
            // Not the last page; assume current page size is the server page size
            inferredTotalPages = Math.max(1, Math.ceil(count / blogs.length));
          } else {
            // Last page -> total pages equals current page index
            inferredTotalPages = Math.max(1, page);
          }
        }

        return {
          posts: blogs,
          totalPages: inferredTotalPages,
          allBlogs: blogs,
        };
      } catch (error) {
        console.error("API failed, using dummy blog posts...", error);
        // Optionally return empty fallback so hook always returns valid structure
        return {
          posts: [],
          totalPages: 0,
          allBlogs: [],
        };
      }
    },
    enabled: enableFetch, // Only fetch if explicitly enabled
    staleTime: 0, // Always consider data stale to refetch after invalidation
    gcTime: 1000 * 60 * 15, // 15 minutes - keep in cache longer
    retry: 0,
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
    refetchOnMount: true, // Refetch when component mounts if data is stale
  });
  
  // Store blogs in Zustand store when data is fetched
  useEffect(() => {
    if (getBlogsList.data?.allBlogs) {
      setBlogs(getBlogsList.data.allBlogs);
    }
  }, [getBlogsList.data, setBlogs]);

  const addBlog = useMutation({
    mutationFn: (data: CreateBlogData) => blogService.createBlog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
  });

  const editBlog = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: CreateBlogData }) =>
      blogService.updateBlog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
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
