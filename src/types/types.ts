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
    og_image: string | null; // URL of existing OG image from backend
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
    image_alt_text?: string; // Add alt text for hero image
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
    image_alt_text?: string; // Add alt text for info image
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
    slug: string;
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
    image_alt_texts?: string[]; // Add alt text for main service images
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
    image_alt_text?: string[]; // Add alt text for service section images
  }

  export interface SubSection {
    title: string;
    description: string;
    points?: string[];
    image_alt_text?: string; // Add alt text for sub-section images/icons
  }

  export interface TeamSection {
    title: string;
    description: string;
    sub_sections: TeamMember[];
    image_alt_text?: string[]; // Add alt text for team section images
  }

  export interface TeamMember {
    name: string;
    designation: string;
    experience: string;
    summary: string;
    points?: string[];
    image_alt_text?: string; // Add alt text for team member images
  }

  export interface ClientFeedbackSection {
    title: string;
    description: string;
    sub_sections: ClientFeedback[];
    image_alt_text?: string[]; // Add alt text for client feedback section images
  }

  export interface ClientFeedback {
    name: string;
    designation: string;
    comment: string;
    stars: number;
    points?: string[];
    image_alt_text?: string; // Add alt text for client feedback images
  }

  export interface CreateServiceData {
    title: string;
    slug: string;
    description: string;
    is_active: boolean;
    meta_title: string;
    meta_description: string;
    sections_data: ServiceSectionsData;
    image_alt_text?: string[]; // Add alt text for main service images
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

export interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  image_alt_text?: string; // Add alt text for main project image
  published: boolean;
  created_at: string;
  updated_at: string;
  tags: {
    id: number;
    name: string;
  }[];
  author_email: string;
  canonical_url: string;
  sections_data?: Record<string, any>; 
}

export interface CreateProjectData {
  name: string;
  description: string;
  published: boolean;
  tag_ids: number[];
  image_files?: File[];
  image_alt_text?: string; // Add alt text for main project image
}

export interface Industry {
  id: number;
  name: string;
  slug: string;
  description: string;
  meta_title: string;
  meta_description: string;
  image: string;
  images: string[] | null;
  image_alt_text?: string; // Add alt text for main industry image
  is_active: boolean; // Changed from published to is_active to match API
  created_at: string;
  updated_at: string;
  tags: {
    id: number;
    name: string;
  }[];
  author_email: string;
  canonical_url: string;
}

export interface CreateIndustryData {
  name: string;
  description: string;
  meta_title: string;
  meta_description: string;
  tag_ids: number[];
  image_files?: File[];
  image_alt_text?: string; // Add alt text for main industry image
}