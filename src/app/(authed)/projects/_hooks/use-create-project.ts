import { useTRPC } from "@/lib/trpc";
import { useMutation } from "@tanstack/react-query";

export function useCreateProject() {
  const trpc = useTRPC();

  return useMutation(trpc.projects.create.mutationOptions());
}
