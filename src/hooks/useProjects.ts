import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { projectsDataService } from "@/services/projects";
import type { Project, CreateProjectData } from "@/types/types";
import { useProjectStore } from "@/stores";

export const useProjects = (page: number = 1, limit: number = 8, enableFetch: boolean = true) => {
  const queryClient = useQueryClient();
  const { setProjects } = useProjectStore();

  const getProjectsList = useQuery({
    queryKey: ["projects", page, limit],
    queryFn: async () => {
      try {
        // Fetch paginated data from backend
        const paginated = await projectsDataService.getProjects(page, limit);

        const projects: Project[] = Array.isArray(paginated?.results)
          ? paginated.results
          : [];

        const count = typeof paginated?.count === "number" ? paginated.count : projects.length;

        // Infer total pages from backend data
        let inferredTotalPages = 1;
        if (projects.length > 0) {
          if (paginated.next) {
            // Not the last page
            inferredTotalPages = Math.max(1, Math.ceil(count / projects.length));
          } else {
            // Last page -> total pages equals current page index
            inferredTotalPages = Math.max(1, page);
          }
        }

        return {
          projects: projects,
          totalPages: inferredTotalPages,
          allProjects: projects,
        };
      } catch (error) {
        console.error("API failed, using empty projects...", error);
        return {
          projects: [],
          totalPages: 0,
          allProjects: [],
        };
      }
    },
    enabled: enableFetch, // Only fetch if explicitly enabled
    staleTime: 0, // Always consider data stale to refetch after invalidation
    gcTime: 1000 * 60 * 15, // 15 minutes - keep in cache longer
    retry: 0,
    refetchOnWindowFocus: false, // Don't refetch when switching tabs
    refetchOnMount: true, // Refetch when component mounts if data is stale
  });

  // Store projects in Zustand store when data is fetched
  useEffect(() => {
    if (getProjectsList.data?.allProjects) {
      setProjects(getProjectsList.data.allProjects);
    }
  }, [getProjectsList.data, setProjects]);

  const addProject = useMutation({
    mutationFn: (data: FormData | CreateProjectData) => projectsDataService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });

  const editProject = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: FormData | CreateProjectData }) =>
      projectsDataService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
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