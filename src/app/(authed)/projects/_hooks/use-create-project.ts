import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useCreateProject() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: async ({ id }) => {
        await queryClient.invalidateQueries(
          trpc.projects.getAll.queryOptions(),
        );
        router.replace(`/projects/${id}`);
      },
    }),
  );
}
