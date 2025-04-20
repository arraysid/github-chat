import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useGetAllProject() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data: projects, error } = await apiClient("/api/projects", {});

      if (error) throw error;

      return projects.data;
    },
  });
}
