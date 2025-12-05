"use client";

import Link from "next/link";
import { Delete, Edit, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { DeleteProjectModal } from "@/components/projects/DeleteProjectModal";
import { useState } from "react";
import { Project } from "@/types/types";

export default function ProjectsPage() {
  const router = useRouter();
  const { getProjectsList } = useProjects(1, 8);
  const { data, isLoading, isError } = getProjectsList;
  const projects = data?.projects || [];
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  console.log("projects data:", data);
  console.log("projects array:", projects);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Projects</h1>
        <Button variant="blue" asChild size="sm">
          <Link href="/dashboard/projects/new">
            <PlusCircle className=" h-4 w-4" />
            Add New Project
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground">
          Loading projects...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <Card
                  key={project.id}
                  className="w-full max-w-sm flex flex-col h-full"
                >
                  <div className="relative overflow-hidden group aspect-[400/360] flex-shrink-0">
                    <img
                      src={project.hero_image?.image || "/placeholder.svg"}
                      alt={project.hero_image?.alt_text || project.title || "Project"}
                      className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 min-h-[60px]">
                      {project.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <div className="px-[15px]">

                    <Badge variant={project.is_published ? "default" : "outline"} className="mb-2 ml-2">
                      {project.is_published ? "Published" : "Draft"}
                    </Badge>

                  </div>
                  <div className="mt-auto pt-4 px-6">
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.tags.slice(0, 3).map((tag: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="mb-4 space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(project.created_at).toLocaleDateString()}
                      </p>
                      {project.created_by && (
                        <p className="text-sm text-muted-foreground">
                          Author: <span className="font-medium">{project.created_by}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <CardFooter className="pt-0 flex justify-end gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        router.push(`/dashboard/projects/${project.slug}/edit`);
                      }}
                      className="text-gray-600 hover:text-gray-600"
                    >
                      <Edit className="w-3.5 h-3.5 text-gray-600" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeletingProject(project);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-500 hover:text-red-500"
                    >
                      <Trash2 color="red" className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                No projects found.
              </div>
            )}
          </div>

          {deletingProject && (
            <DeleteProjectModal
              project={deletingProject}
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
