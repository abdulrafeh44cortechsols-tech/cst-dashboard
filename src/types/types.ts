export interface FeaturedImage {
  id: number;
  image: string;
  alt_text: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: FeaturedImage | null;
  tags: string[]; // Changed to array of strings
  is_published: boolean; // Changed from 'published' to 'is_published'
  created_at: string;
  created_by: string | null;

  // Legacy fields for backward compatibility with forms
  images?: string[] | null;
  image_files?: File[] | null;
  published?: boolean; // Keep for form compatibility
  updated_at?: string;
  summary?: string;
  author_email?: string;
  tag_ids?: number[];
  meta_title?: string;
  meta_description?: string;
  og_image_file?: string | null;
  og_image?: string | null;
  content?: string;
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
  excerpt: string;
  content: string;
  featured_image: number | null; // Image ID from media API
  tags: number[]; // Tag IDs
  is_published: boolean;
  meta_title?: string;
  meta_description?: string;
}


export interface Service {
  id: string;
  title: string; // API now uses 'title'
  name?: string; // Keep for backward compatibility
  slug: string;
  description: string;
  meta_title?: string;
  meta_description?: string;
  images?: string[] | null;
  image_alt_texts?: string[]; // Add alt text for main service images
  is_published: boolean;
  hero_image: {
    id: number;
    image: string;
    alt_text: string;
  } | null;
  projects_delivered?: number;
  clients_satisfaction?: number;
  bullet_points?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string; // Author username from API
  author_name?: string; // Legacy field
  author_email?: string;
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
  description?: string; // Optional - some sections use points instead
  points?: string[];
  icon?: string; // URL of sub-section icon image
  image_alt_text?: string; // Add alt text for sub-section images/icons
  alt_text?: string; // Alternative property name for alt text
  iconAltText?: string; // Alternative property name for icon alt text
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
  image?: string; // Team member image URL
  image_alt_text?: string; // Add alt text for team member images
  alt_text?: string; // Alternative property name for alt text
  imageAltText?: string; // Alternative property name for image alt text
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
  image?: string; // Client feedback image URL
  image_alt_text?: string; // Add alt text for client feedback images
  alt_text?: string; // Alternative property name for alt text
  imageAltText?: string; // Alternative property name for image alt text
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
  password: string
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
  title: string; // Changed from 'name' to 'title'
  slug: string;
  excerpt: string; // Changed from 'description' to 'excerpt'
  hero_image: FeaturedImage | null; // Changed from 'image' string to hero_image object
  is_published: boolean; // Changed from 'published' to 'is_published'
  created_at: string;
  created_by?: string | null; // Author username from API
  tags: string[]; // Changed to array of strings (tag names)

  // Legacy fields for backward compatibility
  name?: string; // Keep for form compatibility
  description?: string; // Keep for form compatibility
  image?: string; // Keep for form compatibility
  published?: boolean; // Keep for form compatibility
  updated_at?: string;
  author_email?: string;
  canonical_url?: string;
  sections_data?: Record<string, any>;
}

export interface CreateProjectData {
  // Basic fields
  title: string;
  excerpt: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;

  // Images
  hero_image?: number; // Image ID
  icons?: number[]; // Array of icon IDs

  // Tags
  tags: number[]; // Array of tag IDs

  // Challenge section
  challenge_title?: string;
  challenge_description?: string;

  // Project Goal section
  project_goal_title?: string;
  project_goal_content?: {
    goal: string;
    icon: string; // Image URL
    alt_text: string;
  }[];
  project_goal_section?: {
    intro: string;
    items: {
      title: string;
      desc: string;
      points?: string[]; // Array of points
    }[];
  };

  // Technology section
  technology_title?: string;
  technology_description?: string;
  technology_content?: {
    name: string;
    icons: { url: string; alt_text: string }[]; // Array of icon objects
  }[];
}

export interface Industry {
  id: number;
  title: string;
  slug: string;
  description: string;
  industry_category: string;
  category_icon: {
    id: number;
    image: string;
    alt_text: string;
  } | null;
  meta_title: string;
  meta_description: string;
  projects_count: number;
  reviews_count: number;
  industries_count: number;
  hero_image: {
    id: number;
    image: string;
    alt_text: string;
  } | null;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
  tags: string[];
  created_by?: number;

  // Section data
  projects_stats_section?: Array<{
    name: string;
    count: number;
  }>;
  challenge_section?: {
    title: string;
    items: string[]; // Array of point strings
  };
  expertise_section?: {
    title: string;
    description: string;
    sub_sections: Array<{
      title: string;
      description: string;
      image: string | null; // Image URL
      image_alt_text: string;
    }>;
  };
  what_sets_us_apart_section?: {
    title: string;
    description: string;
    sub_sections: Array<{
      title: string;
      description: string;
      image: string | null; // Image URL
      image_alt_text: string;
    }>;
  };
  we_build_section?: {
    title: string;
    description: string;
    sub_sections: string[]; // Array of point strings
  };
}

export interface CreateIndustryData {
  title: string;
  slug: string;
  description: string;
  industry_category?: string;
  meta_title: string;
  meta_description: string;
  is_published?: boolean;

  // Stats
  projects_count?: number;
  reviews_count?: number;
  industries_count?: number;

  // Tags (array of IDs)
  tags?: number[];

  // Images (send IDs)
  hero_image?: number | null;
  category_icon?: number | null;

  // Section data
  projects_stats_section?: Array<{ name: string; count: number }>;
  challenge_section?: {
    title: string;
    items: string[]; // Array of point strings
  };
  expertise_section?: {
    title: string;
    description: string;
    sub_sections: Array<{
      title: string;
      description: string;
      image: string | null; // Image URL
      image_alt_text: string;
    }>;
  };
  what_sets_us_apart_section?: {
    title: string;
    description: string;
    sub_sections: Array<{
      title: string;
      description: string;
      image: string | null; // Image URL
      image_alt_text: string;
    }>;
  };
  we_build_section?: {
    title: string;
    description: string;
    sub_sections: string[]; // Array of point strings
  };
}