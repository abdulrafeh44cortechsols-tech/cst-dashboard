import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { servicesDataService } from "@/services/services";
import type { Service, CreateServiceData } from "@/types/types";
import { useServiceStore } from "@/stores";

export const useServices = () => {
  const queryClient = useQueryClient();
  const { setServices } = useServiceStore();

  const getServicesList = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: servicesDataService.getServices,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Store services in Zustand store when data is fetched
  useEffect(() => {
    if (getServicesList.data) {
      setServices(getServicesList.data);
    }
  }, [getServicesList.data, setServices]);

  const addService = useMutation({
    mutationFn: (data: FormData | CreateServiceData) => servicesDataService.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const editService = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData | CreateServiceData }) =>
      servicesDataService.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const removeService = useMutation({
    mutationFn: servicesDataService.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  return {
    getServicesList,
    addService,
    editService,
    removeService,
  };
};
