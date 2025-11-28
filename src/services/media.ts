import api from "@/lib/api"

export interface MediaItem {
  id: number;
  image: string;
  alt_text: string;
  created_at: string;
  updated_at: string;
}

export interface MediaResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MediaItem[];
}

export interface UploadMediaData {
  image: File;
  alt_text: string;
}

export const mediaService = {
  // Get paginated media with page_size=10
  getMedia: async (page: number = 1, page_size: number = 10): Promise<MediaResponse> => {
    const response = await api.get("/api/v1/sols-media/", {
      params: { page, page_size }
    });
    return response.data;
  },

  // Upload single media file
  uploadMedia: async (data: UploadMediaData): Promise<MediaItem> => {
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('alt_text', data.alt_text);

    const response = await api.post("/api/v1/sols-media/", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload multiple media files
  uploadMultipleMedia: async (files: UploadMediaData[]): Promise<MediaItem[]> => {
    const uploadPromises = files.map(file => mediaService.uploadMedia(file));
    return Promise.all(uploadPromises);
  },
}