import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { industriesDataService } from "@/services/industries";
import type { Industry, CreateIndustryData } from "@/types/types";
import { useIndustryStore } from "@/stores";

export const useIndustries = () => {
  const queryClient = useQueryClient();
  const { setIndustries } = useIndustryStore();

  const getIndustriesList = useQuery<Industry[]>({
    queryKey: ["industries"],
    queryFn: industriesDataService.getIndustries,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Store industries in Zustand store when data is fetched
  useEffect(() => {
    if (getIndustriesList.data) {
      setIndustries(getIndustriesList.data);
    }
  }, [getIndustriesList.data, setIndustries]);

  const addIndustry = useMutation({
    mutationFn: (data: FormData | CreateIndustryData) => industriesDataService.createIndustry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industries"] });
    },
  });

  const editIndustry = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData | CreateIndustryData }) =>
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