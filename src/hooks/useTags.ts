import { useQuery } from "@tanstack/react-query";
import { tagService } from "@/services/tags";
import { Tag } from "@/types/types";

interface TagsResponse {
  status: string;
  message: string;
  data: Tag[];
  count: number;
}

export const useTags = () => {
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
  });

  return {
    getTags,
  };
}; 