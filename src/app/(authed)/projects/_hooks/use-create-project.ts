import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateProject() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.projects.getAll.queryOptions(),
        );
      },
    }),
  );
}
