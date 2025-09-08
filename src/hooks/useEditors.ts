import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { editorService } from "@/services/editors";
import type { Editor } from "@/types/types";
import { useEditorStore } from "@/stores";

export const useEditors = (enabled:boolean = true) => {
  const queryClient = useQueryClient();
  const { setEditors } = useEditorStore();

  const getEditorsList = useQuery<Editor[]>({
    queryKey: ["editors"],
    queryFn: editorService.getEditors,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled
  });

  // Store editors in Zustand store when data is fetched
  useEffect(() => {
    if (getEditorsList.data) {
      setEditors(getEditorsList.data);
    }
  }, [getEditorsList.data, setEditors]);

  const addEditor = useMutation({
    mutationFn: editorService.createEditor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editors"] });
    },
  });

  const editEditor = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { username: string; email: string; password:string };
    }) => editorService.updateEditor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editors"] });
    },
  });

  const removeEditor = useMutation({
    mutationFn: editorService.deleteEditor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editors"] });
    },
  });

  return {
    getEditorsList,
    addEditor,
    editEditor,
    removeEditor,
  };
};