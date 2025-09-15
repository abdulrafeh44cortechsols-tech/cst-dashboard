import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { projectsDataService } from "@/services/projects";
import type { Project, CreateProjectData } from "@/types/types";
import { useProjectStore } from "@/stores";

export const useProjects = () => {
  const queryClient = useQueryClient();
  const { setProjects } = useProjectStore();

  const getProjectsList = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: projectsDataService.getProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Store projects in Zustand store when data is fetched
  useEffect(() => {
    if (getProjectsList.data) {
      setProjects(getProjectsList.data);
    }
  }, [getProjectsList.data, setProjects]);

  const addProject = useMutation({
    mutationFn: (data: FormData | CreateProjectData) => projectsDataService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const editProject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData | CreateProjectData }) =>
      projectsDataService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const removeProject = useMutation({
    mutationFn: projectsDataService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return {
    getProjectsList,
    addProject,
    editProject,
    removeProject,
  };
}; 