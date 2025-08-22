export interface BlogPost {
  id: number;
  title: string;
  images: string[] | null;
  image_files: File[] | null; 
  published: boolean;
  created_at: string;
  updated_at: string;
  tags: {
    id: number;
    name: string;
  }[];
  summary: string;
  author_email: string;
  slug: string;

  tag_ids: number[];
  meta_title: string;
  meta_description: string;
  og_image_file: string | null;
  content: string;
}
