import { queryClient } from "@/components/providers";
import { apiClient } from "@/lib/api";
import { projectValidation } from "@/server/validation/project.validation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

export function useCreateProject() {
  return useMutation({
    mutationFn: async (values: z.infer<typeof projectValidation>) => {
      const { data, error } = await apiClient("@post/api/projects", {
        body: values,
      });

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project Added Successfully");
    },
  });
}
