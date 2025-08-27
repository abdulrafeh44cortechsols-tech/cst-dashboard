import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { mediaService } from "@/services/media";
import { useMediaStore } from "@/stores";

export const useMedia = () => {
  const { setMedia } = useMediaStore();

  const getMediaList = useQuery({
    queryKey: ["media"],
    queryFn: mediaService.getMedia,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Store media in Zustand store when data is fetched
  useEffect(() => {
    if (getMediaList.data) {
      setMedia(getMediaList.data);
    }
  }, [getMediaList.data, setMedia]);

  return {
    getMediaList,
  };
}; 