export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_email: string;
}
