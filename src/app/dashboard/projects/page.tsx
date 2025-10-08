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
import Image from "next/image";

export default function ProjectsPage() {
  const router = useRouter();
  const { getProjectsList } = useProjects();
  const { data: projects, isLoading, isError } = getProjectsList;
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  console.log("projects", projects);

  function parseImageUrl(fullUrl: string | undefined) {
    if (!fullUrl || typeof fullUrl !== "string") return "/placeholder.svg";
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const parsedUrl = fullUrl.replace(/^http:\/\/localhost:7000/, baseUrl);
    console.log("parsedUrl:", parsedUrl);
    return parsedUrl;
  }

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
                  className="overflow-hidden flex pt-0 flex-col min-h-[400px]"
                >
                  <div className="relative overflow-hidden aspect-[400/360]">
                    <Image
                      src={parseImageUrl(project.image) || "/placeholder.svg"}
                      alt={project.name}
                      fill
                      className="w-full h-48 object-cover transition-transform duration-200 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
                  </div>

                  <div className="flex flex-col flex-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex flex-col items-start gap-2 w-full">
                        <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
                          {project.name}
                        </CardTitle>

                        <Badge
                          variant={project.published ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {project.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-3">
                        {project.description}
                      </CardDescription>

                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {project.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
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
