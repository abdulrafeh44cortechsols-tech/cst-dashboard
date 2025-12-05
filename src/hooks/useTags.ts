import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagService } from "@/services/tags";
import { Tag } from "@/types/types";

interface TagsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tag[];
}

interface CreateTagRequest {
  name: string;
}

export const useTags = () => {
  const queryClient = useQueryClient();

  const getTags = useQuery<TagsResponse>({
    queryKey: ["tags"],
    queryFn: async () => {
      try {
        const response = await tagService.getTags();
        console.log("response for get tags:", response);
        return response;
      } catch (error) {
        console.error("API failed to fetch tags...", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    retry: 1,
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
  });

  const createTag = useMutation({
    mutationFn: async (tagData: CreateTagRequest) => {
      try {
        const response = await tagService.createTag(tagData);
        console.log("response for create tag:", response);
        return response;
      } catch (error) {
        console.error("API failed to create tag...", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch tags after successful creation
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const deleteTag = useMutation({
    mutationFn: async (id: number) => {
      try {
        const response = await tagService.deleteTag(id);
        console.log("response for delete tag:", response);
        return response;
      } catch (error) {
        console.error("API failed to delete tag...", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch tags after successful deletion
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  return {
    getTags,
    createTag,
    deleteTag,
  };
}; 