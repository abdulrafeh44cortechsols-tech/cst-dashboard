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
    sections_data?: BlogSectionsData;
    info_section?: BlogSection;
    hero_section?: BlogSection;
  }

  export interface BlogSectionsData {
    hero_section?: HeroSection;
    quote_section?: QuoteSection;
    info_section?: InfoSection;
    [key: string]: any;
  }

  export interface HeroSection {
    title: string;
    description: string;
    summary: string;
    image: File | null;
  }

  export interface QuoteSection {
    summary: string;
    quotes: Quote[];
  }

  export interface Quote {
    title: string;
    description: string;
    quote: string;
    quoteusername: string;
  }

  export interface InfoSection {
    title: string;
    description: string;
    summary: string;
    summary_2: string;
    image: File | null;
  }

  export interface BlogSection {
    title?: string;
    description?: string;
    content?: string;
    image?: string;
    image_file?: File;
    [key: string]: any;
  }

  export interface CreateBlogData {
    title: string;
    content: string;
    published: boolean;
    tag_ids: number[];
    image_files: File[];
    meta_title: string;
    meta_description: string;
    og_image_file?: File;
    sections_data?: BlogSectionsData;
    hero_section?: HeroSection;
    quote_section?: QuoteSection;
    info_section?: InfoSection;
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
    sections_data?: ServiceSectionsData;
  }

  export interface ServiceSectionsData {
    hero_section: ServiceSection;
    about_section: ServiceSection;
    why_choose_us_section: ServiceSection;
    what_we_offer_section: ServiceSection;
    perfect_business_section: ServiceSection;
    design_section: ServiceSection;
    team_section: TeamSection;
    tools_used_section: ServiceSection;
    client_feedback_section: ClientFeedbackSection;
  }

  export interface ServiceSection {
    title: string;
    description: string;
    sub_sections: SubSection[];
  }

  export interface SubSection {
    title: string;
    description: string;
    points?: string[];
  }

  export interface TeamSection {
    title: string;
    description: string;
    sub_sections: TeamMember[];
  }

  export interface TeamMember {
    name: string;
    designation: string;
    experience: string;
    summary: string;
    points?: string[];
  }

  export interface ClientFeedbackSection {
    title: string;
    description: string;
    sub_sections: ClientFeedback[];
  }

  export interface ClientFeedback {
    name: string;
    designation: string;
    comment: string;
    stars: number;
    points?: string[];
  }

  export interface CreateServiceData {
    title: string;
    description: string;
    is_active: boolean;
    meta_title: string;
    meta_description: string;
    sections_data: ServiceSectionsData;
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