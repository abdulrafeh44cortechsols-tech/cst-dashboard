import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { pageService } from "@/services/pages";
import type { Page } from "@/types/types";
import { usePageStore } from "@/stores";
import type { CreatePageData } from "@/services/pages";
import type { TemplateTypesResponse } from "@/types/types";

export const usePages = () => {
  const queryClient = useQueryClient();
  const { setPages } = usePageStore();

  const getPagesList = useQuery<Page[]>({
    queryKey: ["pages"],
    queryFn: async () => {
      try {
        const response = await pageService.getPages();
        return response.data;
      } catch (error) {
        console.error("Error fetching pages:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Store pages in Zustand store when data is fetched
  useEffect(() => {
    if (getPagesList.data) {
      setPages(getPagesList.data);
    }
  }, [getPagesList.data, setPages]);

  const addPage = useMutation({
    mutationFn: pageService.createPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
    onError: (error) => {
      console.error("Error creating page:", error);
    },
  });

  const editPage = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      pageService.updatePage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  const removePage = useMutation({
    mutationFn: pageService.deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  return {
    getPagesList,
    addPage,
    editPage,
    removePage,
  };
};

export const useTemplateTypes = () => {
  return useQuery({
    queryKey: ["templateTypes"],
    queryFn: pageService.getTemplateTypes,
  });
}; 