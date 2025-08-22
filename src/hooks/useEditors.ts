import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { editorService } from "@/services/editors";
import { mockEditors } from "@/data/mockEditorsList";
import type { Editor } from "@/types/editor";

export const useEditors = () => {
  const queryClient = useQueryClient();

  const getEditorsList = useQuery<Editor[]>({
    queryKey: ["editors"],
    queryFn: editorService.getEditors,
    initialData: mockEditors,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

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
      data: { name: string; email: string; role: Editor["role"] };
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
