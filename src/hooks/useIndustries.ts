import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { industriesDataService } from "@/services/industries";
import type { Industry, CreateIndustryData } from "@/types/types";
import { useIndustryStore } from "@/stores";

interface IndustriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Industry[];
}

export const useIndustries = (page: number = 1, limit: number = 10) => {
  const queryClient = useQueryClient();
  const { setIndustries } = useIndustryStore();

  const getIndustriesList = useQuery<IndustriesResponse>({
    queryKey: ["industries", page],
    queryFn: () => industriesDataService.getIndustries(page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Store industries in Zustand store when data is fetched
  useEffect(() => {
    if (getIndustriesList.data?.results) {
      setIndustries(getIndustriesList.data.results);
    }
  }, [getIndustriesList.data, setIndustries]);

  const addIndustry = useMutation({
    mutationFn: (data: FormData | CreateIndustryData) => industriesDataService.createIndustry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industries"] });
    },
  });

  const editIndustry = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: FormData | CreateIndustryData }) =>
      industriesDataService.updateIndustry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industries"] });
    },
  });

  const removeIndustry = useMutation({
    mutationFn: industriesDataService.deleteIndustry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industries"] });
    },
  });

  return {
    getIndustriesList,
    addIndustry,
    editIndustry,
    removeIndustry,
  };
};