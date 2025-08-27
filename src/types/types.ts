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
  

  export interface Service {
    id: string;
    title: string;
    slug: string;
    description: string;
    meta_title: string;
    meta_description: string;
    images: string[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    author_name: string;
    author_email: string;
  }

  
  export interface Page {
    id: string;
    title: string;
    slug: string;
    content: string;
    meta_title: string;
    meta_description: string;
    og_image: string | null;
    is_published: boolean;
    is_homepage: boolean;
    template: string;
    created_at: string;
    updated_at: string;
    author_email: string;
    seo_keywords: string[];
    page_order: number;
  } 

  export interface Template {
    id: number;
    name: string;
    description: string;
    category: string;
    preview: string;
    rating: number;
    downloads: number;
    isNew?: boolean;
    isPopular?: boolean;
    tags?: string[];
    author?: string;
    lastUpdated?: string;
    version?: string;
    created_at: string;
    updated_at: string;
    content?: string;
    thumbnail?: string;
    file_url?: string;
    template_type?: string;
    versions?: string[];
  } 


  export interface Editor {
    id: string
    username: string
    email: string
    is_active: boolean
    created_by_username: string
    created_at: string
    updated_at: string
  }
  
  export interface CreateEditorData {
    username: string
    email: string
    password:string
  }

  export interface Tag {
    id: number;
    name: string;
    slug: string;
    blog_count: number;
    created_at?: string;
    updated_at?: string;
  }

export interface TemplateType {
  name: string;
  versions: string[];
}

export interface TemplateTypesResponse {
  message: string;
  data: {
    templates: TemplateType[];
  };
}