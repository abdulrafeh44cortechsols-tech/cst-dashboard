import type { CreateBlogData, HeroSection, QuoteSection, InfoSection } from "@/types/types";

// export const exampleBlogData: CreateBlogData = {
//   "title": "Building a Modern Application with Next.js",
//   "slug": "building-a-modern-application-with-nextjs",
//   "content": "Modern web applications require robust architecture, performance optimization, and excellent user experience. In this comprehensive guide, we'll explore how to build scalable applications using Next.js and modern development practices.",
//   "published": false,
//   "tag_ids": [1, 3],
//   "image_files": [],
//   "meta_title": "Modern Web Application Development Guide",
//   "meta_description": "Learn how to build scalable, performant web applications using Next.js and modern development practices.",
//   "sections_data": {
//     "hero_section": {
//       "title": "Building a Modern Web Application",
//       "description": "Modern web applications require careful consideration of architecture, performance, and user experience. This guide will walk you through the essential concepts.",
//       "summary": "Learn the fundamentals",
//       "image": null
//     },
//     "quote_section": {
//       "summary": "Learn from industry experts",
//       "quotes": [
//         {
//           "title": "On readable code",
//           "description": "Clarity beats cleverness",
//           "quote": "Code is like humor. When you have to explain it, it's bad.",
//           "quoteusername": "Cory House"
//         },
//         {
//           "title": "Solve before coding",
//           "description": "Think first, type later",
//           "quote": "First, solve the problem. Then, write the code.",
//           "quoteusername": "John Johnson"
//         }
//       ]
//     },
//     "info_section": {
//       "title": "Development Best Practices",
//       "description": "Essential practices for building modern web applications",
//       "summary": "Follow these guidelines",
//       "summary_2": "Additional insights and advanced techniques",
//       "image": null
//     }
//   },
//   "hero_section": {
//     "title": "Building a Modern Web Application",
//     "description": "Modern web applications require careful consideration of architecture, performance, and user experience. This guide will walk you through the essential concepts.",
//     "summary": "Learn the fundamentals",
//     "image": null
//   },
//   "quote_section": {
//     "summary": "Learn from industry experts",
//     "quotes": [
//       {
//         "title": "On readable code",
//         "description": "Clarity beats cleverness",
//         "quote": "Code is like humor. When you have to explain it, it's bad.",
//         "quoteusername": "Cory House"
//       },
//       {
//         "title": "Solve before coding",
//         "description": "Think first, type later",
//         "quote": "First, solve the problem. Then, write the code.",
//         "quoteusername": "John Johnson"
//       }
//     ]
//   },
//   "info_section": {
//     "title": "Development Best Practices",
//     "description": "Essential practices for building modern web applications",
//     "summary": "Follow these guidelines",
//     "summary_2": "Additional insights and advanced techniques",
//     "image": null
//   }
// };

// Helper function to get default sections data structure
export const getDefaultBlogSectionsData = () => ({
  hero_section: {
    title: "",
    description: "",
    summary: "",
    image: null,
    image_alt_text: ""
  },
  quote_section: {
    summary: "",
    quotes: [
      {
        title: "",
        description: "",
        quote: "",
        quoteusername: ""
      }
    ]
  },
  info_section: {
    title: "",
    description: "",
    summary: "",
    summary_2: "",
    image: null,
    image_alt_text: ""
  }
});

// Helper function to get default hero section
export const getDefaultHeroSection = (): HeroSection => ({
  title: "",
  description: "",
  summary: "",
  image: null,
  image_alt_text: ""
});

// Helper function to get default quote section
export const getDefaultQuoteSection = (): QuoteSection => ({
  summary: "",
  quotes: [
    {
      title: "",
      description: "",
      quote: "",
      quoteusername: ""
    }
  ]
});

// Helper function to get default info section
export const getDefaultInfoSection = (): InfoSection => ({
  title: "",
  description: "",
  summary: "",
  summary_2: "",
  image: null,
  image_alt_text: ""
}); 