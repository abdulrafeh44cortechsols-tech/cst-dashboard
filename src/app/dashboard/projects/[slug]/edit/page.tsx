"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { projectsDataService } from "@/services/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EditProjectForm } from "@/components/projects/EditProjectForm";
import Link from "next/link";

import { useEffect } from "react";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = params?.slug as string | undefined;

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", "slug", slugParam],
    queryFn: async () => {
      if (!slugParam) throw new Error("Missing project slug");
      if (/^\d+$/.test(slugParam)) {
        return projectsDataService.getProject(slugParam);
      }
      return projectsDataService.getProjectBySlug(slugParam);
    },
    enabled: !!slugParam,
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
  });

  // Update URL if loaded by ID
  useEffect(() => {
    if (project && slugParam && /^\d+$/.test(slugParam) && project.slug) {
      window.history.replaceState(null, "", `/dashboard/projects/${project.slug}/edit`);
    }
  }, [project, slugParam]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Edit Project</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          <Button asChild variant="blue">
            <Link href="/dashboard/projects">All Projects</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading && (
            <div className="text-muted-foreground">Loading project...</div>
          )}
          {isError && (
            <div className="text-red-500">Failed to load project. Please try again.</div>
          )}
          {!isLoading && project && (
            <EditProjectForm
              project={project}
              onCancel={() => router.push("/dashboard/projects")}
              onSaved={() => router.push("/dashboard/projects")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
