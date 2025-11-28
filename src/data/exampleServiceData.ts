import type { CreateServiceData } from "@/types/types";

export const exampleServiceData: CreateServiceData = {
  "title": "UI/UX Design Service",
  "description": "Professional UI/UX design for web and mobile applications.",
  "is_active": true,
  "meta_title": "UI/UX Design Service",
  "slug": "ui-ux-design-service",
  "meta_description": "User-centered design, research, and prototyping for modern applications.",
  "sections_data": {
    "hero_section": {
      "title": "Design That Delivers",
      "description": "Beautiful, usable, effective designs that drive business results.",
      "sub_sections": [
        { "title": "200+ Projects", "description": "Proven results across industries" },
        { "title": "98% Satisfaction", "description": "Clients love the outcomes" }
      ]
    },
    "about_section": {
      "title": "About This Service",
      "description": "Strategy + execution from research to delivery.",
      "sub_sections": [
        { "title": "User‑Centered", "description": "Research & testing driven" },
        { "title": "Systematic", "description": "Design systems approach" },
        { "title": "Measurable", "description": "Business impact focused"}
      ]
    },
    "why_choose_us_section": {
      "title": "Why Choose Us",
      "description": "Trusted expertise and proven process.",
      "sub_sections": [
        { "title": "Proven Track Record", "description": "200+ successful deliveries" },
        { "title": "Cross‑Industry", "description": "Fintech, SaaS, Health, Ecommerce" },
        { "title": "End‑to‑End", "description": "Research to launch" },
        { "title": "Agile & Fast", "description": "Rapid iterations" },
        { "title": "Accessible", "description": "WCAG‑aligned designs" },
        { "title": "Ongoing Support", "description": "Post‑launch improvements" }
      ]
    },
    "what_we_offer_section": {
      "title": "What We Offer",
      "description": "Complete coverage for product design.",
      "sub_sections": [
        { "title": "Research & Strategy", "points": ["User Research", "Competitive Analysis", "Information Architecture", "User Journey Mapping"] },
        { "title": "Design & Prototyping", "points": ["Wireframing", "Visual Design", "Interactive Prototypes", "Design Systems"] },
        { "title": "Testing & Optimization", "points": ["Usability Testing", "A/B Testing", "Accessibility Audits"] },
        { "title": "Dev Collaboration", "points": ["Design Specifications", "Handoff Documentation", "Quality Assurance"] }
      ]
    },
    "perfect_business_section": {
      "title": "Perfect For",
      "description": "Tailored for different business stages.",
      "sub_sections": [
        { "title": "Startups", "description": "Validate & launch" },
        { "title": "Enterprises", "description": "Scale and standardize" },
        { "title": "SaaS Products", "description": "Drive adoption" },
        { "title": "Mobile Apps", "description": "Delight on devices" },
        { "title": "Web Platforms", "description": "Convert & retain" }
      ]
    },
    "design_section": {
      "title": "Our Design Process",
      "description": "Repeatable, transparent, outcomes‑focused.",
      "sub_sections": [
        { "title": "Discovery", "description": "Goals, users, context" },
        { "title": "Strategy", "description": "Personas, journeys, IA"},
        { "title": "Design", "description": "Wireframes to hi‑fi"},
        { "title": "Validate", "description": "Test & iterate" }
      ]
    },
    "team_section": {
      "title": "Meet the Team",
      "description": "Experienced, collaborative, accountable.",
      "sub_sections": [
        {
          "name": "Sarah Chen",
          "designation": "Lead UX Designer",
          "experience": "8+ years",
          "summary": "Research‑driven strategy and IA."
        },
        {
          "name": "Leslie Alexander",
          "designation": "UX Researcher",
          "experience": "5+ years",
          "summary": "Usability testing and analytics."
        },
        {
          "name": "Marcus Rodriguez",
          "designation": "Senior UI Designer",
          "experience": "6+ years",
          "summary": "Visual systems and prototyping."
        }
      ]
    },
    "tools_used_section": {
      "title": "Tools We Use",
      "description": "Best‑in‑class toolchain.",
      "sub_sections": [
        { "title": "Design", "description": "Figma, Adobe XD, Sketch" },
        { "title": "Research", "description": "Maze, Hotjar, GA" },
        { "title": "Collaboration", "description": "Miro, Notion, Slack" },
        { "title": "Dev Handoff", "description": "Zeplin, Storybook, GitHub" }
      ]
    },
    "client_feedback_section": {
      "title": "What Clients Say",
      "description": "Real feedback from our partners.",
      "sub_sections": [
        { "name": "Crystal Maiden", "designation": "UI/UX Designer", "comment": "Top‑notch quality and organized files.", "stars": 5 },
        { "name": "Dazzle Healer", "designation": "Frontend Developer", "comment": "Exceeded expectations and easy to implement.", "stars": 4 },
        { "name": "Roshan Pro Max", "designation": "UI/UX Designer", "comment": "Perfect for quick prototyping.", "stars": 5 }
      ]
    }
  }
};

// Helper function to get default sections data structure
export const getDefaultSectionsData = () => ({
  hero_section: {
    title: "",
    description: "",
    sub_sections: [{ title: "", description: "" }]
  },
  about_section: {
    title: "",
    description: "",
    sub_sections: [{ title: "", description: "" }]
  },
  why_choose_us_section: {
    title: "",
    description: "",
    sub_sections: [{ title: "", description: "" }]
  },
  what_we_offer_section: {
    title: "",
    description: "",
    sub_sections: [{ title: "", points: [""] }]
  },
  perfect_business_section: {
    title: "",
    description: "",
    sub_sections: [{ title: "", description: "" }]
  },
  design_section: {
    title: "",
    description: "",
    sub_sections: [{ title: "", description: "" }]
  },
  team_section: {
    title: "",
    description: "",
    sub_sections: [{ name: "", designation: "", experience: "", summary: "" }]
  },
  tools_used_section: {
    title: "",
    description: "",
    sub_sections: [{ title: "", description: "" }]
  },
  client_feedback_section: {
    title: "",
    description: "",
    sub_sections: [{ name: "", designation: "", comment: "", stars: 5 }]
  }
}); 