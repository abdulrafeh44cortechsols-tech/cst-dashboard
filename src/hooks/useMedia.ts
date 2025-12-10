import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { mediaService, UploadMediaData } from "@/services/media";
import { useMediaStore } from "@/stores";

export const useMedia = (page: number = 1, pageSize: number = 10, enableFetch: boolean = true) => {
  const queryClient = useQueryClient();
  const { setMedia } = useMediaStore();

  const getMediaList = useQuery({
    queryKey: ["media", page, pageSize],
    queryFn: () => mediaService.getMedia(page, pageSize),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: enableFetch, // Only fetch if enableFetch is true
  });

  // Store media in Zustand store when data is fetched
  useEffect(() => {
    if (getMediaList.data) {
      setMedia(getMediaList.data);
    }
  }, [getMediaList.data, setMedia]);

  const uploadMedia = useMutation({
    mutationFn: (data: UploadMediaData) => mediaService.uploadMedia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });

  const uploadMultipleMedia = useMutation({
    mutationFn: (files: UploadMediaData[]) => mediaService.uploadMultipleMedia(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });

  const deleteMedia = useMutation({
    mutationFn: (id: number) => mediaService.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });

  return {
    getMediaList,
    uploadMedia,
    uploadMultipleMedia,
    deleteMedia,
  };
};