import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export function useGetAllProject() {
  const trpc = useTRPC();

  return useQuery(trpc.projects.getAll.queryOptions());
}
