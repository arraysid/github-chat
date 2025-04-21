import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function useGetCommits() {
  const trpc = useTRPC();
  const params = useParams();
  const projectId = String(params.projectId);

  return useQuery(trpc.projects.getAllCommits.queryOptions({ projectId }));
}
