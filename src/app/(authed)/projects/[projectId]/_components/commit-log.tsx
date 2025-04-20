"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useParams } from "next/navigation";
import { useGetAllProject } from "../../_hooks/use-get-all-project";

export function CommitLog() {
  const params = useParams();
  const projectId = String(params.projectId);

  const { data: commits, isLoading } = useGetCommits();
  const { data: projects } = useGetAllProject();

  const currentProject = projects?.find((project) => project.id === projectId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(15)].map((_, i) => (
          <Skeleton key={i} className="h-[132px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4">
      {commits?.data.map((commit) => {
        const commitUrl = `${currentProject?.url}/commit/${commit.commitHash}`;
        const [title, ...description] = commit.commitMessage.split("\n");

        return (
          <Card key={commit.id} className="overflow-hidden hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <a
                  href={commitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-semibold break-words hover:underline sm:text-lg"
                >
                  {title}
                </a>
                <time className="text-muted-foreground shrink-0 text-sm">
                  {formatDistanceToNow(new Date(commit.commitDate))} ago
                </time>
              </div>
            </CardHeader>

            {description.length > 0 && (
              <CardContent className="-mt-2 pb-2">
                <pre className="text-muted-foreground font-sans text-sm break-words whitespace-pre-wrap">
                  {description.join("\n")}
                </pre>
              </CardContent>
            )}

            <CardContent className="pb-2">
              <div className="flex flex-col gap-2">
                {commit.summary.split("\n").map((line, i) => {
                  const [filePart, ...descParts] = line.split("]");
                  const fileName = filePart.replace("* [", "").trim();
                  const description = descParts.join("]").trim();

                  return (
                    <div key={i} className="flex flex-col gap-1.5">
                      {/* File names with guaranteed wrapping */}
                      <div className="-ml-0.5">
                        <span className="bg-muted text-muted-foreground inline-block rounded-md px-2 py-1 font-mono text-xs">
                          {fileName}
                        </span>
                      </div>

                      {/* Description with proper indentation */}
                      <p className="text-muted-foreground pl-2 text-sm break-words">
                        {description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-2 text-sm sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={commit.commitAuthorAvatar} />
                  <AvatarFallback>
                    {commit.commitAuthorName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium break-words">
                  {commit.commitAuthorName}
                </span>
              </div>
              <a
                href={commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:underline sm:ml-auto"
              >
                <code className="bg-muted rounded px-1.5 py-1 text-xs">
                  {commit.commitHash.slice(0, 7)}
                </code>
              </a>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

export function useGetCommits() {
  const params = useParams();
  const projectId = String(params.projectId);

  return useQuery({
    queryKey: ["commits", projectId],
    queryFn: async () => {
      const { data, error } = await apiClient(
        "/api/projects/commits/:projectId",
        { params: { projectId } },
      );

      if (error) throw error;

      return data;
    },
  });
}
