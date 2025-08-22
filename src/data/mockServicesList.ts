import { Service } from "@/types/service";
import { Code, Cloud, Database, Layout } from "lucide-react";


export const services: Service[] = [
  {
    id: "1",
    title: "Web Development",
    description: "Building modern, responsive, and scalable web applications.",
    icon: Code,
    status: "Active",
  },
  {
    id: "2",
    title: "UI/UX Design",
    description: "Crafting intuitive and engaging user interfaces and experiences.",
    icon: Layout,
    status: "Active",
  },
  {
    id: "3",
    title: "Database Management",
    description: "Designing and optimizing robust database solutions.",
    icon: Database,
    status: "Active",
  },
  {
    id: "4",
    title: "Cloud Hosting & Deployment",
    description: "Setting up and managing cloud infrastructure for your applications.",
    icon: Cloud,
    status: "Inactive",
  },
]